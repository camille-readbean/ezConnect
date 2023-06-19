from datetime import datetime
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.exceptions import Unauthorized
import json
import traceback

from ezConnect.models import db, User, Course, MentorRequest

def create_request(token_info, body):
    if body['user_id'] != token_info['sub']:
        raise Unauthorized(description="User ID mismatch")
    try:
        course: Course = Course.query.get(body['course_code'])
        user: User = User.query.get(body['user_id'])
        if  course is None:
            return {"error" : f"Course {body['course_code']} not found"}, 404 
        if user is None:
            return {"error" : f"User not found, try finish creating your account at /user/create-account"}, 404 
        if MentorRequest.query \
            .filter_by(user_id=user.azure_ad_oid, course_code=course.course_code) \
            .one_or_none() is not None:
            return {"error" : f"You have already requested a mentor for this course"}

        mentor_request = MentorRequest(
            user_id=user.azure_ad_oid,
            course_code=course.course_code,
            description=body['description'],
            title=body['title'],
        )

        db.session.add(mentor_request)
        user.mentor_postings.append(mentor_request)

        db.session.commit()
        return {"message": f"{mentor_request} created"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500