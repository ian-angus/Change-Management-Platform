from flask import Flask
from extensions import db
from models import Employee, UserAuth
from werkzeug.security import generate_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/dev.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

EMAIL = 'ian.a.n.thomson@gmail.com'
PASSWORD = 'Peterdedi&3'
NAME = 'Ian Angus Thomson'
JOB_POSITION = 'Change Manager'

with app.app_context():
    employee = Employee.query.filter_by(email=EMAIL).first()
    if not employee:
        print('Employee not found, creating new employee...')
        employee = Employee(name=NAME, email=EMAIL, job_position=JOB_POSITION)
        db.session.add(employee)
        db.session.commit()
    user_auth = UserAuth.query.filter_by(email=EMAIL).first()
    if not user_auth:
        print('UserAuth not found, creating new UserAuth...')
        user_auth = UserAuth(email=EMAIL, password_hash=generate_password_hash(PASSWORD), employee_id=employee.id)
        db.session.add(user_auth)
    else:
        print('UserAuth found, updating password...')
        user_auth.password_hash = generate_password_hash(PASSWORD)
    db.session.commit()
    print(f"Password for {EMAIL} has been set to '{PASSWORD}' (please change after login)") 