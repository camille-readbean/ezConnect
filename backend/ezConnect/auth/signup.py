# from flask import Config
from ezConnect.config import DOMAINS, FRONTEND_HOSTNAME
from ezConnect.utils.emailer import send_email
from ezConnect.models import User, db, Degree, Programme
import uuid

import traceback

# /api/user/create-account
def create_user(token_info, body):
    try:
        programme = None
        if 'programme' in body.keys():
            programme = body['programme']
        # Unit testing revealed duplicate user causes 500 error
        if User.query.get(token_info['sub']) is not None:
            return {'error' : 'You already have an account'}, 401
        new_user = User(name=body['name'], 
                        email=body['email'],
                        azure_ad_oid=uuid.UUID(body['azure_ad_oid']),
                        year=body['year'],
                        )
        db.session.add(new_user)
        
        degrees_array = body['degrees']
        degrees = []
        for entry in degrees_array:
            degree = Degree.query.get(entry['id'])
            degrees.append(degree)
        new_user.degrees.extend(degrees)

        programmes_array = body['programmes']
        programmes = []
        for entry in programmes_array:
            prog = Programme.query.get(entry['id'])
            programmes.append(prog)
        new_user.programmes.extend(programmes)

        db.session.commit()
        return {"message": f"User {new_user.name}" + \
                f" {new_user.azure_ad_oid} Year {new_user.year} created" + \
                f"\nYou will be redirected shortly"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    