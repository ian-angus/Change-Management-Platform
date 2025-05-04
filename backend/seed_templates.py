# /home/ubuntu/melyn_cm_platform/backend/seed_templates.py
import sys
import os

# Ensure the backend directory is in the Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import create_app, db
from models import AssessmentTemplate, AssessmentQuestion

# --- Default Template Definitions ---

# Helper to create Agreement Scale options (Fixed 5-point)
def create_agreement_options():
    return {"scale": 5, "labels": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]}

# Helper to create generic Likert options (for Risk Assessment)
def create_likert_options(scale, labels):
    if len(labels) != scale:
        raise ValueError(f"Number of labels ({len(labels)}) must match scale ({scale})")
    return {"scale": scale, "labels": labels}

# 1. Prosci PCT Assessment (Updated to use Agreement Scale)
pct_template = {
    "title": "Prosci PCT Assessment",
    "description": "Assesses project health across Leadership/Sponsorship, Project Management, and Change Management.",
    "is_default": True, # Mark one as default
    "questions": [
        # Leadership/Sponsorship
        {"text": "The change has a primary sponsor.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor has the necessary authority over the people, processes and systems to authorize and fund the change.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor is willing and able to build a sponsorship coalition for the change, and is able to manage resistance from other managers and supervisors.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor will actively and visibly participate with the project team throughout the entire project.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor will resolve issues and make decisions relating to the project schedule, scope and resources.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor can build awareness of the need for the change (why the change is happening) directly with employees.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The organization has a clearly defined vision and strategy.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "This change is aligned with the strategy and vision for the organization.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Priorities have been set and communicated regarding this change and other competing initiatives.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor will visibly reinforce the change and celebrate successes with the team and the organization.", "type": "agreement_scale", "options": create_agreement_options()},
        # Project Management
        {"text": "The change is clearly defined including what the change will look like and who is impacted by the change.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The project has a clearly defined scope.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The project has specific objectives that define success.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Project milestones have been identified and a project schedule has been created.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "A project manager has been assigned to manage the project resources and tasks.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "A work breakdown structure has been completed and deliverables have been identified.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Resources for the project team have been identified and acquired based on the work breakdown structure.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Periodic meetings are scheduled with the project team to track progress and resolve issues.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The primary sponsor is readily available to work on issues that impact dates, scope or resources.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "The project plan has been integrated with the change management plan.", "type": "agreement_scale", "options": create_agreement_options()},
        # Change Management
        {"text": "A structured change management approach is being applied to the project.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "An assessment of the change and its impact on the organization has been completed.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "An assessment of the organization’s readiness for change has been completed.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Anticipated areas of resistance have been identified and special tactics have been developed.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "A change management strategy including the necessary sponsorship model and change management team model has been created.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Change management team members have been identified and trained.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "An assessment of the strength of the sponsorship coalition has been conducted.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Change management plans including communications, sponsorship, coaching, training and resistance management plans have been created.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Feedback processes have been established to gather information from employees to determine how effectively the change is being adopted.", "type": "agreement_scale", "options": create_agreement_options()},
        {"text": "Resistance to change is managed effectively and change successes are celebrated, both in private and in public.", "type": "agreement_scale", "options": create_agreement_options()},
    ]
}

# 2. Prosci Risk Assessment (Using various Likert scales)
risk_template = {
    "title": "Prosci Risk Assessment",
    "description": "Assesses change characteristics and organizational attributes to determine project risk.",
    "is_default": False,
    "questions": [
        # Change Characteristics
        {"text": "Scope of change (Workgroup to Enterprise)", "type": "likert_scale", "options": create_likert_options(5, ["Workgroup", "Department", "Division", "Enterprise", "Enterprise+"])},
        {"text": "Number of impacted employees", "type": "likert_scale", "options": create_likert_options(5, ["<10", "10-100", "100-500", "500-1000", ">1000"])},
        {"text": "Variation in groups that are impacted (All same to Very different)", "type": "likert_scale", "options": create_likert_options(5, ["All Same", "Slight Variation", "Moderate Variation", "Significant Variation", "Very Different"])},
        {"text": "Type of change (Simple to Complex)", "type": "likert_scale", "options": create_likert_options(5, ["Simple", "Slightly Complex", "Moderately Complex", "Complex", "Very Complex"])},
        {"text": "Degree of process change (No change to 100% change)", "type": "likert_scale", "options": create_likert_options(5, ["No Change", "Minor Change", "Moderate Change", "Significant Change", "Complete Change"])},
        {"text": "Degree of technology and system change (No change to 100% change)", "type": "likert_scale", "options": create_likert_options(5, ["No Change", "Minor Change", "Moderate Change", "Significant Change", "Complete Change"])},
        {"text": "Degree of job role change (No change to 100% change)", "type": "likert_scale", "options": create_likert_options(5, ["No Change", "Minor Change", "Moderate Change", "Significant Change", "Complete Change"])},
        {"text": "Degree of organization restructuring (No change to 100% change)", "type": "likert_scale", "options": create_likert_options(5, ["No Change", "Minor Change", "Moderate Change", "Significant Change", "Complete Change"])},
        {"text": "Amount of change overall (Incremental to Radical)", "type": "likert_scale", "options": create_likert_options(5, ["Incremental", "Slightly Radical", "Moderately Radical", "Radical", "Very Radical"])},
        {"text": "Impact on employee compensation (No impact to Large impact)", "type": "likert_scale", "options": create_likert_options(5, ["No Impact", "Minor Impact", "Moderate Impact", "Significant Impact", "Large Impact"])},
        {"text": "Reduction in total staffing levels (No change to Significant change)", "type": "likert_scale", "options": create_likert_options(5, ["No Change", "Minor Reduction", "Moderate Reduction", "Significant Reduction", "Large Reduction"])},
        {"text": "Timeframe for change (Short/Long to Optimal)", "type": "likert_scale", "options": create_likert_options(5, ["<1mo or >1yr", "1-3mo", "3-6mo", "6-12mo", ">12mo (simple)"])}, # Simplified interpretation
        # Organizational Attributes
        {"text": "Perceived need for change among employees and managers (High need=Good, Low need=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very High Need", "High Need", "Neutral", "Low Need", "Very Low Need"])},
        {"text": "Impact of past changes on employees (Positive=Good, Negative=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very Positive", "Positive", "Neutral", "Negative", "Very Negative"])},
        {"text": "Change capacity (Few changes=Good, Many changes=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very High Capacity", "High Capacity", "Neutral", "Low Capacity", "Very Low Capacity"])},
        {"text": "Past changes (Successful=Good, Failed=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very Successful", "Successful", "Neutral", "Failed", "Very Failed"])},
        {"text": "Shared vision and direction for the organization (Unified=Good, Shifting=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very Unified", "Unified", "Neutral", "Shifting", "Very Shifting"])},
        {"text": "Resources and funding availability (Adequate=Good, Limited=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very Adequate", "Adequate", "Neutral", "Limited", "Very Limited"])},
        {"text": "Organization’s culture and responsiveness to change (Open=Good, Closed=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very Open", "Open", "Neutral", "Closed", "Very Closed"])},
        {"text": "Organizational reinforcement (Rewards risk=Good, Rewards consistency=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Rewards Risk Highly", "Rewards Risk", "Neutral", "Rewards Consistency", "Rewards Consistency Highly"])},
        {"text": "Leadership style and power distribution (Distributed=Good, Centralized=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very Distributed", "Distributed", "Neutral", "Centralized", "Very Centralized"])},
        {"text": "Executive/senior management change competency (High=Good, Low=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very High", "High", "Neutral", "Low", "Very Low"])},
        {"text": "Middle management change competency (High=Good, Low=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very High", "High", "Neutral", "Low", "Very Low"])},
        {"text": "Employee change competency (High=Good, Low=Poor)", "type": "likert_scale", "options": create_likert_options(5, ["Very High", "High", "Neutral", "Low", "Very Low"])},
    ]
}

