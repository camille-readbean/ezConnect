from conftest import token1, token2, uuid1, uuid2
import json, uuid
from ezConnect.models import MentorRequest, MentorPosting, MentorMenteeMatch

# Uses resources created in the earlier tests for mentor (user 1) applying to mentee (user 2)
def test_0015_match_mentor_request_with_mentor(client):
    mentor_request = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS1101S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    mentor_request.is_published = False
    mentor_posting = MentorPosting.query \
        .filter(MentorPosting.course_code=="CS1101S") \
        .filter(MentorPosting.user_id==uuid.UUID(uuid1)) \
        .one_or_none()
    
    invalid_response = client.post(
        f'/api/mentoring/mentees/{mentor_request.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    invalid_expected_response = {'error': 'Mentee is not published'}
    assert invalid_response.status_code == 400
    assert json.loads(invalid_response.data) == invalid_expected_response

    mentor_request.is_published, mentor_posting.is_published = True, False
    invalid_response = client.post(
        f'/api/mentoring/mentees/{mentor_request.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    invalid_expected_response = {'error': 'Posting is not published'}
    assert invalid_response.status_code == 400
    assert json.loads(invalid_response.data) == invalid_expected_response

    # Temporarily change the course, so the mentor does not have a posting for this
    mentor_request.is_published, mentor_posting.is_published = True, True
    mentor_posting.course_code = 'LSM1301'
    invalid_response = client.post(
        f'/api/mentoring/mentees/{mentor_request.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    invalid_expected_response = {'error': 'Create a mentor posting in this course first'}
    assert invalid_response.status_code == 400
    assert json.loads(invalid_response.data) == invalid_expected_response

    # Successful request
    # Change course back
    mentor_posting.course_code = mentor_request.course_code
    response = client.post(
        f'/api/mentoring/mentees/{mentor_request.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    expected_response = {"message" : "ok, email sent to mentee. Please wait for them to accept"}
    assert response.status_code == 200
    assert json.loads(response.data) == expected_response

    # Get the match object
    match = MentorMenteeMatch.query \
        .filter(MentorMenteeMatch.mentor_id==uuid.UUID(uuid1)) \
        .filter(MentorMenteeMatch.mentee_id==uuid.UUID(uuid2)) \
        .filter(MentorMenteeMatch.course_code=='CS1101S') \
        .one()

    # Check duplicate match
    response = client.post(
        f'/api/mentoring/mentees/{mentor_request.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    assert response.status_code == 400
    expected_response = {'error' : 'You have already requested for this mentee'}
    assert json.loads(response.data) == expected_response

    # Go to wrong pathway
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    # Adding the ID check also serves to ensure they are on the right path
    # and that the mentor can't accept on the mentee behalf or vice versa
    expected_response = {'error' : 'You are not the mentor'}
    assert json.loads(response.data) == expected_response

    # Rejected by mentee
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 200
    expected_response = {'message' : 'Rejected the student mentor'}
    assert json.loads(response.data) == expected_response

    # Duplicate
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'You have already rejected the student mentor'}
    assert json.loads(response.data) == expected_response

    # Accept now
    match.status = 'Pending mentee'
    # As user 1 (mentor) in this case
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'You are not the mentee'}
    assert json.loads(response.data) == expected_response
    # User 1, mentor, try make the state active by 
    # accepting mentee even though it should be, 
    # mentee accepting mentor, not allowed
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'Not a valid state: Pending mentee'}
    assert json.loads(response.data) == expected_response

    # Finally accept the mentor
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : True,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 200
    expected_response = {'message' : 'ok, email sent to mentor, please get in touch with them'}
    assert json.loads(response.data) == expected_response
    assert match.status == 'Active'
    assert mentor_request.is_published == False

    # Duplicate accept, fail
    # Finally accept
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : True,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'Match is already active'}
    assert json.loads(response.data) == expected_response


# Mentee (user 1) applies to mentor (user 2), will create a new course code for CS2030S
def test_0016_match_mentor_posting_with_mentee(client):
    assert client.put(
        '/api/mentoring/mentees/new-mentee',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'course_code' : 'CS2030S',
            'description' : 'by user 2',
            'title' : 'hello'
        }
    ).status_code == 200
    assert client.put(
        '/api/mentoring/mentors/new-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'course_code' : 'CS2030S',
            'description' : 'by user 2',
            'title' : 'hello'
        }
    ).status_code == 200

    mentor_request = MentorRequest.query \
        .filter(MentorRequest.course_code=="CS2030S") \
        .filter(MentorRequest.user_id==uuid.UUID(uuid1)) \
        .one_or_none()
    mentor_request.is_published = False
    mentor_posting = MentorPosting.query \
        .filter(MentorPosting.course_code=="CS2030S") \
        .filter(MentorPosting.user_id==uuid.UUID(uuid2)) \
        .one_or_none()
    
    # Mentor not published
    mentor_posting.is_published = False
    invalid_response = client.post(
        f'/api/mentoring/mentors/{mentor_posting.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    invalid_expected_response = {'error': 'Mentor is not published'}
    assert invalid_response.status_code == 400
    assert json.loads(invalid_response.data) == invalid_expected_response

    mentor_request.is_published, mentor_posting.is_published = False, True
    invalid_response = client.post(
        f'/api/mentoring/mentors/{mentor_posting.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    invalid_expected_response = {'error': 'Request is not published'}
    assert invalid_response.status_code == 400
    assert json.loads(invalid_response.data) == invalid_expected_response

    # Temporarily change the course, so the mentee does not have a posting for this
    mentor_request.is_published, mentor_posting.is_published = True, True
    mentor_request.course_code = 'LSM1301'
    invalid_response = client.post(
        f'/api/mentoring/mentors/{mentor_posting.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    invalid_expected_response = {'error': 'Create a request for a mentor in this course first'}
    assert invalid_response.status_code == 400
    assert json.loads(invalid_response.data) == invalid_expected_response

    # Successful request
    # Change course back
    mentor_request.course_code = mentor_posting.course_code
    response = client.post(
        f'/api/mentoring/mentors/{mentor_posting.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    expected_response = {"message" : "ok, email sent to mentor. Please wait for them to accept"}
    assert response.status_code == 200
    assert json.loads(response.data) == expected_response

    # Get the match object
    match = MentorMenteeMatch.query \
        .filter(MentorMenteeMatch.mentor_id==uuid.UUID(uuid2)) \
        .filter(MentorMenteeMatch.mentee_id==uuid.UUID(uuid1)) \
        .filter(MentorMenteeMatch.course_code=='CS2030S') \
        .one()

    # Check duplicate match
    response = client.post(
        f'/api/mentoring/mentors/{mentor_posting.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
    )
    assert response.status_code == 400
    expected_response = {'error' : 'You have already requested for this mentor'}
    assert json.loads(response.data) == expected_response

    # Go to wrong pathway
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : f'You are not the mentee'}
    assert json.loads(response.data) == expected_response

    # Rejected by mentor
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 200
    expected_response = {'message' : 'Rejected student'}
    assert json.loads(response.data) == expected_response

    # Duplicate
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'You have already rejected the student'}
    assert json.loads(response.data) == expected_response

    # Accept now
    match.status = 'Pending mentor'
    # As user 1 (mentee) in this case
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'You are not the mentor'}
    assert json.loads(response.data) == expected_response
    # User 1, mentee, try make the state active by 
    # accepting mentor even though it should be, 
    # mentor accepting mentee, not allowed
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentor',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'accept' : False,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'Not a valid state: Pending mentor'}
    assert json.loads(response.data) == expected_response

    # Finally accept the mentee
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : True,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 200
    expected_response = {'message' : 'ok, email sent to mentee, please get in touch with them'}
    assert json.loads(response.data) == expected_response
    assert match.status == 'Active'
    assert mentor_request.is_published == False

    # Duplicate accept, fail
    # Finally accept
    response = client.post(
        f'/api/mentoring/matches/{match.id}/accept-mentee',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : True,
            'message' : 'hihi'
        }
    )
    assert response.status_code == 401
    expected_response = {'error' : 'Match is already active'}
    assert json.loads(response.data) == expected_response


