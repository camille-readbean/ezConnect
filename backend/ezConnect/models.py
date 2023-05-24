from sqlalchemy import Column, Integer, String, DateTime, LargeBinary
from flask_sqlalchemy import SQLAlchemy
from Crypto.Protocol.KDF import scrypt
from Crypto.Random import get_random_bytes
from base64 import urlsafe_b64encode

from ezConnect.config import DOMAINS

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    email = Column(String(120), unique=True)
    password_hash = Column(LargeBinary())
    salt = Column(LargeBinary())
    year = Column(Integer)
    course = Column(String(120))

    def __init__(self, name: String, email: String, 
                 password: String, year: Integer, course: String):
        self.name = name
        if email.split("@")[-1] not in DOMAINS:
            raise ValueError("Invalid domain")
        if len(password) < 12:
            raise ValueError("Password too short")
        self.email = email
        self.salt = get_random_bytes(16)
        self.password_hash = scrypt(password, self.salt, 16, 2**16, r=8, p=1)
        self.year = year
        self.course = course

    def __repr__(self):
        return f'<User {self.name!r}>'
    
class SignUpRequest(db.Model):
    id = Column(String(32), primary_key=True)
    email = Column(String(120), unique=True)
    creation_time = Column(DateTime)

    def __init__(self, creation_time, email):
        self.email = email
        self.creation_time = creation_time
        email_token = urlsafe_b64encode(get_random_bytes(24)).decode()[:32]
        print(email_token)
        self.id = email_token
        assert len(self.id) == 32

    def __repr__(self):
        return f'<{self.name!r} ({self.email}) at {self.creation_time}>'