import os
HOSTNAME="localhost:5000"

DOMAINS = ["u.nus.edu"]

DATABASE_USER = "postgres"
DATABASE_PASSWORD = "test"
SQLALCHEMY_DATABASE_URI = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@localhost:5432/ezConnect"

MAILERCFW_API_KEY = os.environ.get("MAILERCFW_API_KEY")
MAILERCFW_API_URL = "https://mailercfw.readbean.workers.dev/mailercfw/EzConnectMailerr"