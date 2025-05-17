from flask import Flask
from extensions import db
from models import Assessment, Employee

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/dev.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    assessments = Assessment.query.all()
    print(f"Total assessments: {len(assessments)}\n")
    for a in assessments:
        print(f"Assessment ID: {a.id}")
        print(f"  Type: {a.assessment_type}")
        print(f"  Project ID: {a.project_id}")
        print(f"  Status: {a.status}")
        print(f"  Stakeholders:")
        for s in a.stakeholders:
            print(f"    - {s.name} ({s.email})")
        print("") 