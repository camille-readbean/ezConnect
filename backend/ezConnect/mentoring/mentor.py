from datetime import datetime
from werkzeug.exceptions import Unauthorized
from sqlalchemy import desc
from typing import List
import uuid, traceback, json
from ezConnect.utils.emailer import send_email
from ezConnect.config import FRONTEND_HOSTNAME
from ezConnect.models import db, User, Course, MentorPosting, MentorRequest, MentorMenteeMatch

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
            return {"error" : f"You are already mentoring for this course"}, 200

        mentor_posting = MentorPosting(
            user_id=user.azure_ad_oid,
            course_code=course.course_code,
            description=body['description'],
            title=body['title'],
        )

        db.session.add(mentor_posting)
        user.mentor_postings.append(mentor_posting)

        db.session.commit()
        return {"message": f"{mentor_posting} created", 
                "mentoring_post_uuid" : mentor_posting.id}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500

def update_mentor(token_info, mentor_posting_id, body):
    try:
        mentor_posting: MentorPosting = MentorPosting.query \
            .get(mentor_posting_id)
        if mentor_posting is None:
            return {"error" : f"Mentor posting not found"}, 404
        if str(mentor_posting.user_id) != token_info['sub']:
            print(f'{mentor_posting.user_id} does not match {token_info["sub"]}')
            raise Unauthorized(description="User ID mismatch")

        mentor_posting.is_published = body['is_published']
        mentor_posting.description = body["description"]
        mentor_posting.title = body["title"]
        mentor_posting.date_updated = datetime.now()

        # db.session.update(mentor_posting)

        db.session.commit()
        return {"message": f"{mentor_posting} updated"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500

def get_mentors(token_info):
    try:
        postings: List[MentorPosting] = MentorPosting.query\
            .filter(MentorPosting.is_published == True) \
            .order_by(desc(MentorPosting.date_updated)).all()
        rep = {'postings' : []}
        for posting in postings:
            rep['postings'].append(
                {
                    'mentor_posting_uuid' : posting.id,
                    'course' : posting.course_code,
                    'title' : posting.title,
                    'description' : posting.description,
                    'date_updated' : posting.date_updated.strftime("%Y-%m-%d %H:%M")
                }
            )
        # db.session.commit()
        return rep, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    
def request_mentor(token_info, mentor_posting_id, body):
    try:
        posting: MentorPosting = MentorPosting.query.get(mentor_posting_id)
        # Make sure mentor posting is published
        if posting.is_published == False: return {'error': 'Mentor is not published'}, 400

        # Check if mentee have a Mentor Request
        mentor_request: MentorRequest = MentorRequest.query \
            .filter(MentorRequest.user_id == uuid.UUID(token_info['sub'])) \
            .filter(MentorRequest.course_code == posting.course_code) \
            .one_or_none()
        if mentor_request is None: return {'error' : 'Create a request for a mentor in this course first'}, 400
        if mentor_request.is_published == False: return {'error' : 'Request not published'}, 400 

        # Check no matches with current mentor in this course
        existing_match = MentorMenteeMatch.query \
            .filter(MentorMenteeMatch.mentor_id == posting.user_id) \
            .filter(MentorMenteeMatch.mentee_id == uuid.UUID(token_info['sub'])) \
            .filter(MentorMenteeMatch.course_code == posting.course_code) \
            .all()
        if existing_match != []:
            return {'error' : 'You already requested for this mentor'}, 400

        # Create the mentor mentee match, and set status to pending
        mentor_mentee_match = MentorMenteeMatch(
            mentor_id=posting.user_id,
            mentee_id=mentor_request.user_id,
            course_code=mentor_request.course_code,
            status="Pending"
        )
        # Send email to mentor
        mentee = mentor_request.mentee
        mentor = posting.mentor
        db.session.add(mentor_mentee_match)
        db.session.commit()
        accept_url = f'{FRONTEND_HOSTNAME}/mentoring/mentors/accept?match={mentor_mentee_match.id}'

        msg = f"<html>Hi {mentor.name}, {mentee.name} wopuld like to be your student in your mentor posting for {posting.course_code}" + \
            f"<center>Please visit <a href='{accept_url}'>{accept_url}</a> to accept or reject</center></html>"
        send_email(
            subject=f'[ezConnect] A student would like you to be their mentor for {posting.course_code}',
            email=posting.mentor.email,
            name=posting.mentor.name,
            message=json.dumps(msg)
        )
        
        mentee.mentee_match.append(mentor_mentee_match)
        mentor.mentoring_match.append(mentor_mentee_match)

        db.session.commit()
        return {"message" : "ok, email sent to mentor. Please wait for them to accept"}, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
