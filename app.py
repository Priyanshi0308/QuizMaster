from flask import Flask
from extensions import db, security
from tasks import daily_reminder, monthly_report
import views
# import create_initial_data
import subjects, quizzes
# from workers import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from celeryconfig import LocalDevelopmentConfig
from flask_cors import CORS
from flask_restful import Api
from flask_security import SQLAlchemySessionUserDatastore, Security
import workers
from flask_caching import Cache
import os
from werkzeug.security import generate_password_hash
from flask_security.utils import hash_password
from models import db, User, Role

# celery_app = None

# def create_app():
#     app = Flask(__name__)

#     # configuration
#     app.config['DEBUG'] = True
#     app.config['SECRET_KEY'] = 'should-not-be-seen'
#     app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
#     app.config['SECURITY_PASSWORD_SALT'] = 'salty-password'

#     app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
#     app.config['SECURITY_TOKEN_MAX_AGE'] = 3600 #1hr 
#     app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

#     # cache config
#     app.config["DEBUG"]= True         # some Flask specific configs
#     app.config["CACHE_TYPE"]= "RedisCache"  # Flask-Caching related configs
#     app.config['CACHE_REDIS_HOST'] = 'localhost'
#     app.config['CACHE_REDIS_PORT'] = 6379
#     app.config['CACHE_REDIS_DB'] = 0
#     app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
#     app.config["CACHE_DEFAULT_TIMEOUT"]= 300

#     cache.init_app(app)

#     # tell flask to use sql_alchemy db
#     db.init_app(app)

#     with app.app_context():
#         from models import User, Role
#         from flask_security import SQLAlchemyUserDatastore

#         user_datastore = SQLAlchemyUserDatastore(db, User, Role)
#         security.init_app(app, user_datastore)
        
#         db.create_all()
#         create_initial_data.create_data(user_datastore)

            
#     # disable CSRF protection, from WTforms as well as flask security
#     app.config["WTF_CSRF_CHECK_DEFAULT"] = False
#     app.config['SECURITY_CSRF_PROTECT_MECHANISMS'] = []
#     app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True



#     # setup the view
#     views.create_views(app, user_datastore, db, cache)

#     #setup apis
#     subjects.api.init_app(app)
#     quizzes.api.init_app(app)


#     return app

# app = create_app()
# celery_app = celery_init_app(app)
# excel.init_excel(app)

basedir = os.path.abspath(os.path.dirname(__file__))
print(basedir)

app = None
api = None
celery = None
cache = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    app.app_context().push()
    # jwt = JWTManager(app)
    datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    
    celery=workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone="Asia/Kolkata",
        broker_connection_retry_on_startup=True
    )


    celery.Task=workers.ContextTask
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()

    views.create_views(app, datastore, db, cache)
    
    subjects.api.init_app(app)
    quizzes.api.init_app(app)

    return app, api, celery, cache


app, api,celery,cache= create_app()
CORS(app)


def create_roles_and_users():
    with app.app_context():
        db.create_all()

        # Create roles if they don't exist
        admin_role = Role.query.filter_by(name='admin').first()
        stud_role = Role.query.filter_by(name='stud').first()

        if admin_role is None:
            admin_role = Role(name='admin', description='Administrator')
            db.session.add(admin_role)

        if stud_role is None:
            stud_role = Role(name='stud', description='Student')
            db.session.add(stud_role)

        db.session.commit()

        # Create users if they don't exist
        user_datastore = app.security.datastore

        if not User.query.filter_by(email="admin@iitm.ac.in").first():
            user = user_datastore.create_user(
                email="admin@iitm.ac.in",
                password=hash_password("pass"),
                username="Admin User",
                qualification="Admin Role",
                dob="2000-01-01"
            )
            user_datastore.add_role_to_user(user, admin_role)

        if not User.query.filter_by(email="stud@iitm.ac.in").first():
            user = user_datastore.create_user(
                email="stud@iitm.ac.in",
                password=hash_password("pass"),
                username="Student 1",
                qualification="BA (Honours) in Economics",
                dob="2000-01-01"
            )
            user_datastore.add_role_to_user(user, stud_role)

        db.session.commit()




if __name__ == "__main__":
    create_roles_and_users()
    app.run(debug = True)