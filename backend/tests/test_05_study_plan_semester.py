import json
from conftest import uuid1

# variables to be used for multiple test cases
study_plan_id = None
semesters_info = None

# get personal study plans from valid user
def test_0053_get_personal_study_plan(client):
    response = client.get(f'/api/studyplan/user_personal/{uuid1}')
    assert response.status_code == 200

    received_response = json.loads(response.data)
    personal_study_plan_data = received_response['personal_study_plan_data']
    assert len(personal_study_plan_data) == 1

    global study_plan_id
    study_plan_id = personal_study_plan_data[0]['id']
    assert study_plan_id != None


# read semester information from a valid study plan
def test_0054_read_semester_info_from_a_valid_study_plan(client):
    response = client.get(f'/api/studyplan/semester/{study_plan_id}')
    assert response.status_code == 200

    global semesters_info
    semesters_info = json.loads(response.data)
    assert len(semesters_info) == 8
    
    semester = semesters_info['3']
    assert semester['id'] != None
    assert semester['semester_number'] == 3
    assert semester['total_units'] == 0
    assert semester['course_codes'] == []


# read semester ids from an invalid study plan
def test_0055_read_semester_info_from_a_invalid_study_plan(client):
    response = client.get('/api/studyplan/semester/a2c45678-1234-1234-1234-1234abcdef00')
    assert response.status_code == 404
    assert json.loads(response.data)['detail'] == 'Study plan with id a2c45678-1234-1234-1234-1234abcdef00 not found'


# update courses in a valid study plan semester
def test_0056_update_courses_in_valid_study_plan_semester(client):
    semester1_id = semesters_info['1']['id']

    new_course_codes = ['CS1101S', 'CS1231S', 'MA2001', 'MA1521']

    req_body = {
        'course_codes': new_course_codes
    }

    response = client.put(
        f'/api/study_plan_semester/{semester1_id}',
        json=req_body
    )
    
    assert response.status_code == 200

    semester = json.loads(response.data)
    assert semester['id'] != None
    assert semester['semester_number'] == 1
    assert semester['total_units'] == 16

    semester_course_codes = semester['course_codes']
    assert len(semester_course_codes) == 4
    for course_code in new_course_codes:
        assert course_code in semester_course_codes


# update courses in an invalid study plan semester
def test_0057_update_courses_in_invalid_study_plan_semester(client):
    req_body = {
        'course_codes': ['CS1101S', 'CS1231S', 'MA2001', 'MA1521']
    }

    response = client.put(
        '/api/study_plan_semester/abc45678-1234-1234-1234-1234abcdef00',
        json=req_body
    )

    assert response.status_code == 404
    assert json.loads(response.data)['detail'] == 'Study plan semester with id abc45678-1234-1234-1234-1234abcdef00 not found'


# update courses with no information passes in for a valid study plan semester
def test_0058_update_courses_with_invalid_request_body(client):
    semester1_id = semesters_info['1']['id']
    response = client.put(
        f'/api/study_plan_semester/{semester1_id}',
        json={}
    )
    assert response.status_code == 400
    assert json.loads(response.data)['error'] == '400 Bad Request: No information was passed in'


# read information from a valid semster
def test_0059_get_information_from_valid_semester(client):
    semester1_id = semesters_info['1']['id']
    response = client.get(f'/api/study_plan_semester/{semester1_id}')
    assert response.status_code == 200

    semester = json.loads(response.data)
    assert semester['id'] != None
    assert semester['semester_number'] == 1
    assert semester['total_units'] == 16

    course_codes = semester['course_codes']
    assert len(course_codes) == 4
    for course in ['CS1101S', 'CS1231S', 'MA2001', 'MA1521']:
        assert course in course_codes


# read information from an invalid semester
def test_0060_get_information_from_invalid_semester(client):
    response = client.get(f'/api/study_plan_semester/abc45678-1234-1234-1234-1234abcdef00')
    assert response.status_code == 404
    assert json.loads(response.data)['detail'] == 'Study plan semester with id abc45678-1234-1234-1234-1234abcdef00 not found'


