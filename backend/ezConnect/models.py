from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, Boolean, Text
from flask_sqlalchemy import SQLAlchemy
from Crypto.Random import get_random_bytes
from base64 import urlsafe_b64encode
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid


db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    azure_ad_oid = Column(UUID(as_uuid=True), unique=True)
    name = Column(String(50))
    email = Column(String(120), unique=True)
    # password_hash = Column(LargeBinary())
    # salt = Column(LargeBinary())
    year = Column(Integer)
    # course = Column(String(120))
    programmes = db.relationship('Programme', backref='users', secondary='programme_user')
    degrees = db.relationship('Degree', backref='users', secondary='degree_user')

    study_plans = db.relationship('StudyPlan', backref='creator')

    def __init__(self, azure_ad_oid: uuid, name: String, email: String,
                 year: Integer, degree: String, programme: String):
        self.azure_ad_oid = azure_ad_oid
        self.name = name
        self.email = email
        self.year = year
        # TO DO Implement degree and programme
        # self.degrees = degree
        # self.programme
        print(f"User progamme: {programme} - not yet implemented")
        print(f"User degree: {degree} - not yet implemented")

    def __repr__(self):
        return f'<User {self.name!r}>'
    
class StudyPlan(db.Model):
    __tablename__ = "study_plans"
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

semester_course = db.Table('semester_course',
    Column('study_plan_semester_id', UUID(as_uuid=True), db.ForeignKey('study_plan_semester.id')),
    Column('course_id', UUID(as_uuid=True), db.ForeignKey('course.id'))
)

class StudyPlanSemester(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    total_units = Column(Integer, nullable=False, default=0)
    study_plan_id = Column(UUID(as_uuid=True), db.ForeignKey('study_plans.id'))
    courses = db.relationship('Course', secondary=semester_course, backref='study_plan_semesters')

class Course(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_code = Column(String(8), unique=True, nullable=False)
    course_name = Column(String(100))
    number_of_units = Column(Integer, nullable=False)
    is_offered_in_sem1 = Column(Boolean, nullable=False)
    is_offered_in_sem2 = Column(Boolean, nullable=False)
    # prerequisites = db.relationship('requisite', backref='prerequisite_for')

course_user = db.Table('course_user',
    Column('course_id', UUID(as_uuid=True), db.ForeignKey('course.id')),
    Column('user_id', Integer, db.ForeignKey('users.id'))
)

class Programme(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)

programme_user = db.Table('programme_user',
    Column('programme_id', UUID(as_uuid=True), db.ForeignKey('programme.id')),
    Column('user_id', Integer, db.ForeignKey('users.id'))
)

class Degree(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)

degree_user = db.Table('degree_user',
    Column('degree_id', UUID(as_uuid=True), db.ForeignKey('degree.id')),
    Column('course_id', Integer, db.ForeignKey('users.id'))
)