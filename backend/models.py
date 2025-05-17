# Import the shared db instance from extensions
from extensions import db
from datetime import datetime

# Association table for Project Stakeholders (Many-to-Many)
project_stakeholders = db.Table("project_stakeholders",
    db.Column("project_id", db.Integer, db.ForeignKey("project.id"), primary_key=True),
    db.Column("employee_id", db.Integer, db.ForeignKey("employees.id"), primary_key=True)
)

# Association table for Project-Group (Many-to-Many)
project_groups = db.Table('project_groups',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('groups.id'), primary_key=True)
)

# Association table for Assessment <-> Employee (Stakeholder Assignment)
assessment_stakeholders = db.Table(
    'assessment_stakeholders',
    db.Column('assessment_id', db.Integer, db.ForeignKey('assessment.id'), primary_key=True),
    db.Column('employee_id', db.Integer, db.ForeignKey('employees.id'), primary_key=True),
    db.Column('role', db.String(100), nullable=True)
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

    # One-to-one relationship to UserAuth
    user_auth = db.relationship('UserAuth', backref='employee', uselist=False)

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
    projects = db.relationship('Project', secondary=project_groups, back_populates='groups')

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
            "date_added": self.created_at.isoformat() if self.created_at else None,
            "employee": self.employee.to_dict() if self.employee else None
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
    groups = db.relationship('Group', secondary=project_groups, back_populates='projects')

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
    deploy_at = db.Column(db.DateTime, nullable=True)  # New field for scheduled deployment
    description = db.Column(db.Text, nullable=True)  # Copied from template at creation

    # Add stakeholders relationship
    stakeholders = db.relationship(
        "Employee",
        secondary=assessment_stakeholders,
        backref=db.backref("assessments_assigned", lazy="dynamic"),
        lazy="dynamic"
    )

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
            "readiness_score": self.readiness_score,
            "deploy_at": self.deploy_at.isoformat() if self.deploy_at else None,
            "description": self.description
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
    required = db.Column(db.Boolean, default=False)
    helper_text = db.Column(db.String(255), nullable=True)
    placeholder = db.Column(db.String(255), nullable=True)
    default_answer = db.Column(db.String(255), nullable=True)
    order = db.Column(db.Integer, nullable=True)
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
            'required': self.required,
            'helper_text': self.helper_text,
            'placeholder': self.placeholder,
            'default_answer': self.default_answer,
            'order': self.order,
            'creation_date': self.created_at.isoformat() if self.created_at else None,
            'last_updated': self.updated_at.isoformat() if self.updated_at else None
        }

class UserAuth(db.Model):
    __tablename__ = 'user_auth'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    # Optionally: is_active, last_login, etc.

class KeyMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    supporting_statement = db.Column(db.Text, nullable=False)
    tone_purpose = db.Column(db.String(100), nullable=False)
    stage_tag = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Draft')  # Draft, Approved, Archived
    version = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
    # Relationships
    created_by = db.relationship('Employee', backref='key_messages')
    project = db.relationship('Project', backref='key_messages')
    history = db.relationship('KeyMessageHistory', backref='key_message', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'supporting_statement': self.supporting_statement,
            'tone_purpose': self.tone_purpose,
            'stage_tag': self.stage_tag,
            'status': self.status,
            'version': self.version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'created_by': self.created_by.to_dict() if self.created_by else None,
            'project_id': self.project_id
        }

class KeyMessageHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key_message_id = db.Column(db.Integer, db.ForeignKey('key_message.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    supporting_statement = db.Column(db.Text, nullable=False)
    tone_purpose = db.Column(db.String(100), nullable=False)
    stage_tag = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    version = db.Column(db.Integer, nullable=False)
    changed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    changed_by_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    
    # Relationships
    changed_by = db.relationship('Employee', backref='key_message_changes')

    def to_dict(self):
        return {
            'id': self.id,
            'key_message_id': self.key_message_id,
            'title': self.title,
            'supporting_statement': self.supporting_statement,
            'tone_purpose': self.tone_purpose,
            'stage_tag': self.stage_tag,
            'status': self.status,
            'version': self.version,
            'changed_at': self.changed_at.isoformat(),
            'changed_by': self.changed_by.to_dict() if self.changed_by else None
        }

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(100), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user_auth.id'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('UserAuth', backref='reset_tokens')

