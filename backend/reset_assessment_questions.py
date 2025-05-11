from extensions import db
from models import AssessmentQuestion
from app import create_app  # Import the app factory

app = create_app()

with app.app_context():
    print("Dropping assessment_questions table...")
    AssessmentQuestion.__table__.drop(db.engine, checkfirst=True)

    print("Recreating assessment_questions table...")
    AssessmentQuestion.__table__.create(db.engine, checkfirst=True)

    print("assessment_questions table dropped and recreated.") 