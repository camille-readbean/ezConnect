from flask import abort
from datetime import datetime
from ezConnect.models import User, StudyPlan, db
from .study_plan_semester import create_semester

# Create a new study plan
def create_study_plan(body):
    creator_id=body['creator_id']

    user = User.query.get(creator_id)

    if not user:
        abort(404, f"User with id {creator_id} not found")

    new_study_plan = StudyPlan(
        creator_id=creator_id
    )
    db.session.add(new_study_plan)
    db.session.commit()
    for i in range(8):
        create_semester(new_study_plan.id)
    return {"study_plan_id": new_study_plan.id}, 200

# Read a collection of published study plans
def get_published_study_plans():
    study_plans = StudyPlan.query.filter_by(is_published=True).all()
    study_plans = list(map(lambda study_plan: study_plan.toJSON(), study_plans))
    return {"published_study_plans_list": study_plans}, 200

# Read a particular study plan
def get_a_study_plan(study_plan_id):
    study_plan = StudyPlan.query.get(study_plan_id)

    if study_plan:
        return study_plan.toJSON(), 200
    else:
        abort(404, f"Study plan with id {study_plan_id} not found")

# Update an existing study plan
def update_study_plan(study_plan_id, body):
    study_plan = StudyPlan.query.get(study_plan_id)

    if not study_plan:
        abort(404, f"Study plan with id {study_plan_id} not found")

    study_plan.date_updated = datetime.utcnow()

    is_published = body.get('is_published', None)
    title = body.get('title', None)
    description = body.get('description', None)
    num_of_likes = body.get('num_of_likes', None)

    if is_published is not None:
        study_plan.is_published = is_published
    if title:
        study_plan.title = title
    if description:
        study_plan.description = description
    if num_of_likes:
        study_plan.num_of_likes = num_of_likes

    db.session.commit()

    return {"message": f"Study plan {study_plan.title} updated at {study_plan.date_updated} by {study_plan.creator_id}"}, 200

# Delete an existing study plan
def delete_study_plan(study_plan_id):
    study_plan = StudyPlan.query.get(study_plan_id)

    if study_plan:
        db.session.delete(study_plan)
        db.session.commit()
    else:
        abort(404, f"Study plan with id {study_plan_id} not found")

    return {"message": f"Study plan {study_plan.title} deleted"}, 200

# Read a collection of personal study plans
def get_personal_study_plans(user_id):
    user = User.query.get(user_id)

    if not user:
        abort(404, f"User with id {user_id} not found")

    personal_study_plans = StudyPlan.query.filter_by(creator_id=user_id).all()
    personal_study_plans = list(map(lambda study_plan: study_plan.toJSON(), personal_study_plans))
    return {"personal_study_plan_data": personal_study_plans}, 200