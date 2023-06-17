from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, Boolean, Text
from flask_sqlalchemy import SQLAlchemy
from Crypto.Random import get_random_bytes
from base64 import urlsafe_b64encode
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

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

    study_plans = db.relationship('StudyPlan', backref='creator')

    def __init__(self, name: String, email: String, salt: bytes,
                 password: bytes, year: Integer, course: String):
        self.name = name
        if email.split("@")[-1] not in DOMAINS:
            raise ValueError("Invalid domain")
        if len(password) < 12:
            raise ValueError("Password too short")
        self.email = email
        self.salt = salt
        self.password_hash = password
        self.year = year
        self.course = course

    def __repr__(self):
        return f'<User {self.name!r}>'
    
class SignUpRequest(db.Model):
    id = Column(String(32), primary_key=True)
    email = Column(String(120))
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
    
class StudyPlan(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_published = Column(Boolean, nullable=False, default=False)
    title = Column(String(150), default="Blank study plan")
    description = Column(Text)
    num_of_likes = Column(Integer, db.CheckConstraint('num_of_likes>=0'), default = 0)
    creator_id = Column(Integer, db.ForeignKey('users.id'), nullable=False)
    semesters = db.relationship('StudyPlanSemester', backref='study_plan')

    def __repr__(self):
        return f'<Study plan created by {self.creator.name} last updated at {self.date_updated}>'

    def toJSON(self):
        semester_ids = {}
        for semester in self.semesters:
            semester_ids[semester.semester_number] = semester.id

        return {
            "id": self.id,
            "date_updated": self.date_updated,
            "is_published": self.is_published,
            "title": self.title,
            "description": self.description,
            "num_of_likes": self.num_of_likes,
            "creator_id": self.creator_id,
            "semester_ids": semester_ids
        }

semester_course = db.Table('semester_course',
    Column('study_plan_semester_id', UUID(as_uuid=True), db.ForeignKey('study_plan_semester.id')),
    Column('course_code', String(8), db.ForeignKey('course.course_code'))
)

class StudyPlanSemester(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_number = Column(Integer, nullable=False, unique=True)
    total_units = Column(Integer, nullable=False, default=0)
    study_plan_id = Column(UUID(as_uuid=True), db.ForeignKey('study_plan.id'))
    courses = db.relationship('Course', secondary=semester_course, backref='study_plan_semesters')

    def __repr__(self):
        return f'<Semester for study plan with id: {self.study_plan_id}>'
    
    def toJSON(self):
        course_codes = []
        for course in self.courses:
            course_codes.append(course.course_code)

        return {
            "id": self.id,
            "semester_number": self.semester_number,
            "total_units": self.total_units,
            "course_codes": course_codes
        }

prerequisite = db.Table('prerequisites',
    Column('prerequisite_id', String(8), db.ForeignKey('course.course_code')),
    Column('course_id', String(8), db.ForeignKey('course.course_code'))
)

class Course(db.Model):
    course_code = Column(String(8), primary_key=True, nullable=False)
    course_name = Column(String(100))
    number_of_units = Column(Integer, nullable=False)
    is_offered_in_sem1 = Column(Boolean, nullable=False)
    is_offered_in_sem2 = Column(Boolean, nullable=False)
    prerequisites = db.relationship(
        'Course', 
        secondary=prerequisite, 
        primaryjoin=course_code == prerequisite.c.course_id,
        secondaryjoin=course_code == prerequisite.c.prerequisite_id,
        backref='required_by'
    )

    def __repr__(self):
        return f'<Course: {self.course_code} {self.course_name} ({self.number_of_units} units)>'

class AcademicPlan(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)