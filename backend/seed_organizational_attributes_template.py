from app import create_app
from extensions import db
from models import AssessmentTemplate, AssessmentQuestion

app = create_app()

TEMPLATE_NAME = "Organizational Attributes Assessment"
TEMPLATE_DESCRIPTION = (
    "Assess your organization's culture, history, and readiness for change. "
    "This assessment guides the development of change management strategies."
)

QUESTIONS = [
    {"text": "How would you describe your organization's attitude toward change?", "type": "single_select", "options": ["Change-resistant", "Neutral", "Change-ready"]},
    {"text": "Please explain why you chose the above.", "type": "long_text"},
    {"text": "Does the current employee value system allow change to be easily mandated from above?", "type": "likert"},
    {"text": "Please explain your answer.", "type": "long_text"},
    {"text": "Identify any institutions, policies, or practices that reinforce this value structure.", "type": "long_text"},
    {"text": "How would you describe the current level of change underway in your organization?", "type": "single_select", "options": ["Over-saturated with change", "Several changes underway", "Only a few changes taking place", "No significant changes"]},
    {"text": "List any key initiatives that overlap or interact with your change.", "type": "long_text"},
    {"text": "How is power and authority distributed in your organization?", "type": "single_select", "options": ["Centralized (few key leaders)", "Distributed (many managers)", "Other (please specify)"]},
    {"text": 'Identify the key "power positions" in the organization (where does the true power reside?).', "type": "long_text"},
    {"text": "Past changes in the organization were typically:", "type": "single_select", "options": ["Successful", "Failures", "Mixed"]},
    {"text": 'Are employees skeptical of change, perceiving initiatives as just the next "flavor of the month"?', "type": "likert"},
    {"text": "Please explain why.", "type": "long_text"},
    {"text": "What key lessons did you learn from past changes?", "type": "long_text"},
    {"text": "What caused past changes to succeed or fail?", "type": "long_text"},
    {"text": "List any immediate and anticipated challenges presented by middle managers and supervisors.", "type": "long_text"},
    {"text": "Identify potential advocates, neutralizers, or renegades among middle managers.", "type": "long_text"}
]

with app.app_context():
    # Check if template already exists
    template = AssessmentTemplate.query.filter_by(name=TEMPLATE_NAME).first()
    if template:
        print(f"Template '{TEMPLATE_NAME}' already exists. Skipping creation.")
    else:
        template = AssessmentTemplate(name=TEMPLATE_NAME, description=TEMPLATE_DESCRIPTION)
        db.session.add(template)
        db.session.commit()
        print(f"Created template: {TEMPLATE_NAME}")

    # Add questions
    for idx, q in enumerate(QUESTIONS):
        exists = AssessmentQuestion.query.filter_by(template_id=template.id, text=q["text"]).first()
        if exists:
            print(f"Question already exists: {q['text']}")
            continue
        question = AssessmentQuestion(
            template_id=template.id,
            text=q["text"],
            type=q["type"],
            options=q.get("options"),
            order=idx
        )
        db.session.add(question)
        print(f"Added question: {q['text']}")
    db.session.commit()
    print("All questions added.") 