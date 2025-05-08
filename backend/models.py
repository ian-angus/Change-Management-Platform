# Import the shared db instance from extensions
from extensions import db
from datetime import datetime

# Association table for Project Stakeholders (Many-to-Many)
project_stakeholders = db.Table("project_stakeholders",
    db.Column("project_id", db.Integer, db.ForeignKey("project.id"), primary_key=True),
    db.Column("employee_id", db.Integer, db.ForeignKey("employee.id"), primary_key=True)
)

# Association table for Group Members (Many-to-Many)
group_members = db.Table("group_members",
    db.Column("group_id", db.Integer, db.ForeignKey("group.id"), primary_key=True),
    db.Column("employee_id", db.Integer, db.ForeignKey("employee.id"), primary_key=True)
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
    __tablename__ = 'employee'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    job_position = db.Column(db.String(80), nullable=True)
    department = db.Column(db.String(80), nullable=True)
    
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=True)
    role_info = db.relationship('Role', backref=db.backref('employees', lazy='dynamic'))

    source = db.Column(db.String(50), nullable=True, default="manual") 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stakeholder_in_projects = db.relationship("Project", secondary=project_stakeholders,
                                              lazy="subquery",
                                              backref=db.backref("stakeholders", lazy=True))

    member_of_groups = db.relationship("Group", secondary=group_members,
                                       lazy="subquery",
                                       backref=db.backref("members", lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "job_position": self.job_position,
            "department": self.department,
            "role_id": self.role_id,
            "role_name": self.role_info.name if self.role_info else None,
            "source": self.source,
            "date_added": self.created_at.isoformat() if self.created_at else None,
            "date_updated": self.updated_at.isoformat() if self.updated_at else None
        }

class Group(db.Model):
    __tablename__ = 'group'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_members=False):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "member_count": len(self.members) if hasattr(self, 'members') and self.members is not None else 0
        }
        if include_members and hasattr(self, 'members') and self.members is not None:
            data["members"] = [member.to_dict() for member in self.members]
        return data

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

