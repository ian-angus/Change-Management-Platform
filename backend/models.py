# Import the shared db instance from extensions
from extensions import db
from datetime import datetime

# Association table for Project Stakeholders (Many-to-Many)
project_stakeholders = db.Table("project_stakeholders",
    db.Column("project_id", db.Integer, db.ForeignKey("project.id"), primary_key=True),
    db.Column("employee_id", db.Integer, db.ForeignKey("employees.id"), primary_key=True)
)

class Role(db.Model):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    job_position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=True)
    source = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stakeholder_in_projects = db.relationship("Project", secondary=project_stakeholders,
                                              lazy="subquery",
                                              backref=db.backref("stakeholders", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "job_position": self.job_position,
            "department": self.department,
            "date_added": self.created_at.isoformat() if self.created_at else None,
            "date_updated": self.updated_at.isoformat() if self.updated_at else None,
            "source": self.source
        }

class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    members = db.relationship('GroupMember', back_populates='group', lazy='joined')

    def to_dict(self, include_members=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "creation_date": self.created_at.isoformat() if self.created_at else None,
            "last_modified_date": self.updated_at.isoformat() if self.updated_at else None,
            "member_count": len(self.members) if self.members is not None else 0
        }
        if include_members and self.members is not None:
            data["members"] = [member.to_dict() for member in self.members]
        return data

class GroupMember(db.Model):
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    group = db.relationship('Group', back_populates='members')
    employee = db.relationship('Employee')

    def to_dict(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "employee_id": self.employee_id,
            "date_added": self.created_at.isoformat() if self.created_at else None
        }

class Project(db.Model):
    __tablename__ = 'project'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="Draft")
    project_phase = db.Column(db.String(50), nullable=True, default="Initiating")
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assessments = db.relationship("Assessment", backref="project", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "project_phase": self.project_phase,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "stakeholders": [stakeholder.to_dict() for stakeholder in self.stakeholders] if hasattr(self, 'stakeholders') and self.stakeholders is not None else [],
            "assessment_count": len(self.assessments) if hasattr(self, 'assessments') and self.assessments is not None else 0
        }

class Assessment(db.Model):
    __tablename__ = 'assessment'
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    assessment_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Not Started")
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    completion_date = db.Column(db.DateTime, nullable=True)
    results = db.Column(db.JSON, nullable=True)
    risk_level = db.Column(db.String(50), nullable=True)
    readiness_score = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        last_modified = self.completion_date or self.creation_date
        return {
            "id": self.id,
            "project_id": self.project_id,
            "assessment_type": self.assessment_type,
            "status": self.status,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "completion_date": self.completion_date.isoformat() if self.completion_date else None,
            "last_modified": last_modified.isoformat() if last_modified else None,
            "results": self.results,
            "risk_level": self.risk_level,
            "readiness_score": self.readiness_score
        }

class AssessmentTemplate(db.Model):
    __tablename__ = 'assessment_templates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    questions = db.relationship('AssessmentQuestion', back_populates='template', cascade='all, delete-orphan')

    def to_dict(self, include_questions=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creation_date': self.created_at.isoformat() if self.created_at else None,
            'last_updated': self.updated_at.isoformat() if self.updated_at else None,
            'question_count': len(self.questions) if self.questions else 0
        }
        if include_questions:
            data['questions'] = [q.to_dict() for q in self.questions]
        return data

class AssessmentQuestion(db.Model):
    __tablename__ = 'assessment_questions'
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('assessment_templates.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., 'Multiple Choice', 'Text', 'Rating'
    options = db.Column(db.JSON)  # For multiple choice questions
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    template = db.relationship('AssessmentTemplate', back_populates='questions')

    def to_dict(self):
        return {
            'id': self.id,
            'template_id': self.template_id,
            'text': self.text,
            'type': self.type,
            'options': self.options,
            'creation_date': self.created_at.isoformat() if self.created_at else None,
            'last_updated': self.updated_at.isoformat() if self.updated_at else None
        }