# 3. Team Member Competency Assessment
team_competency_template = {
    "title": "Team Member Competency Assessment",
    "description": "Gauges the general competency and experience level of project team members in change management.",
    "is_default": False,
    "questions": [
        {"text": "Have you ever attended any formal change management training? If yes, with what company and how long was the training?", "type": "open_ended", "options": None},
        {"text": "Have you ever been assigned to work on a change management team? If yes, what type of project and what was your role?", "type": "open_ended", "options": None},
        {"text": "Have you supported the communications or training aspect of a business project? If yes, what type of work did you do?", "type": "open_ended", "options": None},
        {"text": "Are you knowledgeable about any change management methodologies or approaches? If yes, describe?", "type": "open_ended", "options": None},
    ]
}

# 4. Organizational Attributes Worksheet (as open-ended questions)
org_attributes_template = {
    "title": "Organizational Attributes Worksheet",
    "description": "Helps analyze organizational culture, history, and readiness for change.",
    "is_default": False,
    "questions": [
        {"text": "Organization change culture: Would you consider your organization change resistant or change-ready? Why?", "type": "open_ended", "options": None},
        {"text": "Employee value structure: Does the current employee value system allow change to be easily mandated from above, or is the value system resistant to top-down changes? Why?", "type": "open_ended", "options": None},
        {"text": "Identify the institutions, policies or practices that reinforce this value structure.", "type": "open_ended", "options": None},
        {"text": "Change capacity: Describe the current changes that are already underway. Is the organization over saturated with change or are only a few changes taking place?", "type": "open_ended", "options": None},
        {"text": "List any key initiatives that overlap or interact with your change.", "type": "open_ended", "options": None},
        {"text": "Leadership style and power distribution: Does power and authority reside with a few key leaders (centralized) or spread among many managers (distributed)?", "type": "open_ended", "options": None},
        {"text": "Identify the key \"power positions\" in the organization (i.e. where does the true power reside).", "type": "open_ended", "options": None},
        {"text": "Past changes: Were past changes typically successful or unsuccessful? Describe.", "type": "open_ended", "options": None},
        {"text": "What were the consequences of failed changes?", "type": "open_ended", "options": None},
        {"text": "Reinforcement: Does the organization reward risk taking or consistency?", "type": "open_ended", "options": None},
        {"text": "What are the consequences of failed initiatives?", "type": "open_ended", "options": None},
        {"text": "Change competency: Describe the change management competency of executives, middle managers and employees.", "type": "open_ended", "options": None},
    ]
}

