from flask import request, abort
from datetime import datetime, date, timedelta
from ..models import (PublishedStudyPlan, PersonalStudyPlan, StudyPlanSemester,
                      User, AcademicPlan, Degree, Programme, viewed_study_plan, db)

# API: /studyplan/publish, GET
# Get a collection of published study plans
def get_published_study_plans():
    # ordering can be 'mostRecent', 'mostLikes', 'relevant', 'trending'
    # default ordering is 'mostRecent'
    ordering = request.args.get('ordering')
    if ordering == 'mostLikes':
        published_study_plans = PublishedStudyPlan.query.order_by(
            PublishedStudyPlan.num_of_likes.desc()
        ).all()
    elif ordering == 'trending':
        # Delete viewership data that is longer than 30 days ago
        delete_stmt = viewed_study_plan.delete().where(
            viewed_study_plan.c.date_viewed < date.today() - timedelta(days=30)
        )
        db.session.execute(delete_stmt)
        db.session.commit()
        
        # Get all study plans
        published_study_plans = PublishedStudyPlan.query.all()
        # Calculate trend scores for all study plans
        for index, study_plan in enumerate(published_study_plans):
            trend_score = study_plan.calculate_trend_score()
            published_study_plans[index] = (study_plan, trend_score)
        # Sort by trend scores
        published_study_plans.sort(key = lambda x: x[1], reverse=True)
        # Return only a list of study plans
        published_study_plans = list(map(lambda x: x[0], published_study_plans))
    elif ordering == 'relevancy':
        # Get user
        user_id = request.args.get('user_id')
        if not user_id:
            abort(400, 'User ID is required for ordering by relevancy')
        user = User.query.get(user_id)
        if not user:
            abort(404, f'User <ID: {user_id}> not found')

        # Get all study plans
        published_study_plans = PublishedStudyPlan.query.all()
        # Calculate relevancy scores for all study plans
        for index, study_plan in enumerate(published_study_plans):
            relevancy_score = study_plan.calculate_relevancy_score(user)
            published_study_plans[index] = (study_plan, relevancy_score)
        # Sort by relevancy score
        published_study_plans.sort(key = lambda x: x[1], reverse=True)
        # Return only a list of study plans
        published_study_plans = list(map(lambda x: x[0], published_study_plans))
    else:
        published_study_plans = PublishedStudyPlan.query.order_by(
            PublishedStudyPlan.date_updated.desc()
        ).all()

    user_id = request.args.get('user_id')
    if user_id:
        published_study_plans = list(map(
            lambda study_plan: 
                get_info_from_published_study_plan_object(study_plan, user_id), 
            published_study_plans
        ))
    else:
        published_study_plans = list(map(
            lambda study_plan: study_plan.toJSON(), 
            published_study_plans
        ))
    return {"published_study_plans": published_study_plans}, 200


# Not an API call, helper function
# Get information from a Published Study Plan Object
def get_info_from_published_study_plan_object(published_study_plan, user_id):
    favourited_by = published_study_plan.favourited_by # List of users
    liked_by = published_study_plan.liked_by # List of users

    is_favourited_by = False
    for user in favourited_by:
        if str(user.azure_ad_oid) == user_id:
            is_favourited_by = True
    
    is_liked_by = False
    for user in liked_by:
        if str(user.azure_ad_oid) == user_id:
            is_liked_by = True

    study_plan_info = published_study_plan.toJSON()
    study_plan_info["is_favourited_by"] = is_favourited_by
    study_plan_info["is_liked_by"] = is_liked_by

    return study_plan_info


# API: /studyplan/publish/{study_plan_id}, GET
# Get information on an existing published study plan
def get_published_study_plan_information(study_plan_id):
    study_plan = PublishedStudyPlan.query.get(study_plan_id)
    if not study_plan:
        abort(404, f"Published study plan with id {study_plan_id} not found")

    user_id = request.args.get('user_id')
    if user_id:
        return get_info_from_published_study_plan_object(study_plan, user_id)
    else:
        return study_plan.toJSON(), 200


