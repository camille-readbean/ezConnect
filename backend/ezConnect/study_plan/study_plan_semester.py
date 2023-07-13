from flask import abort
from datetime import datetime
from ..models import (PersonalStudyPlan, PublishedStudyPlan, 
                      StudyPlanSemester, Course, db)

# Read a collection of semester information from an existing study plan
def get_all_semesters(study_plan_id):
    study_plan = PersonalStudyPlan.query.get(study_plan_id)

    if not study_plan:
        study_plan = PublishedStudyPlan.query.get(study_plan_id)
    
    if not study_plan:
        abort(404, f"Study plan with id {study_plan_id} not found")
    
    study_plan_info = study_plan.toJSON()
    semester_ids = study_plan_info["semester_ids"] 
    # dictionary (key, value) = (semester_number, semester_id)

    semester_info = [None] * len(semester_ids)
    for semester_number in semester_ids:
        semester_id = str(semester_ids[semester_number])
        info = get_a_semester(semester_id)[0]
        semester_info[semester_number - 1] = info

    return {"semester_info_list": semester_info}, 200


# Create a new semester in an existing study plan
# The new semester will not have any courses populated
def create_semester(study_plan_id):
    is_published = False
    study_plan = PersonalStudyPlan.query.get(study_plan_id)

    if not study_plan:
        study_plan = PublishedStudyPlan.query.get(study_plan_id)
        is_published = True

    if not study_plan:
        abort(404, f"Study plan with id {study_plan_id} not found")
    
    curr_semesters = study_plan.semesters
    num_of_semesters = len(curr_semesters)

    if is_published:
        new_semester = StudyPlanSemester(
            semester_number = num_of_semesters + 1,
            published_study_plan_id = study_plan_id
        )
    else:
        new_semester = StudyPlanSemester(
            semester_number = num_of_semesters + 1,
            personal_study_plan_id = study_plan_id
        )

    db.session.add(new_semester)
    study_plan.date_updated = datetime.utcnow()
    db.session.commit()

    return {"new_semester_id": new_semester.id}, 200


# Read information from a specific study plan semester
def get_a_semester(semester_id):
    semester = StudyPlanSemester.query.get(semester_id)

    if not semester:
        abort(404, f"Study plan semester with id {semester_id} not found")

    semester_info = semester.toJSON()

    return semester_info, 200
    

# Update courses in an existing study plan semester
def update_semester_courses(semester_id, body):
    semester = StudyPlanSemester.query.get(semester_id)

    if not semester:
        abort(404, f"Study plan semester with id {semester_id} not found")
    
    course_code_list = body.get('course_codes', None)

    # if no information was inputted
    if course_code_list is None:
        abort(400, "No information was passed in")
    else:
        semester.courses = []
        for course_code in course_code_list:

            # TODO: abstract out course finding
            # TODO: link course finding to NUSCourses
            course = Course.query.get(course_code)
            if not course:
                abort(404, f"Course with course code <{course_code}> not found")
            semester.courses.append(course)
        db.session.commit()
    
    update_semester_units(semester_id)

    if semester.personal_study_plan_id is not None:
        study_plan = PersonalStudyPlan.query.get(semester.personal_study_plan_id)
    else:
        study_plan = PublishedStudyPlan.query.get(semester.published_study_plan_id)
    
    study_plan.date_updated = datetime.utcnow()
    db.session.commit()

    return semester.toJSON(), 200


# Update and calculate total number of units in an exisiting semester
def update_semester_units(semester_id):
    semester = StudyPlanSemester.query.get(semester_id)

    if not semester:
        abort(404, f"Study plan semester with id {semester_id} not found")
    
    courses = semester.courses # list of Course objects
    course_units = map(lambda course: course.number_of_units, courses)
    sum_of_units = sum(course_units)
    semester.total_units = sum_of_units

    db.session.commit()

    return sum_of_units


# Delete an existing study plan semester
def delete_semester(semester_id):
    semester = StudyPlanSemester.query.get(semester_id)

    if not semester:
        abort(404, f"Study plan semester with id {semester_id} not found")
    
    # Delete and update the rest of the semester numbers
    curr_semester_number = semester.semester_number

    if semester.personal_study_plan_id is not None:
        study_plan_id = semester.personal_study_plan_id
        is_published = False
    else:
        study_plan_id = semester.published_study_plan_id
        is_published = True

    db.session.delete(semester)
    db.session.commit()

    if is_published:
        remaining_semesters = StudyPlanSemester.query.filter_by(
            published_study_plan_id=study_plan_id).all()
    else:
        remaining_semesters = StudyPlanSemester.query.filter_by(
            personal_study_plan_id=study_plan_id).all()
    
    for remaining_semester in remaining_semesters:
        if remaining_semester.semester_number > curr_semester_number:
            remaining_semester.semester_number -= 1
            db.session.commit()

    return {"message": f"Study plan semester with id {semester_id} deleted"}, 204