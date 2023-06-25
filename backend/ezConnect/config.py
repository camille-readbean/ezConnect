import os
FRONTEND_HOSTNAME="http://localhost:3000" if os.environ.get('APP_ENV') != 'prod' else 'https://ezconnect.ruibin.me'

DOMAINS = ["u.nus.edu"]

DATABASE_USER = "postgres"
DATABASE_PASSWORD = "test"
DATABASE_HOSTNAME = 'localhost' if os.environ.get('APP_ENV') != 'prod' else 'postgresql-server'
SQLALCHEMY_DATABASE_URI = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOSTNAME}:5432/ezConnect"

# FORMAT '{hostname}:{port}'
REDIS_URL = "localhost:6379"

MAILERCFW_API_KEY = os.environ.get("MAILERCFW_API_KEY")
MAILERCFW_API_URL = "https://mailercfw.readbean.workers.dev/mailercfw/EzConnectMailerr"

## JWT Token authentication
JWT_ISSUER = "https://ezconnecttesting.b2clogin.com/e0305e3f-2b8a-4415-a1e8-0fb47ce870a7/v2.0/"
# Dont use this in production please
JWT_SECRET = "12345678910"
# 1 Hour
JWT_LIFETIME_SECONDS = 60 * 60 * 6
JWT_ALGORITHMS = "HS256"

## OAuth and OpenID connect stuff
JWT_KEY_URL = "https://ezconnecttesting.b2clogin.com/" + \
    "ezconnecttesting.onmicrosoft.com/b2c_1_ezconnectdev_susi/discovery/v2.0/keys"
JWT_AUD = "31e1fcdd-460b-4509-af8b-64fdbd68440a"