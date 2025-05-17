from flask import Flask
from extensions import db
from models import KeyMessage

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/dev.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    messages = KeyMessage.query.all()
    print(f"Found {len(messages)} key messages:")
    for msg in messages:
        print(f"- {msg.id}: {msg.title} (Project ID: {msg.project_id})") 