# update courses again in multiple semesters in the same study plan
def test_0061_update_courses_in_multiple_valid_study_plan_semester(client):
    course_codes = [
        ['CS1101S', 'CS1231S', 'MA2001', 'IS1108'],
        ['CS2030S', 'CS2040S', 'MA1521', 'HSI1000', 'GEA1000', 'ES2660'],
        ['CS2100', 'ST2334'],
        ['CS2101', 'CS2103T'],
        ['CS2106'],
        ['CS2109S'],
        [],
        ['CS3230']
    ]
    
    for i in range(1, 9):
        semester_id = semesters_info[str(i)]['id']
        course_code = course_codes[i - 1]
        response = client.put(
            f'/api/study_plan_semester/{semester_id}',
            json={
                'course_codes': course_code
            }
        )
        assert response.status_code == 200
        semester = json.loads(response.data)
        assert semester['total_units'] == 4 * len(course_code)

        semester_course_codes = semester['course_codes']
        assert len(semester_course_codes) == len(course_code)
        for course in course_code:
            assert course in semester_course_codes


# delete semester in the middle of the study plan
def test_0062_delete_semester(client):
    semester4_id = semesters_info['4']['id']
    response = client.delete(f'/api/study_plan_semester/{semester4_id}')
    assert response.status_code == 204


# read semester information again from a valid study plan after deleting a semester
def test_0063_read_semester_info_from_a_valid_study_plan_after_semester_deletion(client):
    response = client.get(f'/api/studyplan/semester/{study_plan_id}')
    assert response.status_code == 200

    global semesters_info
    semesters_info = json.loads(response.data)
    assert len(semesters_info) == 7

    course_codes = [
        ['CS1101S', 'CS1231S', 'MA2001', 'IS1108'],
        ['CS2030S', 'CS2040S', 'MA1521', 'HSI1000', 'GEA1000', 'ES2660'],
        ['CS2100', 'ST2334'],
        ['CS2106'],
        ['CS2109S'],
        [],
        ['CS3230']
    ]
    
    for i in range(1, 8):
        semester = semesters_info[str(i)]
        assert semester['id'] != None
        assert semester['semester_number'] == i

        course_code = course_codes[i - 1]
        assert semester['total_units'] == 4 * len(course_code)

        semester_course_codes = semester['course_codes']
        assert len(semester_course_codes) == len(course_code)
        for course in course_code:
            assert course in semester_course_codes


# delete semester using an invalid study plan semester id
def test_0064_delete_invalid_semester(client):
    response = client.delete('/api/study_plan_semester/abc45678-1234-1234-1234-1234abcdef00')
    assert response.status_code == 404
    assert json.loads(response.data)['detail'] == 'Study plan semester with id abc45678-1234-1234-1234-1234abcdef00 not found'


# create a new semster in a valid study plan
def test_0065_create_semester(client):
    response = client.post(f'/api/studyplan/semester/{study_plan_id}')
    assert response.status_code == 200
    assert json.loads(response.data)["new_semester_id"] != None


# read semester information again from a valid study plan after creating a semester
def test_0066_read_semester_info_from_a_valid_study_plan_after_semester_creation(client):
    response = client.get(f'/api/studyplan/semester/{study_plan_id}')
    assert response.status_code == 200

    global semesters_info
    semesters_info = json.loads(response.data)
    assert len(semesters_info) == 8

    course_codes = [
        ['CS1101S', 'CS1231S', 'MA2001', 'IS1108'],
        ['CS2030S', 'CS2040S', 'MA1521', 'HSI1000', 'GEA1000', 'ES2660'],
        ['CS2100', 'ST2334'],
        ['CS2106'],
        ['CS2109S'],
        [],
        ['CS3230'],
        []
    ]
    
    for i in range(1, 9):
        semester = semesters_info[str(i)]
        assert semester['id'] != None
        assert semester['semester_number'] == i

        course_code = course_codes[i - 1]
        assert semester['total_units'] == 4 * len(course_code)

        semester_course_codes = semester['course_codes']
        assert len(semester_course_codes) == len(course_code)
        for course in course_code:
            assert course in semester_course_codes


# create a new semester in an invalid study plan
def test_0067_create_semester_in_invalid_study_plan(client):
    response = client.post('/api/studyplan/semester/a2c45678-1234-1234-1234-1234abcdef00')
    assert response.status_code == 404
    assert json.loads(response.data)['detail'] == 'Study plan with id a2c45678-1234-1234-1234-1234abcdef00 not found'
