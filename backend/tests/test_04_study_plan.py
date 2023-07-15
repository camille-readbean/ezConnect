import json
from conftest import uuid1, uuid2

# variables to be used for multiple test cases
study_plan_id = None


# create new study plan with a valid user
def test_0040_create_new_study_plan(client):
  req_body = {
    "creator_id": uuid1
  }

  response = client.post(
    '/api/studyplan',
    json=req_body
  )
  assert response.status_code == 200  

  global study_plan_id
  study_plan_id = response.json["study_plan_id"]
  assert study_plan_id != None


# create new study plan with an invalid user id
def test_0041_create_new_study_plan_with_nonexistent_user_id(client):
  req_body = {
    "creator_id": 'abc45678-1234-1234-1234-1234abcdef00'
  }

  response = client.post(
    '/api/studyplan',
    json=req_body
  )

  assert response.status_code == 404 
  assert json.loads(response.data)['detail'] == 'User with id abc45678-1234-1234-1234-1234abcdef00 not found'


# get all published study plans
# currently no published study plans in the database
def test_0042_get_published_study_plan(client):
  response = client.get('/api/studyplan/publish')
  assert response.status_code == 200
  assert json.loads(response.data)['published_study_plans'] == []


# get personal study plans from valid user
# currently only one study plan
def test_0043_get_personal_study_plan(client):
  response = client.get(f'/api/studyplan/user_personal/{uuid1}')
  assert response.status_code == 200

  received_response = json.loads(response.data)
  personal_study_plan_data = received_response['personal_study_plan_data']
  assert len(personal_study_plan_data) == 1
  personal_study_plan_data = personal_study_plan_data[0]

  # check information in data received
  assert personal_study_plan_data['id'] == study_plan_id
  assert personal_study_plan_data['creator_id'] == uuid1
  assert personal_study_plan_data['title'] == 'Blank study plan'
  assert personal_study_plan_data['is_published'] == False
  assert len(personal_study_plan_data['semester_info_list']) == 8
  assert personal_study_plan_data['semester_info_list'][0]["course_codes"] == []


# get personal study plans from non-existent user
def test_0044_get_personal_study_plan_with_non_existent_user(client):
  response = client.get('/api/studyplan/user_personal/abc45678-1234-1234-1234-1234abcdef00')
  assert response.status_code == 404
  assert json.loads(response.data)['detail'] == 'User with id abc45678-1234-1234-1234-1234abcdef00 not found'


# update a study plan to published and change title and description
def test_0045_update_valid_study_plan(client):
  req_body = {
    'title': 'Computer Science Major with a second major in Math'
  }

  response = client.put(
    f'/api/studyplan/personal/{study_plan_id}',
    json=req_body
  )

  assert response.status_code == 200 
  study_plan_info = json.loads(response.data)
  assert study_plan_info['title'] == 'Computer Science Major with a second major in Math'

# update an invalid study plan
def test_0046_update_invalid_study_plan(client):
  req_body = {
    'title': 'Invalid study plan id',
  }

  response = client.put(
    f'/api/studyplan/personal/a2c45678-1234-1234-1234-1234abcdef00',
    json=req_body
  )
  assert response.status_code == 404
  assert json.loads(response.data)['detail'] == 'Study plan with id a2c45678-1234-1234-1234-1234abcdef00 not found'


# TODO: change test cases for updated method
# # update study plan and pass in no information
# def test_0047_update_valid_study_plan_with_no_information(client):
#   response = client.put(
#     f'/api/studyplan/personal/{study_plan_id}',
#     json={}
#   )
#   assert response.status_code == 400


# read personal study plan with a valid study plan id
def test_0048_read_valid_personal_study_plan(client):
  response = client.get(f'/api/studyplan/personal/{study_plan_id}')
  assert response.status_code == 200

  data = json.loads(response.data)
  assert data['id'] == study_plan_id
  assert data['creator_id'] == uuid1
  assert data['title'] == 'Computer Science Major with a second major in Math'
  assert data['is_published'] == False
  assert len(data['semester_info_list']) == 8


# read study plan with a non-existent study plan id
def test_0049_read_invalid_study_plan(client):
  response = client.get(f'/api/studyplan/personal/a2c45678-1234-1234-1234-1234abcdef00')
  assert response.status_code == 404
  assert json.loads(response.data)['detail'] == 'Personal study plan with id a2c45678-1234-1234-1234-1234abcdef00 not found'


# create another study plan in user 1 and delete the new study plan
def test_0050_create_another_new_study_plan_and_then_delete_it(client):
  req_body = {
    "creator_id": uuid1
  }

  response = client.post(
    '/api/studyplan',
    json=req_body
  )
  assert response.status_code == 200

  new_study_plan_id = response.json["study_plan_id"]
  assert new_study_plan_id != None

  response = client.delete(f'/api/studyplan/{new_study_plan_id}')
  assert response.status_code == 204


# get all personal study plans again
def test_0051_get_personal_study_plan(client):
  response = client.get(f'/api/studyplan/user_personal/{uuid1}')
  assert response.status_code == 200

  received_response = json.loads(response.data)
  personal_study_plan_data = received_response['personal_study_plan_data']
  assert len(personal_study_plan_data) == 1
  data = personal_study_plan_data[0]

  assert data['id'] == study_plan_id
  assert data['creator_id'] == uuid1
  assert data['title'] == 'Computer Science Major with a second major in Math'
  assert data['is_published'] == False
  assert len(data['semester_info_list']) == 8


# get personal study plans from user with no study plans
def test_0052_get_personal_study_plans_from_user_2(client):
  response = client.get(f'/api/studyplan/user_personal/{uuid2}')
  assert response.status_code == 200

  received_response = json.loads(response.data)
  personal_study_plan_data = received_response['personal_study_plan_data']
  assert personal_study_plan_data == []