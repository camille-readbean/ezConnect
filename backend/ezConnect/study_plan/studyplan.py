from flask import abort
from datetime import datetime
from ezConnect.models import User, PersonalStudyPlan, PublishedStudyPlan, StudyPlanSemester, Course, db
from .study_plan_semester import create_semester

# Create a new study plan
def create_study_plan(body):
    creator_id=body['creator_id']

    user = User.query.get(creator_id)

    if not user:
        abort(404, f"User with id {creator_id} not found")

    new_study_plan = PersonalStudyPlan(
        creator_id=creator_id
    )
    db.session.add(new_study_plan)
    db.session.commit()
    for i in range(8):
        create_semester(new_study_plan.id)
    return {"study_plan_id": new_study_plan.id}, 200


# Read a particular personal study plan
def get_a_personal_study_plan(study_plan_id):
    study_plan = PersonalStudyPlan.query.get(study_plan_id)
    if not study_plan:
        abort(404, f"Personal study plan with id {study_plan_id} not found")
    return study_plan.toJSON(), 200


# Update an existing personal study plan
def update_personal_study_plan(study_plan_id, body):
    study_plan = PersonalStudyPlan.query.get(study_plan_id)
    if not study_plan:
        abort(404, f"Study plan with id {study_plan_id} not found")
    
    title = body.get('title', None)
    if title is not None:
        study_plan.title = title
        study_plan.date_updated = datetime.utcnow()
    
    semester_info_list = body.get('semester_info_list', None)
    if semester_info_list is not None:
        num_of_new_semesters = len(semester_info_list)
        curr_semester_list = study_plan.get_semester_list_in_order()
        num_of_curr_semesters = len(curr_semester_list)
        
        # delete extra semesters
        if num_of_curr_semesters > num_of_new_semesters:
            for i in range(num_of_new_semesters, num_of_curr_semesters):
                semester = curr_semester_list[i]
                db.session.delete(semester)
        
        # create new semesters
        elif num_of_curr_semesters < num_of_new_semesters:
            for i in range(num_of_curr_semesters, num_of_new_semesters):
                new_semester = StudyPlanSemester(
                    semester_number = i + 1,
                    personal_study_plan_id = study_plan_id
                )
                db.session.add(new_semester)
                curr_semester_list.append(new_semester)
        
        # update semesters
        for index, semester_info_dictionary in enumerate(semester_info_list):
            # update course list
            new_course_code_list = semester_info_dictionary["course_codes"]
            semester = curr_semester_list[index]
            semester.courses = []
            for course_code in new_course_code_list:
                course = Course.query.get(course_code)
                if not course:
                    abort(404, f"Course with course code <{course_code}> not found")
                semester.courses.append(course)
            
            # update total number of units
            course_list = semester.courses # list of Course objects
            course_units_list = list(map(lambda course: course.number_of_units, course_list))
            sum_of_units = sum(course_units_list)
            semester.total_units = sum_of_units
        
    db.session.commit()
    study_plan.date_updated = datetime.utcnow()
    
    return study_plan.toJSON(), 200


# Delete an existing study plan
# Corresponding published study plan will also be deleted if applicable
def delete_study_plan(study_plan_id):
    personal_study_plan = PersonalStudyPlan.query.get(study_plan_id)

    if personal_study_plan:
        if personal_study_plan.published_version is not None:
            published_study_plan = personal_study_plan.published_version
            db.session.delete(published_study_plan)
            db.session.commit()
        db.session.delete(personal_study_plan)
        db.session.commit()
    
    else:
        published_study_plan = PublishedStudyPlan.query.get(study_plan_id)
        if not published_study_plan:
            abort(404, f"Study plan with id {study_plan_id} not found")
        if published_study_plan.academic_plan is not None:
            db.session.delete(published_study_plan.academic_plan)
        db.session.delete(published_study_plan)
        db.session.commit()
    
    return {"message": "Study plan deleted"}, 204


# Read a collection of personal study plans
def get_personal_study_plans(user_id):
    user = User.query.get(user_id)

    if not user:
        abort(404, f"User with id {user_id} not found")

    personal_study_plans = (PersonalStudyPlan.query
        .filter_by(creator_id=user_id)
        .order_by(PersonalStudyPlan.date_updated.desc())
        .all())
    personal_study_plans = list(map(
        lambda study_plan: study_plan.toJSON(), 
        personal_study_plans
    ))
    return {"personal_study_plan_data": personal_study_plans}, 200