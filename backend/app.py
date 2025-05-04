import os
from flask import Flask
from flask_cors import CORS
from datetime import datetime

# Import db instance from extensions
from extensions import db

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

    # Import and register blueprints within app context
    with app.app_context():
        # Import models here AFTER db is initialized with app
        from models import Project, Assessment, Employee

        # Import blueprints
        from api.project_routes import project_bp
        from api.assessment_routes import assessment_bp

        app.register_blueprint(project_bp)
        app.register_blueprint(assessment_bp)

        # Create database tables if they don't exist
        db.create_all()

        # --- Seed Data (for development/testing) ---
        # Check and seed data within the app context
        if not Employee.query.first(): # Check if employees exist
            print("Seeding initial employee data...")
            emp1 = Employee(name="Alice Wonderland", email="alice@example.com", role="Project Manager", department="IT")
            emp2 = Employee(name="Bob The Builder", email="bob@example.com", role="Developer", department="Engineering")
            emp3 = Employee(name="Charlie Chaplin", email="charlie@example.com", role="Change Lead", department="HR")
            db.session.add_all([emp1, emp2, emp3])
            db.session.commit()
            print("Employee seeding complete.")
        else:
            print("Employee data already exists, skipping seeding.")

        if not Project.query.first(): # Check if projects exist
            print("Seeding initial project data...")
            # Fetch employees again within this context if needed, or ensure they exist
            stakeholder1 = Employee.query.filter_by(email="alice@example.com").first()
            stakeholder2 = Employee.query.filter_by(email="bob@example.com").first()

            proj1 = Project(
                name="Project Phoenix",
                description="Migrate legacy system to new cloud platform.",
                start_date=datetime(2024, 1, 15),
                end_date=datetime(2024, 12, 31),
                status="Active"
            )
            proj2 = Project(
                name="Operation Evergreen",
                description="Implement new HR onboarding process.",
                start_date=datetime(2024, 3, 1),
                status="Draft"
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
        # --- End Seed Data ---

    @app.route("/")
    def hello():
        return "BrightFold Backend Running!"

    return app