# API: /studyplan/publish/{study_plan_id}, POST
# Create a published study plan from an existing personal study plan
def publish_study_plan(study_plan_id, body):
    personal_study_plan = PersonalStudyPlan.query.get(study_plan_id)
    if not personal_study_plan:
        abort(404, f'Personal Study Plan with id <{study_plan_id}> not found')

    if personal_study_plan.published_version is not None:
        # study plan is already published
        abort(409, 
            f'Personal Study Plan with id <{study_plan_id}> is already published')

    title = body.get('title', None)
    description = body.get('description', None)
    academic_plan_info = body.get('academic_plan_info', None)

    if title is None or description is None or academic_plan_info is None:
        abort(400, "Title, description, or academic plan information not inputted")
    
    # check that first degree is given and check validity
    first_degree_id = academic_plan_info.get('first_degree_id', None)
    if first_degree_id is None:
        abort(400, 'First degree not inputted')
    first_degree_obj = Degree.query.get(first_degree_id)
    if not first_degree_obj:
        abort(404, f'Degree <ID:{first_degree_id}> not found')
    
    new_published_study_plan = PublishedStudyPlan(
        title = title,
        description = description,
        creator_id = personal_study_plan.creator_id,
        personal_study_plan_id = personal_study_plan.id
    )

    db.session.add(new_published_study_plan)
    personal_study_plan.published_version = new_published_study_plan
    db.session.commit()

    new_published_study_plan_id = new_published_study_plan.id
    new_academic_plan = AcademicPlan(
        published_study_plan_id=new_published_study_plan_id,
        first_degree_id=first_degree_id
    )
    db.session.add(new_academic_plan)
    update_academic_plan_obj(new_academic_plan, academic_plan_info)

    # Duplicate semesters
    # Array of StudyPlanSemester objects
    personal_semesters = personal_study_plan.semesters 
    for semester in personal_semesters:
        clone_semester(semester, new_published_study_plan.id, True)

    return new_published_study_plan.toJSON(), 200


# Not an API call
# Method to clone a semester to a study plan
def clone_semester(semester, study_plan_id, is_published):
    # takes in semester object, not semester_id

    if is_published:
        new_semester = StudyPlanSemester(
            semester_number = semester.semester_number,
            total_units = semester.total_units,
            published_study_plan_id = study_plan_id,
        )
    else:
        new_semester = StudyPlanSemester(
            semester_number = semester.semester_number,
            total_units = semester.total_units,
            personal_study_plan_id = study_plan_id,
        )

    # Duplicate courses
    for course in semester.courses:
        new_semester.courses.append(course)

    db.session.add(new_semester)
    db.session.commit()
    return new_semester


# API: /studyplan/publish/{study_plan_id}, PUT
# Update an existing published study plan
def update_published_study_plan(study_plan_id, body):
    published_study_plan = PublishedStudyPlan.query.get(study_plan_id)
    if not published_study_plan:
        abort(404, f'Published Study Plan with id <{study_plan_id}> not found')

    title = body.get('title', None)
    description = body.get('description', None)
    personal_study_plan_id = body.get('personal_study_plan_id', None)
    academic_plan_info = body.get('academic_plan_info', None)

    if title is None or description is None or personal_study_plan_id is None or academic_plan_info is None:
        abort(400, 'Some information not passed in')
    
    # Update title and description
    published_study_plan.title = title
    published_study_plan.description = description

    # Update semesters
    published_study_plan.semesters = []
    personal_study_plan = PersonalStudyPlan.query.get(personal_study_plan_id)
    if not personal_study_plan:
        abort(404, f'Personal Study Plan with id <{personal_study_plan_id}> not found')
    
    # Array of StudyPlanSemester objects
    personal_semesters = personal_study_plan.semesters 
    for semester in personal_semesters:
        clone_semester(semester, study_plan_id, True)

    # Update academic plan
    academic_plan_obj = published_study_plan.academic_plan
    if academic_plan_obj is None:
        first_degree_id = academic_plan_info.get('first_degree_id', None)
        if first_degree_id is None:
            abort(400, 'First degree not inputted')
        first_degree_obj = Degree.query.get(first_degree_id)
        if not first_degree_obj:
            abort(404, f'Degree <ID:{first_degree_id}> not found')

        academic_plan_obj = AcademicPlan(
            published_study_plan_id=study_plan_id,
            first_degree_id=first_degree_id
        )
        db.session.add(academic_plan_obj)
    update_academic_plan_obj(academic_plan_obj, academic_plan_info)

    published_study_plan.date_updated = datetime.utcnow()
    db.session.commit()

    return published_study_plan.toJSON(), 200


