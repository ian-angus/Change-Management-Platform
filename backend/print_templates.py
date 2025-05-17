from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import AssessmentTemplate

engine = create_engine('sqlite:///../instance/dev.db')
Session = sessionmaker(bind=engine)
session = Session()

templates = session.query(AssessmentTemplate).all()
for t in templates:
    print(f"{t.id}: {t.name} - {t.description}") 