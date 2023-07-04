from flask import abort
from datetime import datetime
from ezConnect.models import User, PersonalStudyPlan, PublishedStudyPlan, db
from .study_plan_semester import create_semester

# Create a new study plan
def create_study_plan(body):
    creator_id=body['creator_id']

    user = User.query.get(creator_id)

    if not user:
        abort(404, f"User with id {creator_id} not found")

    new_study_plan = PersonalStudyPlan(
        creator_id=creator_id
    )
    db.session.add(new_study_plan)
    db.session.commit()
    for i in range(8):
        create_semester(new_study_plan.id)
    return {"study_plan_id": new_study_plan.id}, 200


# Read a particular personal study plan
def get_a_personal_study_plan(study_plan_id):
    study_plan = PersonalStudyPlan.query.get(study_plan_id)
    if not study_plan:
        abort(404, f"Personal study plan with id {study_plan_id} not found")
    return study_plan.toJSON(), 200


# Update an existing personal study plan
def update_personal_study_plan_title(study_plan_id, body):
    study_plan = PersonalStudyPlan.query.get(study_plan_id)
    if not study_plan:
        abort(404, f"Study plan with id {study_plan_id} not found")

    title = body.get('title', None)
    if title is None:
        abort(400, f"No information was passed in")

    study_plan.title = title
    study_plan.date_updated = datetime.utcnow()
    db.session.commit()

    return {"message": f"Study plan <{study_plan.title}> updated"}, 200

# Delete an existing study plan
# Corresponding published study plan will also be deleted if applicable
def delete_study_plan(study_plan_id):
    personal_study_plan = PersonalStudyPlan.query.get(study_plan_id)

    if personal_study_plan:
        if personal_study_plan.published_version is not None:
            published_study_plan = personal_study_plan.published_version
            db.session.delete(published_study_plan)
            db.session.commit()
        db.session.delete(personal_study_plan)
        db.session.commit()
    
    else:
        published_study_plan = PublishedStudyPlan.query.get(study_plan_id)
        if not published_study_plan:
            abort(404, f"Study plan with id {study_plan_id} not found")
        db.session.delete(published_study_plan)
        db.session.commit()
    
    return {"message": f"Study plan deleted"}, 204


# Read a collection of personal study plans
def get_personal_study_plans(user_id):
    user = User.query.get(user_id)

    if not user:
        abort(404, f"User with id {user_id} not found")

    personal_study_plans = PersonalStudyPlan.query.filter_by(creator_id=user_id).all()
    personal_study_plans = list(map(lambda study_plan: study_plan.toJSON(), personal_study_plans))
    return {"personal_study_plan_data": personal_study_plans}, 200