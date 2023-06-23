import pytest
from ezConnect.app import create_app
from ezConnect.models import db, User, MentorPosting, MentorRequest, MentorMenteeMatch
import os, json

uuid1 = '12345678-1234-1234-1234-1234abcdef00'
token1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHAiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNWJhNWVmNWUtMzEwOS00ZTc3LTg1YmQtY2ZlYjBkMzQ3ZTgyL3YyLjAiLCJuYW1lIjoidGVzdCB1c2VyIDEiLCJvaWQiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0YWJjZGVmMDAiLCJzdWIiOiIxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0YWJjZGVmMDAiLCJlbWFpbHMiOlsidGVzdGVtYWlsQHJ1aWJpbi5tZSJdLCJ0ZnAiOiJCMkNfMV9lemNvbm5lY3RkZXZfc3VzaSIsIm5vbmNlIjoiMWUxYTE3NGItMWYxMS00OTA1LTgyYzItNTBjOWZhNGFiZTllIiwic2NwIjoiQXBwLlVzZSIsImF6cCI6IjMxZTFmY2RkLTQ2MGItNDUwOS1hZjhiLTY0ZmRiZDY4NDQwYSIsInZlciI6IjEuMCIsImlhdCI6MTY4NzE2MTg1OSwiYXVkIjoiMzFlMWZjZGQtNDYwYi00NTA5LWFmOGItNjRmZGJkNjg0NDBhIiwiZXhwIjoxNjg5OTk1NDU5LCJpc3MiOiJodHRwczovL2V6Y29ubmVjdHRlc3RpbmcuYjJjbG9naW4uY29tL2UwMzA1ZTNmLTJiOGEtNDQxNS1hMWU4LTBmYjQ3Y2U4NzBhNy92Mi4wLyIsIm5iZiI6MTY4NzE2MTg1OX0.mb-G-EZGDXM4Tal_nHVbUz4iHyiF2z4r70RJ9P2kVgg'
uuid2 = 'aaaaaaaa-1234-1234-1234-1234abcdef00'
token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHAiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNWJhNWVmNWUtMzEwOS00ZTc3LTg1YmQtY2ZlYjBkMzQ3ZTgyL3YyLjAiLCJuYW1lIjoiVGVzdCB1c2VyIDIiLCJvaWQiOiJhYWFhYWFhYS0xMjM0LTEyMzQtMTIzNC0xMjM0YWJjZGVmMDAiLCJzdWIiOiJhYWFhYWFhYS0xMjM0LTEyMzQtMTIzNC0xMjM0YWJjZGVmMDAiLCJlbWFpbHMiOlsidGVzdGVtYWlsQHJ1aWJpbi5tZSJdLCJ0ZnAiOiJCMkNfMV9lemNvbm5lY3RkZXZfc3VzaSIsIm5vbmNlIjoiMWUxYTE3NGItMWYxMS00OTA1LTgyYzItNTBjOWZhNGFiZTllIiwic2NwIjoiQXBwLlVzZSIsImF6cCI6IjMxZTFmY2RkLTQ2MGItNDUwOS1hZjhiLTY0ZmRiZDY4NDQwYSIsInZlciI6IjEuMCIsImlhdCI6MTY4NzE2MTg1OSwiYXVkIjoiMzFlMWZjZGQtNDYwYi00NTA5LWFmOGItNjRmZGJkNjg0NDBhIiwiZXhwIjoxNjg5OTk1NDU5LCJpc3MiOiJodHRwczovL2V6Y29ubmVjdHRlc3RpbmcuYjJjbG9naW4uY29tL2UwMzA1ZTNmLTJiOGEtNDQxNS1hMWU4LTBmYjQ3Y2U4NzBhNy92Mi4wLyIsIm5iZiI6MTY4NzE2MTg1OX0.sI8ZpuIumzWuWVI1v-WZ_QJXAC1PZXm1XcVhOnvs2IE'

# Make sure DB is initialised
# Set up DB:
#  Inside backend/tests
#    ./setUpTestDB.sh
#  Then set environment variable
#    export APP_ENV=TESTING
#    flask db upgrade
#  run the script again to import all the courses and etc
#    ./setUpTestDB.sh
# It would be a bit troublesome for now to create the entries inside sqlalchemy
@pytest.fixture()
def app():
    os.environ['APP_ENV'] = 'testing'
    # ENABLE DEBUG MODE
    app = create_app()
    app.config.update({
        'SQLALCHEMY_DATABASE_URI' : "postgresql://postgres:test@localhost:5433/ezConnect",
        'DEBUG' : True
    })

    # other setup can go here
    with app.app_context():
        yield app

        # clean up / reset resources here
        db.session.close()
        # db.drop_all()
        # db.create_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()


