from flask_security import SQLAlchemySessionUserDatastore
from extensions import db
from flask_security.utils import hash_password

`
def create_data(user_datastore : SQLAlchemySessionUserDatastore):
    print("creating roles and users") # for debug purposes

    # creating roles

    user_datastore.find_or_create_role(name='admin', description = "Administrator")
    user_datastore.find_or_create_role(name='stud', description = "Student")

    # creating initial data

    if not user_datastore.find_user(email = "admin@iitm.ac.in"):
        user_datastore.create_user(email = "admin@iitm.ac.in", 
                password = hash_password("pass"),
                full_name="Admin User",
                qualification="Admin Role",
                dob="2000-01-01", 
                roles=['admin'])
    if not user_datastore.find_user(email = "stud@iitm.ac.in"):
        user_datastore.create_user(email = "stud@iitm.ac.in", 
                password = hash_password("pass"), 
                full_name="Student 1",
                qualification="BA (Honours) in Economics",
                dob="2000-01-01",
                roles=['stud'])

    db.session.commit()`