from conftest import token1, token2, uuid1, uuid2
import json, uuid
import pytest
from ezConnect.models import MentorPosting


def test_0005_create_user1_mentor_in_no_such_course(client):
    req_body = {
    "course_code": "string",
    "description": "string",
    "title": "string"
    }
    response = client.put(
        '/api/mentoring/mentors/new-mentor',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json=req_body
    )

    assert response.status_code == 404
    expected_response = {
        "error": f"Course {req_body['course_code']} not found"
    }
    assert json.loads(response.data) == expected_response


def test_0006_create_user1_mentor_in_CS1101S(client):
    req_body = {
    "course_code": "CS1101S",
    "description": "string",
    "title": "string"
    }
    response = client.put(
        '/api/mentoring/mentors/new-mentor',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json=req_body
    )

    assert response.status_code == 200
    mentor_posting = MentorPosting.query \
        .filter(MentorPosting.course_code=="CS1101S") \
        .filter(MentorPosting.user_id==uuid.UUID(uuid1)) \
        .one_or_none()
    assert mentor_posting is not None
    expected_response = {
        "message": f"{mentor_posting} created", 
        # OKAY TAKE NOTE UUID HERE NEED TO CAST TO STRING
        "mentoring_post_uuid" : str(mentor_posting.id)
    }
    assert json.loads(response.data) == expected_response