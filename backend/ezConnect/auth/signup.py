# from flask import Config
from datetime import datetime, timedelta
from ezConnect.config import DOMAINS, HOSTNAME
from ezConnect.utils.emailer import send_email
from ezConnect.models import User, SignUpRequest, db

import traceback

# "/api/auth/signup"
def request(body):
    req = {
        "creation_time" : datetime.now(),
        "email" : body['email'],
        "namne" : "john doe"
    }
    # first validate email
    email: str = body['email']
    if email.find('@') == -1:
        return {"error": "Not an email"}, 400
    if email.split('@')[-1] not in DOMAINS:
        return {"error": "Invalid domain"}, 401
    
    try: 
        sign_up_request = SignUpRequest(datetime.utcnow(), email)
        db.session.add(sign_up_request)
        db.session.commit()
        sign_up_token = sign_up_request.id
        message= f"Please go to https://{HOSTNAME}/signup/verify?signUpRequestToken={sign_up_token}" + \
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
        return {"error": f"str(e)"}, 500

    return {"message" : f"Verification email sent to {req['email']}"}, 200

def verify(emailToken, emailQueryString, body):
    sign_up_req: SignUpRequest = SignUpRequest.query.get(emailToken)
    if sign_up_req == None:
        return {"error": "Invalid email verification token"}, 404
    if emailQueryString != sign_up_req.email:
        return {"error": "Invalid email for this verification token"}, 401
    try:
        # Past 24 hours, delete
        if datetime.utcnow() - sign_up_req.creation_time >  timedelta(days=1):
            # Expired verification email token
            db.session.delete(sign_up_req)
            db.session.commit()
            return {"message": "Email verification token expired"}, 401
        email_addr = emailQueryString
        new_user = User(name=body['name'], 
                        email=email_addr,
                        password=body['password'],
                        year=body['year'],
                        course=body['course'])
        db.session.delete(sign_up_req)
        db.session.add(new_user)
        db.session.commit()
        return {"message": f"User {new_user.name}" + \
                f" {new_user.course} Year {new_user.year} created" + \
                f"\nYou may now login with your new password"}, 200
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    