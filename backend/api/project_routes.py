from flask import Blueprint, request, jsonify
from app import db
from models import Project
from datetime import datetime

project_bp = Blueprint("project_bp", __name__, url_prefix="/api/projects")

@project_bp.route("/", methods=["GET"])
def get_projects():
    """Get all projects."""
    try:
        projects = Project.query.order_by(Project.name).all()
        project_list = [p.to_dict() for p in projects]
        return jsonify(project_list)
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({"error": "An error occurred while fetching projects."}), 500

@project_bp.route("/", methods=["POST"])
def create_project():
    """Create a new project."""
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Project name is required"}), 400

    try:
        # Basic date parsing (improve with error handling as needed)
        start_date = datetime.fromisoformat(data["start_date"]) if data.get("start_date") else None
        end_date = datetime.fromisoformat(data["end_date"]) if data.get("end_date") else None

        new_project = Project(
            name=data["name"],
            description=data.get("description"),
            status=data.get("status", "Planning"), # Default status
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify({
            "message": "Project created successfully",
            "project": new_project.to_dict()
        }), 201
    except ValueError:
        return jsonify({"error": "Invalid date format. Use ISO format (YYYY-MM-DD)."}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating project: {e}")
        return jsonify({"error": "An error occurred while creating the project."}), 500

@project_bp.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    """Delete a project."""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Optional: Check for dependencies (e.g., assessments) before deleting
        # if project.assessments:
        #     return jsonify({"error": "Cannot delete project with associated assessments."}), 400

        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": f"Project ID {project_id} deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting project {project_id}: {e}")
        return jsonify({"error": "An error occurred while deleting the project."}), 500

# Potential future routes:
# GET /<int:project_id> - Get details of a single project
# PUT /<int:project_id> - Update project details