# Get matches
def test_0017_get_user_matches(client):
    match1 = MentorMenteeMatch.query \
        .filter(MentorMenteeMatch.mentor_id==uuid.UUID(uuid1)) \
        .filter(MentorMenteeMatch.mentee_id==uuid.UUID(uuid2)) \
        .filter(MentorMenteeMatch.course_code=='CS1101S') \
        .one()
    match2 = MentorMenteeMatch.query \
        .filter(MentorMenteeMatch.mentor_id==uuid.UUID(uuid2)) \
        .filter(MentorMenteeMatch.mentee_id==uuid.UUID(uuid1)) \
        .filter(MentorMenteeMatch.course_code=='CS2030S') \
        .one()
    response1 = client.get(
        f'/api/mentoring/matches',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'accept' : True,
            'message' : 'hihi'
        }
    )
    response2 = client.get(
        f'/api/mentoring/matches',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'accept' : True,
            'message' : 'hihi'
        }
    )
    
    assert response1.status_code == 200 and response2.status_code == 200
    assert json.loads(response1.data) == {
        'mentor_matches' : [
            {
                'posting_uuid' : str(match1.id),
                'course_code' : match1.course_code,
                'mentee_name' : match1.mentee_user.name,
                'status' : match1.status,
                'email' : match1.mentee_user.email
            }
        ], 
        'mentee_matches' : [
            {
                'posting_uuid' : str(match2.id),
                'course_code' : match2.course_code,
                'mentor_name' : match2.mentor_user.name,
                'status' : match2.status,
                'email' : match2.mentor_user.email
            }
        ]
    }
    assert json.loads(response2.data) == {
        'mentee_matches' : [
            {
                'posting_uuid' : str(match1.id),
                'course_code' : match1.course_code,
                'mentor_name' : match1.mentor_user.name,
                'status' : match1.status,
                'email' : match1.mentor_user.email
            }
        ],
        'mentor_matches' : [
            {
                'posting_uuid' : str(match2.id),
                'course_code' : match2.course_code,
                'mentee_name' : match2.mentee_user.name,
                'status' : match2.status,
                'email' : match2.mentee_user.email
            }
        ]
    }
