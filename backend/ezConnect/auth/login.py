from datetime import datetime
from jose import JWTError, jwt, ExpiredSignatureError
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.exceptions import Unauthorized
from Crypto.Protocol.KDF import scrypt
from Crypto.Random import get_random_bytes
from urllib.request import urlopen
import json
from flask import current_app

from ezConnect.models import User
from ezConnect.config import JWT_SECRET, JWT_ISSUER, \
    JWT_ALGORITHMS, JWT_LIFETIME_SECONDS, JWT_KEY_URL, JWT_AUD
from ezConnect.utils.exceptions import InvalidCredentialsError

"""
Credits: 
 - https://github.com/spec-first/connexion/blob/main/examples/jwt/app.py
 - https://github.com/Azure-Samples/ms-identity-python-webapi-azurefunctions/blob/master/Function/secureFlaskApp/__init__.py
"""

def decode_token(token):
    try:
        # DEBUG
        print(JWT_KEY_URL)
        print(token)

        jsonurl = urlopen(JWT_KEY_URL)
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)
        if 'kid' not in unverified_header:
            # leave this out next time to check for a dev JWT, dont use in prod
            if current_app.debug:
                print('\033[93m' + "backdooring!!" + '\x1b[0m')
                return jwt.decode(
                    token,
                    JWT_SECRET,
                    algorithms=JWT_ALGORITHMS,
                    audience=JWT_AUD,
                    issuer=JWT_ISSUER
                )
            raise Unauthorized("Invalid JWT, expecting access token from Azure AD B2C OAuth")
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=JWT_AUD,
                issuer=JWT_ISSUER
                # There was some issue where it seems msal-react wasnt sending access tokens
                # so we fell back to sending id token which is good enough as we raelly only
                # need it for authentication purposes, since all users will be allowed to 
                # use the app
                # Fixed now, added this just in case
                # options={'verify_at_hash': False}
            )
            return payload
    except ExpiredSignatureError as e:
        print("JWT Expired" + str(e))
        raise Unauthorized(description="Token expired") from e
    except JWTError as e:
        msg = "Error with JWT"
        print("JWT Error" + str(e))
        raise Unauthorized(description=str(e)) from e