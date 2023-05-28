from datetime import datetime
from jose import JWTError, jwt, ExpiredSignatureError
from sqlalchemy.orm.exc import NoResultFound
from werkzeug.exceptions import Unauthorized
from Crypto.Protocol.KDF import scrypt
from Crypto.Random import get_random_bytes

from ezConnect.models import User
from ezConnect.config import JWT_SECRET, JWT_ISSUER, JWT_ALGORITHM, JWT_LIFETIME_SECONDS
from ezConnect.utils.exceptions import InvalidCredentialsError

"""
Credits: https://github.com/spec-first/connexion/blob/main/examples/jwt/app.py
"""

def _hash_password(password: str, salt: bytes=None):
    if salt is None:
        salt = get_random_bytes(16)
    password_hash = scrypt(password, salt, 16, 2**16, r=8, p=1)
    return (salt, password_hash)

def _check_password(email: str, password_try: str):
    user = _get_user(email)
    if user is None:
        raise InvalidCredentialsError()
    salt = user.salt
    # print(f"User: {email} Salt: {salt} Password Hash: {}")
    if user.password_hash != _hash_password(password_try, salt)[1]:
        raise InvalidCredentialsError()
    
def _get_user(email: str):
    try: 
        return User.query.filter(User.email==email).one()
    except NoResultFound:
        return None

def _generate_token(user_id: int): 
    timestamp = datetime.utcnow().timestamp()
    payload = {
        "iss": JWT_ISSUER,
        "iat": int(timestamp),
        "exp": int(timestamp + JWT_LIFETIME_SECONDS),
        # Subject, aka field passed to user keyword argument
        "sub": str(user_id),
    }
    print(f"iss: {timestamp}, exp: {timestamp + JWT_LIFETIME_SECONDS}")
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=JWT_ALGORITHM)
    except ExpiredSignatureError as e:
        raise Unauthorized(description="Token expired") from e
    except JWTError as e:
        msg = "Error with JWT"
        raise Unauthorized(description=str(e)) from e
    
def login_user(body):
    try:
        email = body['email']
        password = body['password']
        _check_password(email,password)
        id = _get_user(email).id
        return {"user" : id, "JWT" : _generate_token(id)}, 200
    except InvalidCredentialsError as e:
        raise Unauthorized(description=str(e)) from e

# user from subject_field
def who_am_i(user):
    return {"user": user}, 200
