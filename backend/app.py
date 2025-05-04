from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# Import database models and blueprints
from models import db  # Assuming db = SQLAlchemy() is in models.py
from api.project_routes import project_bp
from api.employee_routes import employee_bp
from api.assessment_template_routes import assessment_template_bp
from api.assessment_routes import assessment_bp
from api.stakeholder_group_routes import stakeholder_group_bp

app = Flask(__name__)

# Configuration
# Use environment variable for database URI if available, otherwise default to SQLite
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///../instance/mydatabase.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev") # Use a strong secret key in production

# Enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize extensions
db.init_app(app)

# Register blueprints
app.register_blueprint(project_bp, url_prefix="/api")
app.register_blueprint(employee_bp, url_prefix="/api")
app.register_blueprint(assessment_template_bp, url_prefix="/api")
app.register_blueprint(assessment_bp, url_prefix="/api")
app.register_blueprint(stakeholder_group_bp, url_prefix="/api")

# Create database tables if they don't exist
with app.app_context():
    # Ensure the instance folder exists
    instance_path = os.path.join(app.instance_path)
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)
        print(f"Created instance folder at {instance_path}")
    else:
        print(f"Instance folder already exists at {instance_path}")

    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    try:
        db.create_all()
        print("Database tables created (if they didn't exist).")
    except Exception as e:
        print(f"Error creating database tables: {e}")

@app.route("/")
def hello():
    return "Backend server is running!"

if __name__ == "__main__":
    # Use 0.0.0.0 to make the server accessible externally
    # Use port 5001 as previously established
    app.run(debug=True, host="0.0.0.0", port=5001)

