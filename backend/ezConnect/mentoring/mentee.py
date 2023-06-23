from datetime import datetime
from sqlalchemy import desc
from typing import List
import uuid, traceback, json
from ezConnect.utils.emailer import send_email
from ezConnect.config import FRONTEND_HOSTNAME
from ezConnect.models import db, User, Course, MentorPosting, MentorRequest, MentorMenteeMatch

def create_request(token_info, body):
    try:
        course: Course = Course.query.get(body['course_code'])
        user: User = User.query.get(token_info['sub'])
        if  course is None:
            return {"error" : f"Course {body['course_code']} not found"}, 404 
        if user is None:
            return {"error" : f"User not found, try finish creating your account at /user/create-account"}, 404 
        if MentorRequest.query \
            .filter_by(user_id=user.azure_ad_oid, course_code=course.course_code) \
            .one_or_none() is not None:
            return {"error" : f"You have already requested a mentor request for this course"}

        mentor_request = MentorRequest(
            user_id=user.azure_ad_oid,
            course_code=course.course_code,
            description=body['description'],
            title=body['title'],
        )

        db.session.add(mentor_request)
        user.mentor_requests.append(mentor_request)

        db.session.commit()
        return {"message": f"{mentor_request} created"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500

def update_mentee(token_info, mentor_posting_id, body):
    try:
        mentor_request: MentorRequest = MentorRequest.query \
            .get(mentor_posting_id)
        if mentor_request is None:
            return {"error" : f"Mentor request not found"}, 404
        if str(mentor_request.user_id) != token_info['sub']:
            print(f'{mentor_request.user_id} does not match {token_info["sub"]}')
            return {'error' : "User ID mismatch"}, 401

        mentor_request.is_published = body['is_published']
        mentor_request.description = body["description"]
        mentor_request.title = body["title"]
        mentor_request.date_updated = datetime.now()

        # db.session.update(mentor_posting)

        db.session.commit()
        return {"message": f"{mentor_request} updated"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500

def get_mentees(token_info):
    try:
        postings: List[MentorRequest] = MentorRequest.query\
            .filter(MentorRequest.is_published == True) \
            .order_by(desc(MentorRequest.date_updated)).all()
        rep = {'postings' : []}
        for posting in postings:
            rep['postings'].append(
                {
                    'posting_uuid' : posting.id,
                    'course' : posting.course_code,
                    'title' : posting.title,
                    'description' : posting.description,
                    'date_updated' : posting.date_updated.strftime("%Y-%m-%d %H:%M"),
                    'name' : posting.mentee.name
                }
            )
        # db.session.commit()
        return rep, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    
# TODO: SPECIFIC GET MENTEE REQUEST FOR A USER
    
def request_mentee(token_info, mentor_posting_id, body):
    try:
        mentor_request: MentorRequest = MentorRequest.query.get(mentor_posting_id)
        if mentor_request is None:
            return {'error' : 'mentor request not found'}, 404
        # Make sure mentor posting is published
        if mentor_request.is_published == False: return {'error': 'Mentee is not published'}, 400

        # Check if mentor have a Mentor Posting
        posting: MentorPosting = MentorPosting.query \
            .filter(MentorPosting.user_id == uuid.UUID(token_info['sub'])) \
            .filter(MentorPosting.course_code == mentor_request.course_code) \
            .one_or_none()
        if posting is None: return {'error' : 'Create a mentor posting in this course first'}, 400
        if posting.is_published == False: return {'error' : 'Request not published'}, 400 

        # Check no matches with current mentee in this course
        existing_match = MentorMenteeMatch.query \
            .filter(MentorMenteeMatch.mentor_id == uuid.UUID(token_info['sub'])) \
            .filter(MentorMenteeMatch.mentee_id == mentor_request.user_id) \
            .filter(MentorMenteeMatch.course_code == posting.course_code) \
            .all()
        if existing_match != []:
            return {'error' : 'You have already matched with this mentee'}, 400

        # Create the mentor mentee match, and set status to pending
        mentor_mentee_match = MentorMenteeMatch(
            mentor_id=posting.user_id,
            mentee_id=mentor_request.user_id,
            course_code=mentor_request.course_code,
            status="Pending mentee"
        )
        # Send email to mentee
        mentee = mentor_request.mentee
        mentor = posting.mentor
        db.session.add(mentor_mentee_match)
        db.session.commit()
        accept_url = f'{FRONTEND_HOSTNAME}/mentoring/matches/accept?match={mentor_mentee_match.id}'

        msg = f"<html>Hi {mentee.name}, {mentor.name} wopuld like to be your mentor in your mentor request for {posting.course_code}" + \
            f"<center>Please visit <a href='{accept_url}'>{accept_url}</a> to accept or reject</center></html>"
        send_email(
            subject=f'[ezConnect] A student would like to be your mentor for {posting.course_code}',
            email=mentee.email,
            name=mentee.name,
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
