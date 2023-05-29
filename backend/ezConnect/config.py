import os
FRONTEND_HOSTNAME="localhost:3000"

DOMAINS = ["u.nus.edu"]

DATABASE_USER = "postgres"
DATABASE_PASSWORD = "test"
DATABASE_HOSTNAME = 'postgresql-server'
SQLALCHEMY_DATABASE_URI = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOSTNAME}:5432/ezConnect"

# FORMAT '{hostname}:{port}'
REDIS_URL = "localhost:6379"

MAILERCFW_API_KEY = os.environ.get("MAILERCFW_API_KEY")
MAILERCFW_API_URL = "https://mailercfw.readbean.workers.dev/mailercfw/EzConnectMailerr"

## JWT Token authentication
JWT_ISSUER = "me.ruibin.ezconnect"
# Dont use this in production please
JWT_SECRET = "12345678910"
# 1 Hour
JWT_LIFETIME_SECONDS = 60 * 60 * 6
JWT_ALGORITHM = "HS256"