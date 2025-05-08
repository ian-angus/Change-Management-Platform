import os
from flask import Flask
from flask_cors import CORS
from datetime import datetime

# This is a test comment to trigger deployment
# Import db instance from extensions
from extensions import db

def seed_database():
    """Seeds the database with initial data if it's empty."""
    # Import models inside the function to ensure app context is active
    from models import Project, Assessment, Employee, Group # Added Group
    # Import PMI phases from routes (or define centrally)
    from api.project_routes import PMI_PHASES

    # Check and seed employees
    if not Employee.query.first():
        print("Seeding initial employee data...")
        # Use job_position instead of role
        emp1 = Employee(name="Alice Wonderland", email="alice@example.com", job_position="Project Manager", department="IT")
        emp2 = Employee(name="Bob The Builder", email="bob@example.com", job_position="Developer", department="Engineering")
        emp3 = Employee(name="Charlie Chaplin", email="charlie@example.com", job_position="Change Lead", department="HR")
        db.session.add_all([emp1, emp2, emp3])
        db.session.commit()
        print("Employee seeding complete.")
    else:
        print("Employee data already exists, skipping seeding.")

    # Check and seed projects
    if not Project.query.first():
        print("Seeding initial project data...")
        # Fetch employees again within this context
        stakeholder1 = Employee.query.filter_by(email="alice@example.com").first()
        stakeholder2 = Employee.query.filter_by(email="bob@example.com").first()

        proj1 = Project(
            name="Project Phoenix",
            description="Migrate legacy system to new cloud platform.",
            start_date=datetime(2024, 1, 15),
            end_date=datetime(2024, 12, 31),
            status="Active",
            project_phase="Executing" # Assign phase
        )
        proj2 = Project(
            name="Operation Evergreen",
            description="Implement new HR onboarding process.",
            start_date=datetime(2024, 3, 1),
            status="Draft",
            project_phase="Planning" # Assign phase
        )
        db.session.add_all([proj1, proj2])
        db.session.commit() # Commit projects first to get IDs

        # Add stakeholders after projects are committed
        if proj1 and stakeholder1: proj1.stakeholders.append(stakeholder1)
        if proj1 and stakeholder2: proj1.stakeholders.append(stakeholder2)
        if proj2 and stakeholder1: proj2.stakeholders.append(stakeholder1)
        db.session.commit()
        print("Project seeding complete.")
    else:
         print("Project data already exists, skipping seeding.")

    # Check and seed groups (optional initial groups)
    if not Group.query.first():
        print("Seeding initial group data...")
        group1 = Group(name="Management Team", description="Senior leadership group")
        group2 = Group(name="Pilot Users - HR", description="HR users for pilot testing")
        db.session.add_all([group1, group2])
        db.session.commit()
        print("Group seeding complete.")
    else:
        print("Group data already exists, skipping seeding.")

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    # Configuration
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", os.urandom(24))
    db_path = os.path.join(app.instance_path, "dev.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass # Already exists

    # Initialize extensions
    db.init_app(app)
    CORS(app) # Enable CORS for all routes

    # Import blueprints AFTER db is initialized
    from api.project_routes import project_bp
    from api.assessment_routes import assessment_bp
    from api.employee_routes import employee_bp
    from api.group_routes import group_bp # Import group blueprint

    app.register_blueprint(project_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(employee_bp)
    app.register_blueprint(group_bp) # Register group blueprint

    # Create database tables and seed data within app context
    with app.app_context():
        db.create_all()
        seed_database() # Call seeding function

    @app.route("/")
    def hello():
        return "BrightFold Backend Running!"

    return app



if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
