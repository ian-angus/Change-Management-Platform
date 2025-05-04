# /home/ubuntu/melyn_cm_platform/backend/app.py
from flask import Flask
from flask_cors import CORS
import os

# Import extensions
from extensions import db, migrate

def create_app():
    """Application Factory Pattern"""
    app = Flask(__name__)

    # Configure database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///../instance/mydatabase.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS
    CORS(app)

    # Import models here AFTER db is initialized with app, 
    # but ensure they are defined before blueprints that use them.
    # This structure helps avoid circular imports if models don't import app.
    with app.app_context():
        # Import models within context if needed for operations like create_all
        # from models import Project, Assessment, Employee, StakeholderGroup, AssessmentTemplate, AssessmentQuestion
        # db.create_all() # Usually handled by migrations
        pass

    # Import and register blueprints
    from api.project_routes import project_bp
    from api.assessment_routes import assessment_bp
    from api.employee_routes import employee_bp
    from api.stakeholder_group_routes import stakeholder_group_bp
    from api.assessment_template_routes import assessment_template_bp # Import new blueprint

    app.register_blueprint(project_bp, url_prefix="/api/projects")
    app.register_blueprint(assessment_bp, url_prefix="/api/assessments")
    app.register_blueprint(employee_bp, url_prefix="/api/employees")
    app.register_blueprint(stakeholder_group_bp, url_prefix="/api/stakeholder-groups")
    app.register_blueprint(assessment_template_bp, url_prefix="/api/assessment-templates") # Register new blueprint

    # Basic route for testing
    @app.route("/")
    def hello_world():
        return "Hello from BrightFold Backend!"

    return app

if __name__ == "__main__":
    app = create_app()
    # Ensure the instance folder exists
    instance_path = os.path.join(app.root_path, "../instance")
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
        print(f"Created instance folder at {instance_path}")

    # Run the app
    app.run(host="0.0.0.0", port=5001, debug=True)

