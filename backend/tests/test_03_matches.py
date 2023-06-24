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
    
    # Test /api/mentoring/matches/{mentoring_match_id}
    get_a_match_response = client.get(
        f'/api/mentoring/matches/{match.id}',
        headers={
            "Authorization" : f"Bearer {token1}"
        }
    )
    expected_match_response = {
        'posting_uuid' : str(match.id),
        'course_code' : match.course_code,
        'mentee_name' : match.mentee_user.name,
        'mentor_id' : str(match.mentor_id),
        'mentee_id' : str(match.mentee_id),
        'status' : match.status,
        'mentor_name' : match.mentor_user.name,
        'mentor_request_description' : mentor_request.description,
        'mentor_posting_description' : mentor_posting.description
    }
    assert get_a_match_response.status_code == 200
    assert json.loads(get_a_match_response.data) == expected_match_response

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
def test_0017_get_user_matches_and_test_redacted_email_before_match(client):
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
    # User 1 create new mentor_request in CM1102
    cm1102_response_new_1 = client.put(
        '/api/mentoring/mentees/new-mentee',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json={
            'course_code' : 'CM1102',
            'description' : 'by user 1',
            'title' : 'Pending email test'
        }
    )
    assert cm1102_response_new_1.status_code == 200
    # cm1102_request = MentorRequest.query \
    #     .filter(MentorRequest.course_code=='CM1102') \
    #     .filter(MentorRequest.user_id==uuid.UUID(uuid1))

    # user 2 create new mentor_posting in CM1102
    cm1102_response_new_2 = client.put(
        '/api/mentoring/mentors/new-mentor',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json={
            'course_code' : 'CM1102',
            'description' : 'by user 2',
            'title' : 'Pending email test'
        }
    )
    cm1102_posting = MentorPosting.query \
        .filter(MentorPosting.course_code=='CM1102') \
        .filter(MentorPosting.user_id==uuid.UUID(uuid2)) \
        .one()
    assert cm1102_response_new_2.status_code == 200
    assert json.loads(cm1102_response_new_2.data) == {
        "message": f"{cm1102_posting} created", 
        "mentoring_post_uuid" : str(cm1102_posting.id)
    }

    # User 1 request to user 2 be their mentee (request _a_ mentor) 
    # State left at pending, email should be redacted
    cm1102_new_match_by_user1_response = client.post(
        f'/api/mentoring/mentors/{cm1102_posting.id}/request',
        headers= {
            "Authorization" : f"Bearer {token1}"
        }
    )
    assert cm1102_new_match_by_user1_response.status_code == 200

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
    
    assert json.loads(cm1102_new_match_by_user1_response.data) == \
        {"message" : "ok, email sent to mentor. Please wait for them to accept"}
    cm1102_match = MentorMenteeMatch.query.filter(MentorMenteeMatch.course_code=='CM1102').one()
    
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
            },
            {
                'posting_uuid' : str(cm1102_match.id),
                'course_code' : 'CM1102',
                'mentor_name' : cm1102_match.mentor_user.name,
                'status' : 'Pending mentor',
                'email' : 'Hidden, pending mentor acceptance'
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
            },
            {
                'posting_uuid' : str(cm1102_match.id),
                'course_code' : 'CM1102',
                'mentee_name' : cm1102_match.mentee_user.name,
                'status' : 'Pending mentor',
                'email' : 'Hidden, pending mentor acceptance'
            }
        ]
    }
    # assert 
    # assert response1_dict == expected_response1