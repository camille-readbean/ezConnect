# from flask import Config
from datetime import datetime, timedelta
from ezConnect.config import DOMAINS, FRONTEND_HOSTNAME
from ezConnect.utils.emailer import send_email
from ezConnect.models import User, SignUpRequest, db
from ezConnect.auth.login import _hash_password, _get_user

import traceback

# "/api/auth/signup"
def request(body):
    # first validate email
    email: str = body['email']
    if email.find('@') == -1:
        return {"error": "Not an email"}, 400
    if email.split('@')[-1] not in DOMAINS:
        return {"error": "Invalid domain"}, 401
    # Check duplicate, do not send request if the email is already being used
    user = _get_user(email)
    success_msg = f"Verification email sent to {req['email']} if account can be created"
    if user is not None:
        # Do not disclose if account / email exist to the requester
        # See: Account Enumeration
        print(f"Request made for existing account {email}")
        return {"message" : success_msg}, 200

    try: 
        sign_up_request = SignUpRequest(datetime.utcnow(), email)
        db.session.add(sign_up_request)
        db.session.commit()
        sign_up_token = sign_up_request.id
        message= f"Please go to https://{FRONTEND_HOSTNAME}/signup/verify?signUpRequestToken={sign_up_token}" + \
            f"&email={email} to verify your account and continue with account creation"
        print(f"{message}")
        send_email(
            subject="Verify your email for EzConnect",
            message=message,
            email=email,
            name=email
        )
    except Exception as e:
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500

    return {"message" : success_msg}, 200

def verify(emailToken, emailQueryString, body):
    sign_up_req: SignUpRequest = SignUpRequest.query.get(emailToken)
    if sign_up_req == None:
        return {"error": "Invalid email verification token"}, 404
    if emailQueryString != sign_up_req.email:
        return {"error": "Invalid email for this verification token"}, 401
    password: str = body['password']
    if len(password) < 12:
        return {"error": "Password too short"}, 422
    try:
        # Past 24 hours, delete
        if datetime.utcnow() - sign_up_req.creation_time >  timedelta(days=1):
            # Expired verification email token
            db.session.delete(sign_up_req)
            db.session.commit()
            return {"message": "Email verification token expired, please make a new request"}, 401
        email_addr = emailQueryString
        salt, password_hash = _hash_password(password)
        # TODO: Update the course to reflect new structure after data normalisation
        new_user = User(name=body['name'], 
                        email=email_addr,
                        salt = salt,
                        password=password_hash,
                        year=body['year'],
                        course=body['course'])
        # db.session.delete(sign_up_req)
        # Delete other requests that might have been made too(
        SignUpRequest.query.filter_by(email=email_addr).delete()
        db.session.add(new_user)
        db.session.commit()
        return {"message": f"User {new_user.name}" + \
                f" {new_user.course} Year {new_user.year} created" + \
                f"\nYou may now login with your new password"}, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    