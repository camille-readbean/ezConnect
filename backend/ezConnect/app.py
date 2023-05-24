import connexion
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from ezConnect.models import db

# db = SQLAlchemy()

def create_app():
    connexion_app = connexion.App(__name__, specification_dir="./")
    connexion_app.add_api("swagger.yml")

    connexion_app.app.config.from_pyfile(filename="config.py")

    app = connexion_app.app

    db.init_app(app)
    migrate = Migrate(app, db)
    mm = Marshmallow(app)

    # application = app

    @app.route("/")
    def home():
        return "Ok"
    
    return app
    
# app = create_app()

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8000, debug=True)