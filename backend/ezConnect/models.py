from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, UniqueConstraint, Float
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    azure_ad_oid = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(50))
    email = Column(String(120), unique=True)
    year = Column(Integer)
    programmes = db.relationship('Programme', backref='users', secondary='programme_user')
    degrees = db.relationship('Degree', backref='users', secondary='degree_user')

    study_plans = db.relationship('StudyPlan', backref='creator')

    def __init__(self, azure_ad_oid: uuid, name: String, email: String,
                 year: Integer):
        self.azure_ad_oid = azure_ad_oid
        self.name = name
        self.email = email
        self.year = year
        # TO DO Implement degree and programme
        # self.degrees = degree
        # self.programme
        print(f"User {name} created")

    def __repr__(self):
        return f'<User {self.name!r} - Year {self.year} {self.degrees}, {self.programmes}>'
    
class StudyPlan(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_published = Column(Boolean, nullable=False, default=False)
    title = Column(String(150), default="Blank study plan")
    description = Column(Text)
    num_of_likes = Column(Integer, db.CheckConstraint('num_of_likes>=0'), default = 0)
    creator_id = Column(UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'), nullable=False)
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
    Column('course_code', String(10), db.ForeignKey('course.course_code'))
)

class StudyPlanSemester(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_number = Column(Integer, nullable=False)
    total_units = Column(Float, nullable=False, default=0)
    study_plan_id = Column(UUID(as_uuid=True), db.ForeignKey('study_plan.id'))
    courses = db.relationship('Course', secondary=semester_course, backref='study_plan_semesters')
    __table_args__ = (UniqueConstraint('study_plan_id', 'semester_number', name='semesters_in_study_plan_unique'),)

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
    Column('prerequisite_code', String(10), db.ForeignKey('course.course_code')),
    Column('course_code', String(10), db.ForeignKey('course.course_code'))
)

class Course(db.Model):
    course_code = Column(String(12), primary_key=True, nullable=False)
    course_name = Column(String(100))
    number_of_units = Column(Float, nullable=False)
    is_offered_in_sem1 = Column(Boolean, nullable=False)
    is_offered_in_sem2 = Column(Boolean, nullable=False)
    prerequisites = db.relationship(
        'Course', 
        secondary=prerequisite, 
        primaryjoin=course_code == prerequisite.c.course_code,
        secondaryjoin=course_code == prerequisite.c.prerequisite_code,
        backref='required_by'
    )

    def __repr__(self):
        return f'<Course: {self.course_code} {self.course_name} ({self.number_of_units} units)>'

course_user = db.Table('course_user',
    Column('course_code', String(10), db.ForeignKey('course.course_code')),
    Column('user_id', UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'))
)

class Programme(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)

programme_user = db.Table('programme_user',
    Column('programme_id', UUID(as_uuid=True), db.ForeignKey('programme.id')),
    Column('user_id', UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'))
)

class Degree(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False)

degree_user = db.Table('degree_user',
    Column('degree_id', UUID(as_uuid=True), db.ForeignKey('degree.id')),
    Column('user_id', UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'))
)