# from flask import Config
from ezConnect.config import DOMAINS, FRONTEND_HOSTNAME
from ezConnect.utils.emailer import send_email
from ezConnect.models import User, db
import uuid

import traceback

# /api/user/create-account
def create_user(body):
    try:
        # # TODO: Update the course to reflect new structure after data normalisation
        programme = None
        if 'programme' in body.keys():
            programme = body['programme']
        new_user = User(name=body['name'], 
                        email=body['email'],
                        azure_ad_oid=uuid.UUID(body['azure_ad_oid']),
                        year=body['year'],
                        degree=body['degree'],
                        programme=programme)
        db.session.add(new_user)
        db.session.commit()
        return {"message": f"User {new_user.name}" + \
                f" {new_user.azure_ad_oid} Year {new_user.year} created" + \
                f"\nYou will be redirected shortly"}, 200
        # return {"message": "test"}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {"error": f"{str(e)}"}, 500
    