def seed_data():
    app = create_app()
    with app.app_context():
        print("Seeding assessment templates...")

        templates_to_seed = [
            pct_template,
            risk_template,
            team_competency_template,
            org_attributes_template
        ]

        # Clear existing default templates and questions to avoid duplicates
        print("Clearing existing default templates...")
        existing_defaults = AssessmentTemplate.query.filter_by(is_default=True).all()
        for template in existing_defaults:
            # Delete associated questions first due to foreign key constraints
            AssessmentQuestion.query.filter_by(template_id=template.id).delete()
            db.session.delete(template)
        db.session.commit()
        print(f"Cleared {len(existing_defaults)} existing default templates.")

        # Seed new default templates
        for template_data in templates_to_seed:
            if template_data["is_default"]:
                print(f"Seeding template: {template_data['title']}")
                template = AssessmentTemplate(
                    title=template_data["title"],
                    description=template_data["description"],
                    is_default=template_data["is_default"]
                )
                db.session.add(template)
                db.session.flush() # Get the ID for the template

                for index, q_data in enumerate(template_data["questions"]):
                    question = AssessmentQuestion(
                        template_id=template.id,
                        text=q_data["text"],
                        question_type=q_data["type"],
                        options=q_data["options"],
                        order=index
                    )
                    db.session.add(question)
        
        db.session.commit()
        print("Default assessment templates seeded successfully.")

if __name__ == "__main__":
    seed_data()

