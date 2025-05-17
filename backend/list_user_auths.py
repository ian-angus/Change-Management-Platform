from flask import Flask
from extensions import db
from models import UserAuth

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/dev.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    users = UserAuth.query.all()
    for user in users:
        print(f"{user.id}: {repr(user.email)} (employee_id: {user.employee_id})") 