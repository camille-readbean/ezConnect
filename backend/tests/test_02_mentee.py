from conftest import token1, token2, uuid1, uuid2
import json, uuid
from ezConnect.models import MentorRequest


def test_0010_create_user1_mentor_in_CS1101S(client):
    not_found_req_body = {
        "course_code": "string",
        "description": "string",
        "title": "string"
    }
    not_found_response = client.put(
        '/api/mentoring/mentees/new-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json=not_found_req_body
    )

    assert not_found_response.status_code == 404
    not_found_expected_response = {
        "error": f"Course {not_found_req_body['course_code']} not found"
    }
    assert json.loads(not_found_response.data) == not_found_expected_response

    req_body = {
    "course_code": "CS1101S",
    "description": "string",
    "title": "string"
    }
    response = client.put(
        '/api/mentoring/mentees/new-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json=req_body
    )

    assert response.status_code == 200
    mentor_request = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS1101S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    assert mentor_request is not None
    expected_response = {
        "message": f"{mentor_request} created", 
        # OKAY TAKE NOTE UUID HERE NEED TO CAST TO STRING
        "mentoring_post_uuid" : str(mentor_request.id)
    }
    assert json.loads(response.data) == expected_response


def test_0011_update_user2_mentee_in_CS1101S(client):
    mentor_request = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS1101S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    req_body = {
        "description": "From user 2",
        "is_published": False,
        "title": "CS1101S Help wanted"
    }
    response = client.put(
        f'/api/mentoring/mentees/{mentor_request.id}/update',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json=req_body
    )

    assert response.status_code == 200
    expected_response = {
        "message": f"{mentor_request} updated"
    }
    assert json.loads(response.data) == expected_response


def test_0012_get_all_mentee_postings(client):
    response = client.get(
        f'/api/mentoring/mentees',
        headers= {
            "Authorization" : f"Bearer {token1}"
        }
    )

    assert response.status_code == 200
    expected_response = {
        "postings" : []
    }
    assert json.loads(response.data) == expected_response

    mentor_request = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS1101S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    update_req_body = {
        "description": "From user 2",
        "is_published": True,
        "title": "CS1101S Help wanted"
    }
    update_response = client.put(
        f'/api/mentoring/mentees/{mentor_request.id}/update',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json=update_req_body
    )
    assert update_response.status_code == 200
    update_expected_response = {
        "message": f"{mentor_request} updated"
    }
    assert json.loads(update_response.data) == update_expected_response

    visibile_get_response = client.get(
        f'/api/mentoring/mentees',
        headers= {
            "Authorization" : f"Bearer {token1}"
        }
    )
    visibile_get_expected_response = {
        "postings" : [{
            'posting_uuid' : str(mentor_request.id),
            'course' : mentor_request.course_code,
            'title' : mentor_request.title,
            'description' : mentor_request.description,
            'date_updated' : mentor_request.date_updated.strftime("%Y-%m-%d %H:%M"),
            'name' : mentor_request.mentee.name
        }]
    }
    assert json.loads(visibile_get_response.data) == visibile_get_expected_response


def test_0013_get_user_mentor_requests(client):
    response = client.get(
        f'/api/mentoring/mentees/get-user-mentor-requests',
        headers= {
            "Authorization" : f"Bearer {token2}"
        }
    )
    mentor_request = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS1101S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    assert response.status_code == 200
    expected_response = {
        "postings" : [{
            'posting_uuid' : str(mentor_request.id),
            'course' : mentor_request.course_code,
            'title' : mentor_request.title,
            'description' : mentor_request.description,
            'date_updated' : mentor_request.date_updated.strftime("%Y-%m-%d %H:%M"),
            'name' : mentor_request.mentee.name
        }]
    }
    assert json.loads(response.data) == expected_response
    # Test user 1
    response2 = client.get(
        f'/api/mentoring/mentees/get-user-mentor-requests',
        headers= {
            "Authorization" : f"Bearer {token1}"
        }
    )
    expected_response2 = {
        "postings" : []
    }
    assert json.loads(response2.data) == expected_response2


# Security check as well, make sure user 2 cannot edit user 1
def test_0014_user2_update_user1_mentor_request_should_not_work(client):
    mentor_posting = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS1101S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    req_body = {
        "description": "lloled",
        "is_published": True,
        "title": "edited"
    }
    response = client.put(
        f'/api/mentoring/mentees/{mentor_posting.id}/update',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json=req_body
    )

    assert response.status_code == 401
    assert json.loads(response.data)['error'] == "User ID mismatch"