from datetime import datetime
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.exceptions import Unauthorized
import json
import traceback
import uuid

from ezConnect.models import db, User, Course, MentorPosting

def create_mentor(token_info, body):
    if body['user_id'] != token_info['sub']:
        raise Unauthorized(description="User ID mismatch")
    try:
        course: Course = Course.query.get(body['course_code'])
        user: User = User.query.get(body['user_id'])
        if  course is None:
            return {"error" : f"Course {body['course_code']} not found"}, 404 
        if user is None:
            return {"error" : f"User not found, try finish creating your account at /user/create-account"}, 404 
        if MentorPosting.query \
            .filter_by(user_id=user.azure_ad_oid, course_code=course.course_code) \
            .one_or_none() is not None:
            return {"error" : f"You are already mentoring for this course"}

        mentor_posting = MentorPosting(
            user_id=user.azure_ad_oid,
            course_code=course.course_code,
            description=body['description'],
            title=body['title'],
        )

        db.session.add(mentor_posting)
        user.mentor_postings.append(mentor_posting)

        db.session.commit()
        return {"message": f"{mentor_posting} created"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    
#TODO: update existing, toggle published unpublished
def update_mentor(token_info, body):
    if body['user_id'] != token_info['sub']:
        raise Unauthorized(description="User ID mismatch")
    try:
        course: Course = Course.query.get(body['course_code'])
        user: User = User.query.get(body['user_id'])
        if  course is None:
            return {"error" : f"Course {body['course_code']} not found"}, 404 
        if user is None:
            return {"error" : f"User not found, try finish creating your account at /user/create-account"}, 404 
        if MentorPosting.query \
            .filter_by(user_id=user.azure_ad_oid, course_code=course.course_code) \
            .one_or_none() is not None:
            return {"error" : f"You are already mentoring for this course"}

        mentor_posting = MentorPosting(
            user_id=user.azure_ad_oid,
            course_code=course.course_code,
            description=body['description'],
            title=body['title'],
        )

        db.session.add(mentor_posting)
        user.mentor_postings.append(mentor_posting)

        db.session.commit()
        return {"message": f"{mentor_posting} created"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    
#TODO: update to return a list of all mentors
def get_mentors(token_info, body):
    try:
        course: Course = Course.query.get(body['course_code'])
        user: User = User.query.get(body['user_id'])
        if  course is None:
            return {"error" : f"Course {body['course_code']} not found"}, 404 
        if user is None:
            return {"error" : f"User not found, try finish creating your account at /user/create-account"}, 404 
        if MentorPosting.query \
            .filter_by(user_id=user.azure_ad_oid, course_code=course.course_code) \
            .one_or_none() is not None:
            return {"error" : f"You are already mentoring for this course"}

        mentor_posting = MentorPosting(
            user_id=user.azure_ad_oid,
            course_code=course.course_code,
            description=body['description'],
            title=body['title'],
        )

        db.session.add(mentor_posting)
        user.mentor_postings.append(mentor_posting)

        db.session.commit()
        return {"message": f"{mentor_posting} created"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500