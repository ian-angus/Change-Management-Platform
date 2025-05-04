from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table for Project Stakeholders (Many-to-Many)
project_stakeholders = db.Table('project_stakeholders',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('employee_id', db.Integer, db.ForeignKey('employee.id'), primary_key=True)
)

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(80), nullable=True)
    department = db.Column(db.String(80), nullable=True)
    # Add relationship back to projects where this employee is the owner
    owned_projects = db.relationship('Project', backref='owner', lazy=True)
    # Add relationship back to projects where this employee is a stakeholder
    stakeholder_in_projects = db.relationship('Project', secondary=project_stakeholders,
                                              lazy='subquery',
                                              backref=db.backref('stakeholders', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "department": self.department
        }

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # Link to the Employee who owns the project
    project_owner_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=True) # Made nullable for now, requirement says dropdown
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    # Status options: Draft, Active, Completed (as per requirements)
    status = db.Column(db.String(50), nullable=False, default='Draft')
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to Assessments
    assessments = db.relationship("Assessment", backref="project", lazy=True, cascade="all, delete-orphan")
    # Stakeholders relationship defined via backref from Employee

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "project_owner_id": self.project_owner_id,
            "owner_name": self.owner.name if self.owner else None, # Include owner name
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "status": self.status,
            "creation_date": self.creation_date.isoformat() if self.creation_date else None,
            "last_modified_date": self.last_modified_date.isoformat() if self.last_modified_date else None,
            "stakeholders": [stakeholder.to_dict() for stakeholder in self.stakeholders], # Include stakeholders
            "assessment_count": len(self.assessments) # Example derived field
        }

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    assessment_type = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Not Started")
    creation_date = db.Column(db.DateTime, default=datetime.utcnow)
    completion_date = db.Column(db.DateTime, nullable=True)
    results = db.Column(db.JSON, nullable=True) # Store assessment results as JSON
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

