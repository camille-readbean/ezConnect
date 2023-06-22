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
            match.status = 'Reject'
            # Send email to mentee
            msg = f'Your reqeusted mentor, {match.mentor_user.name} for {match.course_code}' + \
                f'have rejected the request with the following message: {body["message"]}'
            send_email(
                subject='Mentoring request rejected',
                message=msg,
                email=match.mentee_user.email,
                name=match.mentee_user.name,
            )
            return {'message' : 'Rejected student'}, 200

        match.status = 'Active' 
        msg = f'Your reqeusted mentor, {match.mentor_user.name} for {match.course_code}' + \
                f'have accepted the request with the following message: {body["message"]}'
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
        mentor_req.is_published = False
        mentor_req.date_updated = datetime.utcnow()
        
        db.session.commit()

        # db.session.commit()
        return {"message" : "ok, email sent to mentee, please get in touch with them"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500