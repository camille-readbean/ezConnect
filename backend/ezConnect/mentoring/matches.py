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
        # Set status active to reject
        if body['accept'] == False: 
            match.status = 'Rejected by mentor'
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
        # TODO: update check for if already rejected and that status is "Pending mentor"

        match.status = 'Active' 
        msg = f'Your reqeusted mentor, {match.mentor_user.name} for {match.course_code}' + \
                f'have accepted the request with the following message: <br>{body["message"]}'
        send_email(
                subject='Mentoring request accept',
                message=msg,
                email=match.mentee_user.email,
                name=match.mentee_user.name,
            )
        mentor_req: MentorRequest = MentorRequest.query \
            .filter(MentorRequest.user_id == uuid.UUID(token_info['sub'])) \
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

# TODO: Accept a mentor
def accept_mentor(token_info, mentoring_match_id, body):
    try:
        match: MentorMenteeMatch = MentorMenteeMatch.query.get(mentoring_match_id)
        # Set status active to reject
        if body['accept'] == False: 
            match.status = 'Rejected by mentee'
            # Send email to mentee
            msg = f'Your reqeusted mentee, {match.mentee_user.name} for {match.course_code}' + \
                f'have rejected the request with the following message: <br>{body["message"]}'
            send_email(
                subject='Mentoring request rejected',
                message=msg,
                email=match.mentor_user.email,
                name=match.mentor_user.name,
            )
            return {'message' : 'Rejected student'}, 200
        # TODO: update check for if already rejected and that status is "Pending mentor"

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
                    'status' : posting.status
                }
            )
        for posting in mentee_matches:
            rep['mentee_matches'].append(
                {
                    'posting_uuid' : posting.id,
                    'course_code' : posting.course_code,
                    'mentor_name' : posting.mentor_user.name,
                    'status' : posting.status
                }
            )
        return rep, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500