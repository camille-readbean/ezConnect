from datetime import datetime
from werkzeug.exceptions import Unauthorized
from sqlalchemy import desc
from typing import List
import uuid, traceback, json
from ezConnect.utils.emailer import send_email
from ezConnect.config import FRONTEND_HOSTNAME
from ezConnect.models import db, User, Course, MentorPosting, MentorRequest, MentorMenteeMatch

# Accept mentee
def accept_mentee(token_info, mentoring_match_id, body):
    try:
        match: MentorMenteeMatch = MentorMenteeMatch.query.get(mentoring_match_id)
        if match.status == 'Active':
            return {'error' : 'Match is already active'}, 401
        if token_info['sub'] != str(match.mentor_id):
            return {'error' : 'You are not the mentor'}, 401
        # Set status active to reject
        if body['accept'] == False and match.status == 'Pending mentor': 
            match.status = 'Rejected by mentor'
            db.session.commit()
            # Send email to mentee
            msg = f'Your reqeusted mentor, {match.mentor_user.name} for {match.course_code}' + \
                f'have rejected the request with the following message: <br>{body["message"]}'
            send_email(
                subject='Mentoring request rejected',
                message=msg,
                email=match.mentee_user.email,
                name=match.mentee_user.name,
            )
            return {'message' : 'Rejected student'}, 200
        if match.status == 'Rejected by mentor':
            return {'error' : 'You have already rejected the student'}, 401
        if match.status != 'Pending mentor':
            return {'error' : f'Not a valid state: {match.status}'}, 401
        match.status = 'Active' 
        msg = f'Your reqeusted mentor, {match.mentor_user.name} for {match.course_code} ' + \
                f'have accepted the request with the following message: <br>{body["message"]}'
        send_email(
                subject='Mentoring request accept',
                message=msg,
                email=match.mentee_user.email,
                name=match.mentee_user.name,
            )
        mentor_req: MentorRequest = MentorRequest.query \
            .filter(MentorRequest.user_id == match.mentee_id) \
            .filter(MentorRequest.course_code == match.course_code) \
            .one_or_none()
        # Mentor_request fulfilled, so unpublish it
        mentor_req.is_published = False
        mentor_req.date_updated = datetime.utcnow()
        
        db.session.commit()

        return {"message" : "ok, email sent to mentee, please get in touch with them"}, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500

def accept_mentor(token_info, mentoring_match_id, body):
    try:
        match: MentorMenteeMatch = MentorMenteeMatch.query.get(mentoring_match_id)
        if token_info['sub'] != str(match.mentee_id):
            # print(token_info['sub'])
            # print(match.mentee_id)
            return {'error' : 'You are not the mentee'}, 401
        if match.status == 'Active':
            return {'error' : 'Match is already active'}, 401
        # Set status active to reject
        if body['accept'] == False and match.status == 'Pending mentee': 
            match.status = 'Rejected by mentee'
            db.session.commit()
            # Send email to mentee
            msg = f'Your reqeusted mentee, {match.mentee_user.name} for {match.course_code} ' + \
                f'have rejected the request with the following message: <br>{body["message"]}'
            send_email(
                subject='Mentoring request rejected',
                message=msg,
                email=match.mentor_user.email,
                name=match.mentor_user.name,
            )
            return {'message' : 'Rejected the student mentor'}, 200
        if match.status == 'Rejected by mentee':
            return {'error' : 'You have already rejected the student mentor'}, 401
        if match.status != 'Pending mentee':
            return {'error' : f'Not a valid state: {match.status}'}, 401
        match.status = 'Active' 
        msg = f'Your reqeusted mentee, {match.mentee_user.name} for {match.course_code}' + \
                f'have accepted the request with the following message: <br>{body["message"]}'
        send_email(
                subject='Mentoring request accept',
                message=msg,
                email=match.mentor_user.email,
                name=match.mentor_user.name,
            )
        mentor_req: MentorRequest = MentorRequest.query \
            .filter(MentorRequest.user_id == match.mentee_id) \
            .filter(MentorRequest.course_code == match.course_code) \
            .one_or_none()
        # Mentor_request fulfilled, so unpublish it
        mentor_req.is_published = False
        mentor_req.date_updated = datetime.utcnow()
        
        db.session.commit()

        return {"message" : "ok, email sent to mentor, please get in touch with them"}, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    
def get_matches(token_info):
    try:
        # Where user is mentor
        mentor_matches: List[MentorMenteeMatch] = User.query.get(token_info['sub']).mentoring_match
        # Where user is mentee
        mentee_matches: List[MentorMenteeMatch] = User.query.get(token_info['sub']).mentee_match
        rep = {'mentor_matches' : [], 'mentee_matches' : []}
        for posting in mentor_matches:
            rep['mentor_matches'].append(
                {
                    'posting_uuid' : posting.id,
                    'course_code' : posting.course_code,
                    'mentee_name' : posting.mentee_user.name,
                    'status' : posting.status,
                    'email' : posting.mentee_user.email if posting.status == 'Active' else f'Hidden, {posting.status.lower()} acceptance'
                }
            )
        for posting in mentee_matches:
            rep['mentee_matches'].append(
                {
                    'posting_uuid' : posting.id,
                    'course_code' : posting.course_code,
                    'mentor_name' : posting.mentor_user.name,
                    'status' : posting.status,
                    'email' : posting.mentor_user.email if posting.status == 'Active' else f'Hidden, {posting.status.lower()} acceptance'
                }
            )
        return rep, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    
def get_a_match(token_info, mentoring_match_id):
    try:
        # Where user is mentor
        match = MentorMenteeMatch.query.get(mentoring_match_id)  
        rep = {
                'posting_uuid' : match.id,
                'course_code' : match.course_code,
                'mentee_name' : match.mentee_user.name,
                'mentor_id' : match.mentor_id,
                'mentee_id' : match.mentee_id,
                'status' : match.status,
                'mentor_name' : match.mentor_user.name,
                'mentor_request_description' : MentorRequest.query \
                    .filter(MentorRequest.course_code == match.course_code) \
                    .filter(MentorRequest.user_id == match.mentee_id) \
                    .one().description,
                'mentor_posting_description' : MentorPosting.query \
                    .filter(MentorPosting.course_code == match.course_code) \
                    .filter(MentorPosting.user_id == match.mentor_id) \
                    .one().description,
            }

        return rep, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500