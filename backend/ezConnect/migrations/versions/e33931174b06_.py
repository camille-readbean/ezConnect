"""empty message

Revision ID: e33931174b06
Revises: 
Create Date: 2023-06-19 06:04:45.109971

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e33931174b06'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('course',
    sa.Column('course_code', sa.String(length=12), nullable=False),
    sa.Column('course_name', sa.String(length=100), nullable=True),
    sa.Column('number_of_units', sa.Float(), nullable=False),
    sa.Column('is_offered_in_sem1', sa.Boolean(), nullable=False),
    sa.Column('is_offered_in_sem2', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('course_code')
    )
    op.create_table('degree',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('programme',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('azure_ad_oid', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('year', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('azure_ad_oid'),
    sa.UniqueConstraint('email')
    )
    op.create_table('course_user',
    sa.Column('course_code', sa.String(length=10), nullable=True),
    sa.Column('user_id', sa.UUID(), nullable=True),
    sa.ForeignKeyConstraint(['course_code'], ['course.course_code'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.azure_ad_oid'], )
    )
    op.create_table('degree_user',
    sa.Column('degree_id', sa.UUID(), nullable=True),
    sa.Column('user_id', sa.UUID(), nullable=True),
    sa.ForeignKeyConstraint(['degree_id'], ['degree.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.azure_ad_oid'], )
    )
    op.create_table('prerequisites',
    sa.Column('prerequisite_code', sa.String(length=10), nullable=True),
    sa.Column('course_code', sa.String(length=10), nullable=True),
    sa.ForeignKeyConstraint(['course_code'], ['course.course_code'], ),
    sa.ForeignKeyConstraint(['prerequisite_code'], ['course.course_code'], )
    )
    op.create_table('programme_user',
    sa.Column('programme_id', sa.UUID(), nullable=True),
    sa.Column('user_id', sa.UUID(), nullable=True),
    sa.ForeignKeyConstraint(['programme_id'], ['programme.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.azure_ad_oid'], )
    )
    op.create_table('study_plan',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('date_updated', sa.DateTime(), nullable=False),
    sa.Column('is_published', sa.Boolean(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('num_of_likes', sa.Integer(), nullable=True),
    sa.Column('creator_id', sa.UUID(), nullable=False),
    sa.ForeignKeyConstraint(['creator_id'], ['users.azure_ad_oid'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('study_plan_semester',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('semester_number', sa.Integer(), nullable=False),
    sa.Column('total_units', sa.Float(), nullable=False),
    sa.Column('study_plan_id', sa.UUID(), nullable=True),
    sa.ForeignKeyConstraint(['study_plan_id'], ['study_plan.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('study_plan_id', 'semester_number', name='semesters_in_study_plan_unique')
    )
    op.create_table('semester_course',
    sa.Column('study_plan_semester_id', sa.UUID(), nullable=True),
    sa.Column('course_code', sa.String(length=10), nullable=True),
    sa.ForeignKeyConstraint(['course_code'], ['course.course_code'], ),
    sa.ForeignKeyConstraint(['study_plan_semester_id'], ['study_plan_semester.id'], )
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('semester_course')
    op.drop_table('study_plan_semester')
    op.drop_table('study_plan')
    op.drop_table('programme_user')
    op.drop_table('prerequisites')
    op.drop_table('degree_user')
    op.drop_table('course_user')
    op.drop_table('users')
    op.drop_table('programme')
    op.drop_table('degree')
    op.drop_table('course')
    # ### end Alembic commands ###