import connexion
import os, time
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from ezConnect.models import db
from ezConnect.utils.exceptions import handle_bad_request, handle_unauthorized
from werkzeug.exceptions import Unauthorized, BadRequest

# db = SQLAlchemy()

def create_app(config=None):
    # Time stamps all generated in UTC, python-jose need this to decode exp
    os.environ["TZ"] = "Etc/UTC"
    time.tzset()
    print("time set to UTC")
    connexion_app = connexion.App(__name__, specification_dir="./")
    connexion_app.add_api("swagger.yml")

    connexion_app.app.config.from_pyfile(filename="config.py")

    if os.environ.get('APP_ENV').lower() == 'testing':
        connexion_app.app.config.update({
            'SQLALCHEMY_DATABASE_URI' : "postgresql://postgres:test@localhost:5433/ezConnect",
        })
    if connexion_app.app.debug == True:
        print('\033[91m' + 'OPENID CONNECT BYPASS ENABLED FOR SIGNED JWT' + '\x1b[0m')

    app = connexion_app.app

    app.register_error_handler(400, handle_bad_request)
    app.register_error_handler(401, handle_unauthorized)

    db.init_app(app)
    migrate = Migrate(app, db)
    mm = Marshmallow(app)
    cors = CORS(app)
    # application = app

    @app.route("/")
    def home():
        return "Ok"
    
    return app
    
# app = create_app()

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8000, debug=True)