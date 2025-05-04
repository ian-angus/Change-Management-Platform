import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Initialize SQLAlchemy instance
db = SQLAlchemy()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    # Configuration
    # Use environment variable for secret key in production, generate one for dev
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", os.urandom(24))
    # Database configuration (using SQLite for simplicity)
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
    CORS(app) # Enable CORS for all routes, adjust origins in production

    # Import and register blueprints
    # Import models here to ensure they are known to SQLAlchemy before creating tables
    with app.app_context():
        from models import Project, Assessment # Import models
        
        # Import blueprints after models are known
        from api.project_routes import project_bp
        from api.assessment_routes import assessment_bp
        
        app.register_blueprint(project_bp)
        app.register_blueprint(assessment_bp)

        # Create database tables if they don't exist
        # This is okay for development, use migrations (Flask-Migrate) for production
        db.create_all()

    @app.route("/")
    def hello():
        return "BrightFold Backend Running!"

    return app

# Entry point for running the app (e.g., using `flask run`)
# The Flask CLI will automatically detect and use `create_app`

