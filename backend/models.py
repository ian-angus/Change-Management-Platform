# /home/ubuntu/melyn_cm_platform/backend/models.py
from extensions import db # Import db from extensions.py
import datetime # Import datetime for default timestamps
from sqlalchemy.dialects.postgresql import JSONB # Use JSONB for better JSON handling if using PostgreSQL

# Association table for the many-to-many relationship between Employee and StakeholderGroup
employee_stakeholder_group = db.Table("employee_stakeholder_group",
    db.Column("employee_id", db.Integer, db.ForeignKey("employee.id"), primary_key=True),
    db.Column("stakeholder_group_id", db.Integer, db.ForeignKey("stakeholder_group.id"), primary_key=True)
)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    assessments = db.relationship("Assessment", backref="project", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
        }

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    assessment_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Not Started")
    creation_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    completion_date = db.Column(db.DateTime, nullable=True)
    results = db.Column(db.JSON, nullable=True) # Store assessment results as JSON
    risk_level = db.Column(db.String(50), nullable=True)
    readiness_score = db.Column(db.Integer, nullable=True)
    # Add relationship to the template used (optional but good practice)
    # template_id = db.Column(db.Integer, db.ForeignKey("assessment_template.id"), nullable=True)

    def to_dict(self):
        # Use completion_date for last modified/deployed for simplicity now
        last_modified = self.completion_date or self.creation_date
        return {
            "id": self.id,
            "project_id": self.project_id,
            "assessment_type": self.assessment_type,
            "status": self.status,
            "completion_date": last_modified.isoformat() if last_modified else None,
            "results": self.results,
            "risk_level": self.risk_level,
            "readiness_score": self.readiness_score
        }

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Relationship to Stakeholder Groups
    stakeholder_groups = db.relationship(
        "StakeholderGroup",
        secondary=employee_stakeholder_group,
        lazy="subquery",
        backref=db.backref("employees", lazy=True)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "department": self.department,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

class StakeholderGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self, include_members=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "member_count": len(self.employees),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_members:
            data["members"] = [emp.to_dict() for emp in self.employees]
        return data

# --- NEW: Assessment Template Models --- 

class AssessmentTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_default = db.Column(db.Boolean, default=False, nullable=False)
    # Simple versioning using updated_at for now
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    # Relationship to questions
    questions = db.relationship("AssessmentQuestion", backref="template", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self, include_questions=False):
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_default": self.is_default,
            "question_count": self.questions.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_questions:
            # Order questions by their order field
            data["questions"] = [q.to_dict() for q in self.questions.order_by(AssessmentQuestion.order)]
        return data

class AssessmentQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey("assessment_template.id"), nullable=False)
    text = db.Column(db.Text, nullable=False)
    # Question Types: single_choice, multiple_choice, likert, open_ended
    question_type = db.Column(db.String(50), nullable=False)
    # Order within the template
    order = db.Column(db.Integer, nullable=False, default=0)
    # Options for choice-based questions (stored as JSON)
    # Using JSONB is recommended for PostgreSQL for better indexing and performance
    options = db.Column(db.JSON, nullable=True) # e.g., {"choices": ["Opt1", "Opt2"], "scale": 5} for Likert

    def to_dict(self):
        return {
            "id": self.id,
            "template_id": self.template_id,
            "text": self.text,
            "question_type": self.question_type,
            "order": self.order,
            "options": self.options, # Contains choices for multi/single, scale for likert
        }




class AssessmentResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessment.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"), nullable=False)
    answers = db.Column(db.JSON, nullable=False) # Store submitted answers
    submitted_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Relationship to get respondent details
    respondent = db.relationship("Employee", backref="assessment_responses")
    # Relationship back to the assessment
    assessment = db.relationship("Assessment", backref="responses")

    def to_dict(self):
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "employee_id": self.employee_id,
            "respondent_name": self.respondent.name if self.respondent else "Unknown", # Include respondent name
            "answers": self.answers,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }

