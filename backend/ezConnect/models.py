from sqlalchemy import (Column, Integer, String, DateTime, 
                        Boolean, Text, UniqueConstraint, Float, func)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, date, timedelta
import uuid

db = SQLAlchemy()

favorited_study_plan = db.Table(
    'favorited_study_plan',
    Column(
        'user_id', 
        UUID(as_uuid=True), 
        db.ForeignKey('users.azure_ad_oid'), 
        nullable=False
    ),
    Column(
        'published_study_plan_id', 
        UUID(as_uuid=True), 
        db.ForeignKey('published_study_plan.id'), 
        nullable=False
    ),
    Column(
        'date_favourited', 
        DateTime, 
        nullable=False, 
        default=datetime.utcnow
    ),
    UniqueConstraint(
        'user_id', 
        'published_study_plan_id', 
        name='unique_user_favourited_study_plan')
)

liked_study_plan = db.Table(
    'liked_study_plan',
    Column(
        'user_id', 
        UUID(as_uuid=True), 
        db.ForeignKey('users.azure_ad_oid'), 
        nullable=False
    ),
    Column(
        'published_study_plan_id',
        UUID(as_uuid=True),
        db.ForeignKey('published_study_plan.id'), 
        nullable=False
    ),
    Column(
        'date_liked', 
        DateTime, 
        nullable=False, 
        default=datetime.utcnow
    ),
    UniqueConstraint(
        'user_id', 
        'published_study_plan_id', 
        name='unique_user_liked_study_plan'
    )
)

viewed_study_plan = db.Table(
    'viewed_study_plan',
    Column(
        'user_id', 
        UUID(as_uuid=True), 
        db.ForeignKey('users.azure_ad_oid'), 
        nullable=False
    ),
    Column(
        'published_study_plan_id', 
        UUID(as_uuid=True), 
        db.ForeignKey('published_study_plan.id'), 
        nullable=False
    ),
    Column('date_viewed', DateTime, nullable=False, default=date.today)
)

class User(db.Model):
    __tablename__ = "users"
    azure_ad_oid = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(50))
    email = Column(String(120), unique=True)
    year = Column(Integer)
    programmes = db.relationship(
        'Programme', 
        backref='users', 
        secondary='programme_user'
    )
    degrees = db.relationship('Degree', backref='users', secondary='degree_user')
    
    personal_study_plans = db.relationship('PersonalStudyPlan', backref='creator')
    favourited_study_plans = db.relationship(
        'PublishedStudyPlan', 
        secondary=favorited_study_plan, 
        backref='favourited_by', 
        order_by='favorited_study_plan.c.date_favourited.desc()'
    )
    liked_study_plans = db.relationship(
        'PublishedStudyPlan', 
        secondary=liked_study_plan, 
        backref='liked_by'
    )
    viewed_study_plans = db.relationship(
        'PublishedStudyPlan', 
        secondary=viewed_study_plan, 
        backref='viewed_by'
    )

    mentor_postings = db.relationship('MentorPosting', backref='mentor')
    mentor_requests = db.relationship('MentorRequest', backref='mentee')
    # mentor_mentee_match = db.relationship('MentorMenteeMatch', backref='user')
    mentoring_match = db.relationship(
        'MentorMenteeMatch', 
        primaryjoin="User.azure_ad_oid == MentorMenteeMatch.mentor_id", 
        backref='mentor_user')
    mentee_match = db.relationship(
        'MentorMenteeMatch', 
        primaryjoin="User.azure_ad_oid == MentorMenteeMatch.mentee_id", 
        backref='mentee_user')


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
    
