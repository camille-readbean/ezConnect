from flask import abort
from sqlalchemy.orm.collections import InstrumentedList

from ezConnect.models import PersonalStudyPlan, User, StudyPlanSemester, semester_course
from .parser import check_courses_prereqs

def validate_study_plan(token_info, study_plan_id):
    user = User.query.get(token_info['sub'])
    study_plan: PersonalStudyPlan = PersonalStudyPlan.query.get(study_plan_id)

    if not study_plan or study_plan.creator != user:
        abort(404, f"Personal study plan with id {study_plan_id} not found")
    
    semesters: InstrumentedList[StudyPlanSemester] = study_plan.semesters
    semesters_courses_list = [
        [course.course_code for course in semester.courses] for semester in list(semesters)
    ]
    try:
        result = check_courses_prereqs(semesters_courses_list)
        return result, 200
    except Exception as e:
        return {'error' : str(e)}, 500

