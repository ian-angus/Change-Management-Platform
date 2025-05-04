# /home/ubuntu/melyn_cm_platform/backend/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Initialize extensions without app context
db = SQLAlchemy()
migrate = Migrate()