# API: /studyplan/publish/copy, POST
# Create a copy of an existing published study plan
def create_study_plan_copy(body):
    # Get required information from request body
    published_study_plan_id = body.get("published_study_plan_id", None)
    user_id = body.get("user_id", None)
    if not published_study_plan_id or not user_id:
        abort(400, 'Published study plan id or user id not passed in')
    
    # Get published study plan to copy from
    published_study_plan = PublishedStudyPlan.query.get(published_study_plan_id)
    if not published_study_plan:
        abort(404, 
            f'Published Study Plan with id <{published_study_plan_id}> not found')

    # Create a new personal study plan
    new_personal_study_plan = PersonalStudyPlan(
        title = published_study_plan.title,
        creator_id = user_id
    )
    db.session.add(new_personal_study_plan)
    db.session.commit()

    # Duplicate semesters
    # Array of StudyPlanSemester objects
    original_semesters = published_study_plan.semesters 
    for semester in original_semesters:
        clone_semester(semester, new_personal_study_plan.id, False)
    
    return new_personal_study_plan.toJSON(), 200
    

# API: /studyplan/favourite/{user_id}, GET
# Get all favourited published study plans
def get_favourited_published_study_plans(user_id):
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')
    
    favourited_study_plans = user.favourited_study_plans
    favourited_study_plans = list(map(
        lambda study_plan: 
            get_info_from_published_study_plan_object(study_plan, user_id), 
        favourited_study_plans
    ))
    return {"favourited_study_plans": favourited_study_plans}, 200


# API: /studyplan/favourite/{user_id}, POST
# Favourite an existing published study plan
def favourite_a_study_plan(user_id, body):
    published_study_plan_id = body.get('published_study_plan_id', None)
    if published_study_plan_id is None:
        abort(400, 'Published study plan id not inputted')

    published_study_plan = PublishedStudyPlan.query.get(published_study_plan_id)
    if not published_study_plan:
        abort(404, f'Published study plan <ID: {published_study_plan_id}> not found')
    
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')

    user.favourited_study_plans.append(published_study_plan)
    db.session.commit()

    return {"message": "Successfully favourited a published study plan"}, 204


# API: /studyplan/favourite/{user_id}, DELETE
# Unfavourite an existing published study plan
def unfavourite_a_study_plan(user_id):
    published_study_plan_id = request.args.get('published_study_plan_id')
    if published_study_plan_id is None:
        abort(400, 'Published study plan id not inputted')

    published_study_plan = PublishedStudyPlan.query.get(published_study_plan_id)
    if not published_study_plan:
        abort(404, f'Published study plan <ID: {published_study_plan_id}> not found')
    
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')

    try:
        user.favourited_study_plans.remove(published_study_plan)
        db.session.commit()
    except ValueError:
        abort(409, 
            (f'Published study plan <ID:{published_study_plan_id}> '
             + f'not favourited by user <ID {user_id}>'))

    return {"message": "Successfully unfavourited a published study plan"}, 204


# API: /studyplan/like/{user_id}, GET
# Get all liked published study plans
def get_liked_published_study_plans(user_id):
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')
    
    liked_study_plans = user.liked_study_plans
    liked_study_plans = list(map(
        lambda study_plan: 
            get_info_from_published_study_plan_object(study_plan, user_id), 
        liked_study_plans
    ))
    return {"liked_study_plans": liked_study_plans}, 200


