from app import create_app
from extensions import db
from models import AssessmentTemplate, AssessmentQuestion

app = create_app()

TEMPLATE_NAME = "Prosci Risk Assessment"
TEMPLATE_DESCRIPTION = (
    "Assess change and organizational readiness using the Prosci methodology. "
    "This assessment covers change characteristics and organizational attributes to help determine project risk and required change management effort."
)

SCALE_OPTIONS = ["1", "2", "3", "4", "5"]

QUESTIONS = [
    # Change Characteristics Assessment
    {"text": "Scope of change (1 = Workgroup, 5 = Enterprise)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Number of impacted employees (1 = Less than 10, 5 = Over 1,000)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Variation in groups that are impacted (1 = All groups impacted the same, 5 = Groups experiencing the change differently)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Type of change (1 = Single aspect, simple change, 5 = Many aspects, complex change)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Degree of process change (1 = No change, 5 = 100% change)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Degree of technology and system change (1 = No change, 5 = 100% change)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Degree of job role change (1 = No change, 5 = 100% change)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Degree of organization restructuring (1 = No change, 5 = 100% change)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Amount of change overall (1 = Incremental change, 5 = Radical change)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Impact on employee compensation (1 = No impact, 5 = Large impact on pay or benefits)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Reduction in total staffing levels (1 = No change expected, 5 = Significant change expected)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Timeframe for change (1 = Very short (< a month) or very long (> a year), 5 = 3–12 month initiative)", "type": "scale", "options": SCALE_OPTIONS},
    # Organizational Attributes Assessment
    {"text": "Perceived need for change among employees and managers (1 = Compelling business need is visible, 5 = Employees do not view change as necessary)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Impact of past changes on employees (1 = Employees perceive past changes as positive, 5 = Negative)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Change capacity (1 = Very few changes underway, 5 = Everything is changing)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Past changes (1 = Changes were successful and well-managed, 5 = Many failed projects and changes were poorly managed)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Shared vision and direction for the organization (1 = Widely shared and unified vision, 5 = Many different directions and shifting priorities)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Resources and funding availability (1 = Adequate resources and funds, 5 = Limited)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Organization's culture and responsiveness to change (1 = Open and receptive, 5 = Closed and resistant)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Organizational reinforcement (1 = Employees are rewarded for risk taking and embracing change, 5 = For consistency and predictability)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Leadership style and power distribution (1 = Centralized, 5 = Distributed)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Executive/senior management change competency (1 = Business leaders demonstrate effective sponsorship, 5 = Lack sponsor skills and knowledge)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Middle management change competency (1 = Managers are highly competent, 5 = Lack knowledge and skills)", "type": "scale", "options": SCALE_OPTIONS},
    {"text": "Employee change competency (1 = Employees are highly competent, 5 = Lack knowledge and skills)", "type": "scale", "options": SCALE_OPTIONS}
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