from flask import Flask
from extensions import db
from models import Employee, UserAuth, GroupMember, Project, Assessment, assessment_stakeholders, project_groups

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/dev.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

EMAIL = 'ian.a.n.thomson@gmail.com'

with app.app_context():
    # Find the employee
    employee = Employee.query.filter_by(email=EMAIL).first()
    if not employee:
        print(f"Employee not found for email: {EMAIL}")
    else:
        print(f"\nEmployee found:")
        print(f"ID: {employee.id}")
        print(f"Name: {employee.name}")
        print(f"Email: {employee.email}")
        print(f"Job Position: {employee.job_position}")

        # Check group memberships
        group_memberships = GroupMember.query.filter_by(employee_id=employee.id).all()
        print(f"\nGroup Memberships ({len(group_memberships)}):")
        for gm in group_memberships:
            print(f"- Group ID: {gm.group_id}")

        # Check direct assessment assignments
        direct_assessments = db.session.query(Assessment).join(assessment_stakeholders).filter(assessment_stakeholders.c.employee_id == employee.id).all()
        print(f"\nDirect Assessment Assignments ({len(direct_assessments)}):")
        for assessment in direct_assessments:
            print(f"- Assessment ID: {assessment.id}")
            print(f"  Type: {assessment.assessment_type}")
            print(f"  Project ID: {assessment.project_id}")
            print(f"  Status: {assessment.status}")

        # Check group-based project assignments
        group_ids = [gm.group_id for gm in group_memberships]
        if group_ids:
            project_ids = [pg.project_id for pg in db.session.execute(project_groups.select().where(project_groups.c.group_id.in_(group_ids)))]
            print(f"\nProjects assigned to your groups ({len(project_ids)}):")
            for project_id in project_ids:
                project = Project.query.get(project_id)
                if project:
                    print(f"- Project ID: {project.id}")
                    print(f"  Name: {project.name}")
                    print(f"  Status: {project.status}") 