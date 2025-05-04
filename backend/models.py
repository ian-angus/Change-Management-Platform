from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
import datetime

db = SQLAlchemy()

# Association table for the many-to-many relationship between Project and Employee
project_employee_association = db.Table(
    "project_employee",
    db.Column("project_id", db.Integer, db.ForeignKey("project.id"), primary_key=True),
    db.Column("employee_id", db.Integer, db.ForeignKey("employee.id"), primary_key=True),
)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, nullable=True, default=datetime.datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    employees = relationship(
        "Employee",
        secondary=project_employee_association,
        back_populates="projects",
        lazy="dynamic"
    )
    assessments = relationship("Assessment", back_populates="project", lazy="dynamic")
    stakeholder_groups = relationship("StakeholderGroup", back_populates="project", lazy="dynamic")

    def __repr__(self):
        return f"<Project {self.name}>"

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(200))

    # Relationships
    employees = relationship("Employee", back_populates="role", lazy="dynamic")

    def __repr__(self):
        return f"<Role {self.name}>"

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("role.id"), nullable=True) # Nullable if role is optional
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="employees")
    projects = relationship(
        "Project",
        secondary=project_employee_association,
        back_populates="employees",
        lazy="dynamic"
    )
    assessment_results = relationship("AssessmentResult", back_populates="employee", lazy="dynamic")

    def __repr__(self):
        return f"<Employee {self.name}>"

class AssessmentTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    questions = db.Column(db.JSON, nullable=True) # Storing questions as JSON
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    assessments = relationship("Assessment", back_populates="template", lazy="dynamic")

    def __repr__(self):
        return f"<AssessmentTemplate {self.name}>"

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey("assessment_template.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="Not Started") # e.g., Not Started, Deployed, Completed
    deployment_date = db.Column(db.DateTime, nullable=True)
    completion_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="assessments")
    template = relationship("AssessmentTemplate", back_populates="assessments")
    results = relationship("AssessmentResult", back_populates="assessment", lazy="dynamic")
    # Add relationship for deployed employees if needed (e.g., many-to-many with Employee)

    def __repr__(self):
        return f"<Assessment {self.name} for Project {self.project_id}>"

class AssessmentResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessment.id"), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee.id"), nullable=False) # Respondent
    submission_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    answers = db.Column(db.JSON, nullable=False) # Storing answers as JSON

    # Relationships
    assessment = relationship("Assessment", back_populates="results")
    employee = relationship("Employee", back_populates="assessment_results")

    def __repr__(self):
        return f"<AssessmentResult {self.id} for Assessment {self.assessment_id}>"

class StakeholderGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="stakeholder_groups")

    def __repr__(self):
        return f"<StakeholderGroup {self.name} for Project {self.project_id}>"

