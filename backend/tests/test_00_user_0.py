from conftest import token1, token2, uuid1, uuid2
import json
import pytest

def test_0000_create_user1(client):
    req_body = {
        "name": "Test User 1",
        "email": "testemail@ruibin.me",
        "year": 2,
        "degrees": [
            {
                "id": "fce92068-5d0d-400a-aeb4-2673370b84c5",
                "title": "Computer Science"
            },
        ],
        "programmes": [
            {
                "id": "e219ca40-ed55-4976-ae2a-c46f2a77ae02",
                "title": "University Town College Programme"
            },
        ],
        "azure_ad_oid": '12345678-1234-1234-1234-1234abcdef00'
    }
    response = client.put(
        '/api/user/create-user',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json=req_body
    )

    assert response.status_code == 200
    expected_response = {
        "message": f"User Test User 1 12345678-1234-1234-1234-1234abcdef00 Year 2 created\nYou will be redirected shortly"
    }
    assert json.loads(response.data) == expected_response


def test_0001_create_user1_again(client):
    req_body = {
        "name": "Test User 1",
        "email": "testemail@ruibin.me",
        "year": 2,
        "degrees": [
            {
                "id": "fce92068-5d0d-400a-aeb4-2673370b84c5",
                "title": "Computer Science"
            },
        ],
        "programmes": [
        ],
        "azure_ad_oid": '12345678-1234-1234-1234-1234abcdef00'
    }
    response = client.put(
        '/api/user/create-user',
        headers= {
            "Authorization" : f"Bearer {token1}"
        },
        json=req_body
    )

    assert response.status_code == 401
    assert json.loads(response.data) == {'error' : 'You already have an account'}


def test_0002_no_token(client):
    req_body = {
        "name": "Test user 2",
        "email": "testemail@ruibin.me",
        "year": 1,
        "degrees": [
            {
                "id": "982aee85-7502-42cc-b6f4-1b80387a8988",
                "title": "Business Administration"
            },
        ],
        "programmes": [
        ],
        "azure_ad_oid": 'aaaaaaaa-1234-1234-1234-1234abcdef00'
    }
    response = client.put(
        '/api/user/create-user',
        json=req_body
    )
    assert response.status_code == 401


def test_0003_create_user2(client):
    req_body = {
        "name": "Test user 2",
        "email": "testemail2@ruibin.me",
        "year": 1,
        "degrees": [
            {
                "id": "982aee85-7502-42cc-b6f4-1b80387a8988",
                "title": "Business Administration"
            },
            {
                "id": "bcdc5e08-c662-456f-b98f-3f1239cb5b43",
                "title": "Business Analytics"
            },
        ],
        "programmes": [
            {
                "id": "6e6d63ab-2709-46de-956a-02cc9759ab15",
                "title": "NUS College"
            },
            {
                "id": "82e9f6be-e636-4e9a-b132-8089b8beb77c",
                "title": "Minor in Communications and New Media"
            },
            {
                "id": "ba0550f2-4448-4c25-bc55-7605428b105d",
                "title": "Minor in History"
            },
        ],
        "azure_ad_oid": 'aaaaaaaa-1234-1234-1234-1234abcdef00'
    }
    response = client.put(
        '/api/user/create-user',
        headers= {
            "Authorization" : f"Bearer {token2}"
        },
        json=req_body
    )

    assert response.status_code == 200
    expected_response = {
        "message": f"User Test user 2 aaaaaaaa-1234-1234-1234-1234abcdef00 Year 1 created\nYou will be redirected shortly"
    }
    assert json.loads(response.data) == expected_response
