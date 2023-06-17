from flask import abort
from datetime import datetime
from ezConnect.models import StudyPlan, db

# Create a new study plan
def create_study_plan(body):
    new_study_plan = StudyPlan(
        creator_id=body['creator_id']
    )
    db.session.add(new_study_plan)
    db.session.commit()
    return {"message": f"Study plan <Title: {new_study_plan.title}> created at <Datetime: {new_study_plan.date_updated}> by <User: {new_study_plan.creator_id}>"}, 200

# Read a collection of published study plans
def get_published_study_plans():
    study_plans = StudyPlan.query.filter_by(is_published=True).all()
    study_plans = list(map(lambda study_plan: study_plan.toJSON(), study_plans))
    return study_plans, 200

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

    if is_published:
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
    personal_study_plans = StudyPlan.query.filter_by(creator_id=user_id).all()
    personal_study_plans = list(map(lambda study_plan: study_plan.toJSON(), personal_study_plans))
    return personal_study_plans, 200