class PersonalStudyPlan(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    title = Column(String(150), default="Blank study plan")
    creator_id = Column(
        UUID(as_uuid=True), 
        db.ForeignKey('users.azure_ad_oid'), 
        nullable=False
    )
    semesters = db.relationship('StudyPlanSemester', backref='personal_study_plan')
    published_version = db.relationship(
        'PublishedStudyPlan', 
        uselist=False, 
        backref='personal_version'
    )

    def __repr__(self):
        return (f'<Study plan created by {self.creator.name}' 
                + f'last updated at {self.date_updated}>')

    def toJSON(self):
        semester_ids = {}
        for semester in self.semesters:
            semester_ids[semester.semester_number] = semester.id

        return {
            "id": self.id,
            "date_updated": self.date_updated.strftime("%d %b %Y"),
            "title": self.title,
            "creator_id": self.creator_id,
            "creator_name": User.query.get(self.creator_id).name,
            "semester_ids": semester_ids,
            "is_published": self.published_version is not None,
            "published_version_id": (self.published_version.id 
                                     if self.published_version is not None else None)
        }

class PublishedStudyPlan(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    title = Column(String(150), nullable=False, default="Blank study plan")
    description = Column(Text, nullable=False, default="")
    num_of_likes = Column(
        Integer, 
        db.CheckConstraint('num_of_likes>=0'), 
        nullable=False, 
        default = 0
    )
    creator_id = Column(
        UUID(as_uuid=True), 
        db.ForeignKey('users.azure_ad_oid'), 
        nullable=False
    )
    semesters = db.relationship('StudyPlanSemester', backref='published_study_plan')
    personal_study_plan_id = Column(
        UUID(as_uuid=True), 
        db.ForeignKey('personal_study_plan.id'), 
        nullable=False
    )

    def toJSON(self):
        semester_ids = {}
        for semester in self.semesters:
            semester_ids[semester.semester_number] = semester.id

        return {
            "id": self.id,
            "date_updated": self.date_updated.strftime("%d %b %Y"),
            "title": self.title,
            "description": self.description,
            "num_of_likes": self.num_of_likes,
            "creator_id": self.creator_id,
            "creator_name": User.query.get(self.creator_id).name,
            "semester_ids": semester_ids
        }
    
    def calculate_trend_score(self):
        view_weight = 1
        like_weight = 2
        favorite_weight = 3
        
        trend_score = (
            (
                db.session.query(func.count()).filter(
                    viewed_study_plan.c.published_study_plan_id == self.id
                ).scalar() * view_weight
            )
            + (
                db.session.query(func.count()).filter(
                    liked_study_plan.c.published_study_plan_id == self.id,
                    (liked_study_plan.c.date_liked 
                     > datetime.utcnow() - timedelta(days=30))
                ).scalar() * like_weight
            )
            + (
                db.session.query(func.count()).filter(
                    favorited_study_plan.c.published_study_plan_id == self.id,
                    (favorited_study_plan.c.date_favourited 
                     > datetime.utcnow() - timedelta(days=30))
                ).scalar() * favorite_weight
            )
        )

        return trend_score

semester_course = db.Table('semester_course',
    Column(
        'study_plan_semester_id', 
        UUID(as_uuid=True), 
        db.ForeignKey('study_plan_semester.id')
    ),
    Column('course_code', String(10), db.ForeignKey('course.course_code'))
)

class StudyPlanSemester(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    semester_number = Column(Integer, nullable=False)
    total_units = Column(Float, nullable=False, default=0)
    personal_study_plan_id = Column(
        UUID(as_uuid=True), 
        db.ForeignKey('personal_study_plan.id')
    )
    published_study_plan_id = Column(
        UUID(as_uuid=True), 
        db.ForeignKey('published_study_plan.id')
    )
    courses = db.relationship(
        'Course', 
        secondary=semester_course, 
        backref='study_plan_semesters'
    )
    __table_args__ = (UniqueConstraint(
        'personal_study_plan_id', 
        'semester_number', 
        name='semesters_in_personal_study_plan_unique'),
    )
    __table_args__ = (UniqueConstraint(
        'published_study_plan_id', 
        'semester_number', 
        name='semesters_in_published_study_plan_unique'),
    )

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

class MentorPosting(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_published = Column(Boolean, nullable=False, default=False)
    description = Column(Text)
    title = Column(String(50), default="Mentoring!")
    user_id = Column(UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'), nullable=False)
    course_code = Column(String(12), db.ForeignKey('course.course_code'), nullable=False)

    def __init__(self, user_id: uuid, 
                 course_code: str, 
                 title: str, 
                 description: str):
        self.user_id = user_id
        self.course_code = course_code
        self.title = title
        self.description = description
        self.is_published = True

    def __repr__(self):
        return f'<User {self.user_id} mentoring {self.course_code}>'

class MentorRequest(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_updated = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_published = Column(Boolean, nullable=False, default=False)
    description = Column(Text)
    title = Column(String(50), default="Looking for mentor")
    user_id = Column(UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'), nullable=False)
    course_code = Column(String(12), db.ForeignKey('course.course_code'), nullable=False)

    def __init__(self, user_id: uuid, 
                 course_code: str, 
                 title: str, 
                 description: str):
        self.user_id = user_id
        self.course_code = course_code
        self.title = title
        self.description = description
        self.is_published = True

    def __repr__(self):
        return f'<User {self.user_id} Looking for mentor in {self.course_code}>'
    
class MentorMenteeMatch(db.Model):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'), nullable=False)
    mentee_id = Column(UUID(as_uuid=True), db.ForeignKey('users.azure_ad_oid'), nullable=False)
    course_code = Column(String(12), db.ForeignKey('course.course_code'), nullable=False)
    status = Column(String(20))  
    # Status of the mentor-mentee relationship (e.g., "Pending mentor", "Pending mentee", "Reject", "Active", "Completed")

    # mentor = db.relationship("User", foreign_keys=[mentor_id], backref='mentored_courses')
    # mentee = db.relationship("User", foreign_keys=[mentee_id], backref='mentee_courses')

    def __init__(self, mentor_id, mentee_id, course_code, status):
        self.mentor_id = mentor_id
        self.mentee_id = mentee_id
        self.course_code = course_code
        self.status = status

    def __repr__(self):
        return f'<MentorMenteeCourse: Mentor {self.mentor_id}, Mentee {self.mentee_id}, Course {self.course_code}>'
