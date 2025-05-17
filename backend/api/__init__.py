from .auth_routes import auth_bp
from .project_routes import project_bp
from .assessment_routes import assessment_bp
from .employee_routes import employee_bp
from .group_routes import group_bp
from .assessment_template_routes import assessment_template_bp
from .my_assessments import my_assessments_bp
from .key_messages import key_messages_bp

__all__ = [
    "auth_bp",
    "project_bp",
    "assessment_bp",
    "employee_bp",
    "group_bp",
    "assessment_template_bp",
    "my_assessments_bp",
    "key_messages_bp"
]

