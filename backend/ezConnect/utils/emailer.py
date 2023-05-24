from ezConnect.config import MAILERCFW_API_KEY, MAILERCFW_API_URL
import requests

def send_email(subject: str, message: str, email: str, name: str):
    email_request = {
        "message": {
            "subject": f"{subject}",
            "content": [{
                "type": "text/plain",
                "value": f"{message}"
            }]
        },
        "toAddr": [
            {"email": email, "name": name}],
        "apiKey": MAILERCFW_API_KEY
    }
    resp = requests.post(MAILERCFW_API_URL, json=email_request)
    # print(resp.status_code)
    if resp.status_code != 200 and resp.status_code != 202:
        # print(MAILERCFW_API_KEY)
        # print(MAILERCFW_API_URL)
        raise Exception(f"{resp.status_code} - {resp.text}")
    return resp.text