# API: /studyplan/like/{user_id}, POST
# Like an existing published study plan
def like_a_study_plan(user_id, body):
    published_study_plan_id = body.get('published_study_plan_id', None)
    if published_study_plan_id is None:
        abort(400, 'Published study plan id not inputted')

    published_study_plan = PublishedStudyPlan.query.get(published_study_plan_id)
    if not published_study_plan:
        abort(404, f'Published study plan <ID: {published_study_plan_id}> not found')
    
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')

    if published_study_plan in user.liked_study_plans:
        abort(409, (f'Published study plan <ID:{published_study_plan_id}> '
                    + 'already liked by user <ID {user_id}>'))
    
    user.liked_study_plans.append(published_study_plan)
    published_study_plan.num_of_likes += 1
    db.session.commit()

    return {"message": "Successfully liked a published study plan"}, 204


# API: /studyplan/like/{user_id}, DELETE
# Unlike an existing published study plan
def unlike_a_study_plan(user_id):
    published_study_plan_id = request.args.get('published_study_plan_id')
    if published_study_plan_id is None:
        abort(400, 'Published study plan id not inputted')

    published_study_plan = PublishedStudyPlan.query.get(published_study_plan_id)
    if not published_study_plan:
        abort(404, f'Published study plan <ID: {published_study_plan_id}> not found')
    
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')

    try:
        user.liked_study_plans.remove(published_study_plan)
        published_study_plan.num_of_likes -= 1
        db.session.commit()
    except ValueError:
        abort(409, (f'Published study plan <ID:{published_study_plan_id}> ' 
                    + 'not liked by user <ID {user_id}>'))

    return {"message": "Successfully unliked a published study plan"}, 204


# API: /studyplan/view, POST
# Add view to published study plan
def add_viewership(body):
    user_id = body.get('user_id', None)
    published_study_plan_id = body.get('published_study_plan_id', None)

    if not user_id or not published_study_plan_id:
        abort(400, 'User id or published study plan id not inputted')
    
    published_study_plan = PublishedStudyPlan.query.get(published_study_plan_id)
    if not published_study_plan:
        abort(404, f'Published study plan <ID: {published_study_plan_id}> not found')
    
    user = User.query.get(user_id)
    if not user:
        abort(404, f'User <ID: {user_id}> not found')
    
    user.viewed_study_plans.append(published_study_plan)
    db.session.commit()

    return {"message": "Successfully viewed a published study plan"}, 204


# Not an API method
def update_academic_plan_obj(academic_plan, body):
    # get information from request body
    first_degree_id = body.get('first_degree_id', None)
    second_degree_id = body.get('second_degree_id', False)
    second_major = body.get('second_major', None)
    minors_id_list = body.get('minors_id_list', None)
    special_programmes_id_list = body.get('special_programmes_id_list', None)

    # check validity of information and update the academic plan
    if first_degree_id is not None:
        first_degree_obj = Degree.query.get(first_degree_id)
        if not first_degree_obj:
            abort(404, f'Degree <ID:{first_degree_id}> not found')
        academic_plan.first_degree_id = first_degree_id
    
    if second_degree_id != False:
        if second_degree_id is None:
            academic_plan.second_degree_id = None
        else:
            second_degree_obj = Degree.query.get(second_degree_id)
            if not second_degree_obj:
                abort(404, f'Degree <ID:{second_degree_id}> not found')
            academic_plan.second_degree_id = second_degree_id

    if second_major is not None:
        academic_plan.second_major = second_major

    if minors_id_list is not None:
        academic_plan.minors = []
        for minor_id in minors_id_list:
            minor_obj = Programme.query.get(minor_id)
            if not minor_obj:
                abort(404, f'Minor <ID:{minor_id}> not found')
            try:
                academic_plan.minors.append(minor_obj)
            except ValueError:
                abort(409, 'Input is not a minor or maximum number of minors exceeded')
    
    if special_programmes_id_list is not None:
        academic_plan.special_programmes = []
        for special_programme_id in special_programmes_id_list:
            special_programme_obj = Programme.query.get(special_programme_id)
            if not special_programme_obj:
                abort(404, f'Special programme <ID:{special_programme_id}> not found')
            try:
                academic_plan.special_programmes.append(special_programme_obj)
            except ValueError:
                abort(409, 'Input is a minor, not a special programme')
    
    db.session.commit()
