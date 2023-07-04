from flask import abort
from datetime import datetime
from ..models import PublishedStudyPlan, PersonalStudyPlan, StudyPlanSemester, db

# API: /studyplan/publish, GET
# Get a collection of published study plans
def get_published_study_plans():
    published_study_plans = PublishedStudyPlan.query.all()
    published_study_plans = list(map(lambda study_plan: study_plan.toJSON(), published_study_plans))
    return {"published_study_plans": published_study_plans}, 200


# API: /studyplan/publish/{study_plan_id}, GET
# Get information on an existing published study plan
def get_published_study_plan_information(study_plan_id):
    study_plan = PublishedStudyPlan.query.get(study_plan_id)
    if not study_plan:
        abort(404, f"Published study plan with id {study_plan_id} not found")
    return study_plan.toJSON(), 200


# API: /studyplan/publish/{study_plan_id}, POST
# Create a published study plan from an existing personal study plan
def publish_study_plan(study_plan_id, body):
    personal_study_plan = PersonalStudyPlan.query.get(study_plan_id)
    if not personal_study_plan:
        abort(404, f'Personal Study Plan with id <{study_plan_id}> not found')

    if personal_study_plan.published_version is not None:
        # study plan is already published
        abort(409, f'Personal Study Plan with id <{study_plan_id}> is already published')

    title = body.get('title', None)
    description = body.get('description', None)

    if title is None or description is None:
        abort(400, "Title or description not inputted")
    
    new_published_study_plan = PublishedStudyPlan(
        title = title,
        description = description,
        creator_id = personal_study_plan.creator_id,
        personal_study_plan_id = personal_study_plan.id
    )

    db.session.add(new_published_study_plan)
    personal_study_plan.published_version = new_published_study_plan
    db.session.commit()

    # Duplicate semesters
    personal_semesters = personal_study_plan.semesters # Array of StudyPlanSemester objects
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

    if title is None or description is None or personal_study_plan_id is None:
        abort(400, 'Some information not passed in')
    
    published_study_plan.title = title
    published_study_plan.description = description

    # Update semesters
    published_study_plan.semesters = []
    personal_study_plan = PersonalStudyPlan.query.get(personal_study_plan_id)
    if not personal_study_plan:
        abort(404, f'Personal Study Plan with id <{personal_study_plan_id}> not found')
    
    personal_semesters = personal_study_plan.semesters # Array of StudyPlanSemester objects
    for semester in personal_semesters:
        clone_semester(semester, study_plan_id, True)

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
        abort(404, f'Published Study Plan with id <{published_study_plan_id}> not found')

    # Create a new personal study plan
    new_personal_study_plan = PersonalStudyPlan(
        title = published_study_plan.title,
        creator_id = user_id
    )
    db.session.add(new_personal_study_plan)
    db.session.commit()

    # Duplicate semesters
    original_semesters = published_study_plan.semesters # Array of StudyPlanSemester objects
    for semester in original_semesters:
        clone_semester(semester, new_personal_study_plan.id, False)
    
    return new_personal_study_plan.toJSON(), 200
    

# TODO: Work on the these methods
# API: /studyplan/favourite/{user_id}, GET
# Get all favourited published study plans

# API: /studyplan/favourite/{user_id}, POST
# Favourite an existing published study plan

# API: /studyplan/like/{user_id}, GET
# Get all liked published study plans

# API: /studyplan/like/{user_id}, POST
# Like an existing published study plan