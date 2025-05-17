import os
import sys
from datetime import datetime
from extensions import db
from models import KeyMessage, KeyMessageHistory, Employee, Project
from flask import Flask

# Setup Flask app context
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/dev.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

DEFAULT_MESSAGES = [
    {
        'title': 'Communicate Vision for Change',
        'supporting_statement': 'Clearly articulate the vision and objectives of the change initiative to all stakeholders.',
        'tone_purpose': 'Inspire and inform',
        'stage_tag': 'Early Change',
        'status': 'Draft',
    },
    {
        'title': 'Announce Project Kickoff',
        'supporting_statement': 'Officially announce the start of the project and introduce the project team.',
        'tone_purpose': 'Inform',
        'stage_tag': 'Early Change',
        'status': 'Draft',
    },
    {
        'title': 'Highlight Benefits',
        'supporting_statement': 'Emphasize the benefits and positive outcomes expected from the change.',
        'tone_purpose': 'Motivate',
        'stage_tag': 'Early Change',
        'status': 'Draft',
    },
    {
        'title': 'Address Concerns',
        'supporting_statement': 'Acknowledge and address common concerns and questions from stakeholders.',
        'tone_purpose': 'Reassure',
        'stage_tag': 'Early Change',
        'status': 'Draft',
    },
    {
        'title': 'Share Project Timeline',
        'supporting_statement': 'Provide a high-level timeline and key milestones for the project.',
        'tone_purpose': 'Inform',
        'stage_tag': 'Early Change',
        'status': 'Draft',
    },
    {
        'title': 'Celebrate Quick Wins',
        'supporting_statement': 'Share early successes and quick wins to build momentum.',
        'tone_purpose': 'Celebrate',
        'stage_tag': 'Mid-Project',
        'status': 'Draft',
    },
    {
        'title': 'Reinforce Key Messages',
        'supporting_statement': 'Repeat and reinforce the core messages throughout the project.',
        'tone_purpose': 'Reinforce',
        'stage_tag': 'Mid-Project',
        'status': 'Draft',
    },
    {
        'title': 'Provide Training Updates',
        'supporting_statement': 'Inform stakeholders about upcoming training sessions and resources.',
        'tone_purpose': 'Inform',
        'stage_tag': 'Mid-Project',
        'status': 'Draft',
    },
    {
        'title': 'Share Progress Reports',
        'supporting_statement': 'Regularly update stakeholders on project progress and next steps.',
        'tone_purpose': 'Update',
        'stage_tag': 'Mid-Project',
        'status': 'Draft',
    },
    {
        'title': 'Address Resistance',
        'supporting_statement': 'Communicate strategies for overcoming resistance and encourage feedback.',
        'tone_purpose': 'Encourage',
        'stage_tag': 'Mid-Project',
        'status': 'Draft',
    },
    {
        'title': 'Announce Go-Live Date',
        'supporting_statement': 'Officially announce the go-live date and what to expect.',
        'tone_purpose': 'Inform',
        'stage_tag': 'Go-Live',
        'status': 'Draft',
    },
    {
        'title': 'Provide Support Channels',
        'supporting_statement': 'Share information about support channels and help resources.',
        'tone_purpose': 'Support',
        'stage_tag': 'Go-Live',
        'status': 'Draft',
    },
    {
        'title': 'Celebrate Go-Live',
        'supporting_statement': 'Celebrate the successful go-live and thank everyone for their contributions.',
        'tone_purpose': 'Celebrate',
        'stage_tag': 'Go-Live',
        'status': 'Draft',
    },
    {
        'title': 'Share Lessons Learned',
        'supporting_statement': 'Communicate lessons learned and best practices from the project.',
        'tone_purpose': 'Reflect',
        'stage_tag': 'Go-Live',
        'status': 'Draft',
    },
    {
        'title': 'Announce Project Closure',
        'supporting_statement': 'Announce the formal closure of the project and next steps.',
        'tone_purpose': 'Inform',
        'stage_tag': 'Go-Live',
        'status': 'Draft',
    },
    {
        'title': 'Thank Stakeholders',
        'supporting_statement': 'Thank all stakeholders for their engagement and support throughout the project.',
        'tone_purpose': 'Appreciate',
        'stage_tag': 'Go-Live',
        'status': 'Draft',
    },
]

def seed_key_messages():
    with app.app_context():
        # Get first employee and project for assignment
        employee = Employee.query.first()
        project = Project.query.first()
        if not employee or not project:
            print("No employee or project found. Please add at least one employee and one project before seeding.")
            return
        for msg in DEFAULT_MESSAGES:
            key_message = KeyMessage(
                title=msg['title'],
                supporting_statement=msg['supporting_statement'],
                tone_purpose=msg['tone_purpose'],
                stage_tag=msg['stage_tag'],
                status=msg['status'],
                created_by_id=employee.id,
                project_id=project.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.session.add(key_message)
            db.session.commit()
            history = KeyMessageHistory(
                key_message_id=key_message.id,
                title=key_message.title,
                supporting_statement=key_message.supporting_statement,
                tone_purpose=key_message.tone_purpose,
                stage_tag=key_message.stage_tag,
                status=key_message.status,
                version=key_message.version,
                changed_by_id=employee.id,
                changed_at=datetime.utcnow(),
            )
            db.session.add(history)
            db.session.commit()
        print(f"Seeded {len(DEFAULT_MESSAGES)} key messages.")

if __name__ == "__main__":
    seed_key_messages() 