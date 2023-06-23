from conftest import token1, token2, uuid1, uuid2
import json, uuid
from ezConnect.models import MentorPosting


def test_0004_create_user1_mentor_in_no_such_course(client):
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


def test_0005_create_user1_mentor_in_CS1101S(client):
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


def test_0006_update_user1_mentor_in_CS1101S(client):
    mentor_posting = MentorPosting.query \
        .filter(MentorPosting.course_code=="CS1101S") \
        .filter(MentorPosting.user_id==uuid.UUID(uuid1)) \
        .one_or_none()
    req_body = {
        "description": "Hii",
        "is_published": False,
        "title": "Heyey"
    }
    response = client.put(
        f'/api/mentoring/mentors/{mentor_posting.id}/update',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json=req_body
    )

    assert response.status_code == 200
    expected_response = {
        "message": f"{mentor_posting} updated"
    }
    assert json.loads(response.data) == expected_response


def test_0007_get_all_mentor_postings(client):
    response = client.get(
        f'/api/mentoring/mentors',
        headers= {
            "Authorization" : f"Bearer {token1}"
        }
    )

    assert response.status_code == 200
    expected_response = {
        "postings" : []
    }
    assert json.loads(response.data) == expected_response


def test_0008_get_user_mentor_postings(client):
    response = client.get(
        f'/api/mentoring/mentors/get-user-mentor-postings',
        headers= {
            "Authorization" : f"Bearer {token1}"
        }
    )
    posting = MentorPosting.query \
        .filter(MentorPosting.course_code=="CS1101S") \
        .filter(MentorPosting.user_id==uuid.UUID(uuid1)) \
        .one_or_none()
    assert response.status_code == 200
    expected_response = {
        "postings" : [{
            'posting_uuid' : str(posting.id),
            'course' : posting.course_code,
            'title' : posting.title,
            'description' : posting.description,
            'date_updated' : posting.date_updated.strftime("%Y-%m-%d %H:%M"),
            'name' : posting.mentor.name
        }]
    }
    assert json.loads(response.data) == expected_response
    # Test user 2
    response2 = client.get(
        f'/api/mentoring/mentors/get-user-mentor-postings',
        headers= {
            "Authorization" : f"Bearer {token2}"
        }
    )
    expected_response2 = {
        "postings" : []
    }
    assert json.loads(response2.data) == expected_response2


# Security check as well, make sure user 2 cannot edit user 1
def test_0009_user2_update_user1_posting_should_not_work(client):
    mentor_posting = MentorPosting.query \
        .filter(MentorPosting.course_code=="CS1101S") \
        .filter(MentorPosting.user_id==uuid.UUID(uuid1)) \
        .one_or_none()
    req_body = {
        "description": "Hii",
        "is_published": True,
        "title": "Heyey"
    }
    response = client.put(
        f'/api/mentoring/mentors/{mentor_posting.id}/update',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json=req_body
    )

    assert response.status_code == 401
    assert json.loads(response.data)['error'] == "User ID mismatch"