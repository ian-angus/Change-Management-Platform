from flask import Blueprint, request, jsonify
from extensions import db # Import shared db instance
from models import Project, Employee, Assessment
from datetime import datetime

project_bp = Blueprint("project_bp", __name__, url_prefix="/api/projects")

# Define PMI Phases
PMI_PHASES = ["Initiating", "Planning", "Executing", "Monitoring & Controlling", "Closing"]

# Helper function to parse dates safely
def parse_date(date_string):
    if not date_string:
        return None
    try:
        return datetime.fromisoformat(date_string.replace("Z", "+00:00"))
    except ValueError:
        try:
            return datetime.strptime(date_string, "%Y-%m-%d")
        except ValueError:
            return None

@project_bp.route("/", methods=["GET"])
def get_projects():
    """Get all projects, potentially filtered by status."""
    status_filter = request.args.get("status")
    try:
        query = Project.query
        if status_filter and status_filter in ["Draft", "Active", "Completed"]:
            query = query.filter(Project.status == status_filter)

        projects = query.order_by(Project.last_modified_date.desc()).all()
        project_list = [p.to_dict() for p in projects]
        return jsonify(project_list)
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({"error": "An error occurred while fetching projects."}), 500

@project_bp.route("/<int:project_id>", methods=["GET"])
def get_project_details(project_id):
    """Get details for a single project."""
    try:
        project = Project.query.get_or_404(project_id)
        return jsonify(project.to_dict())
    except Exception as e:
        print(f"Error fetching project {project_id}: {e}")
        return jsonify({"error": "An error occurred while fetching project details."}), 500

@project_bp.route("/", methods=["POST"])
def create_project():
    """Create a new project (owner removed, phase added)."""
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Project name is required"}), 400

    # Validate required fields (owner removed, phase added)
    required_fields = ["name", "status", "project_phase"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing required fields: {", ".join(required_fields)}"}), 400

    # Validate status
    if data["status"] not in ["Draft", "Active", "Completed"]:
        return jsonify({"error": "Invalid status value."}), 400

    # Validate project phase
    if data["project_phase"] not in PMI_PHASES:
        return jsonify({"error": "Invalid project phase value."}), 400

    start_date = parse_date(data.get("start_date"))
    end_date = parse_date(data.get("end_date"))

    try:
        new_project = Project(
            name=data["name"],
            description=data.get("description"),
            start_date=start_date,
            end_date=end_date,
            status=data["status"],
            project_phase=data["project_phase"] # Added phase
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify({
            "message": "Project created successfully",
            "project": new_project.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating project: {e}")
        return jsonify({"error": "An error occurred while creating the project."}), 500

@project_bp.route("/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    """Update an existing project (owner removed, phase added)."""
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    try:
        # Update fields if they exist in the request data
        if "name" in data: project.name = data["name"]
        if "description" in data: project.description = data["description"]
        if "start_date" in data:
             parsed_start = parse_date(data["start_date"])
             if data["start_date"] is not None and parsed_start is None:
                 return jsonify({"error": "Invalid start date format."}), 400
             project.start_date = parsed_start
        if "end_date" in data:
            parsed_end = parse_date(data["end_date"])
            if data["end_date"] is not None and parsed_end is None:
                return jsonify({"error": "Invalid end date format."}), 400
            project.end_date = parsed_end
        if "status" in data:
            if data["status"] not in ["Draft", "Active", "Completed"]:
                return jsonify({"error": "Invalid status value."}), 400
            project.status = data["status"]
        # Update project phase
        if "project_phase" in data:
            if data["project_phase"] not in PMI_PHASES:
                return jsonify({"error": "Invalid project phase value."}), 400
            project.project_phase = data["project_phase"]

        # Handle stakeholder updates
        if "stakeholder_ids" in data and isinstance(data["stakeholder_ids"], list):
            valid_stakeholders = Employee.query.filter(Employee.id.in_(data["stakeholder_ids"])).all()
            project.stakeholders = valid_stakeholders

        db.session.commit()
        return jsonify({
            "message": "Project updated successfully",
            "project": project.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error updating project {project_id}: {e}")
        return jsonify({"error": "An error occurred while updating the project."}), 500

@project_bp.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    """Delete a project."""
    try:
        project = Project.query.get_or_404(project_id)
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": f"Project ID {project_id} deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting project {project_id}: {e}")
        return jsonify({"error": "An error occurred while deleting the project."}), 500

# --- Stakeholder Management Routes ---

@project_bp.route("/<int:project_id>/stakeholders", methods=["POST"])
def add_stakeholder_to_project(project_id):
    """Add a stakeholder (employee) to a project."""
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    if not data or "employee_id" not in data:
        return jsonify({"error": "Employee ID is required"}), 400

    employee = Employee.query.get(data["employee_id"])
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    if employee in project.stakeholders:
        return jsonify({"message": "Employee is already a stakeholder in this project"}), 200

    try:
        project.stakeholders.append(employee)
        db.session.commit()
        return jsonify({
            "message": f"Employee {employee.name} added as stakeholder to project {project.name}",
            "project": project.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding stakeholder to project {project_id}: {e}")
        return jsonify({"error": "An error occurred while adding stakeholder."}), 500

@project_bp.route("/<int:project_id>/stakeholders/<int:employee_id>", methods=["DELETE"])
def remove_stakeholder_from_project(project_id, employee_id):
    """Remove a stakeholder from a project."""
    project = Project.query.get_or_404(project_id)
    employee = Employee.query.get_or_404(employee_id)

    if employee not in project.stakeholders:
        return jsonify({"error": "Employee is not a stakeholder in this project"}), 404

    try:
        project.stakeholders.remove(employee)
        db.session.commit()
        return jsonify({
            "message": f"Employee {employee.name} removed as stakeholder from project {project.name}",
            "project": project.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error removing stakeholder from project {project_id}: {e}")
        return jsonify({"error": "An error occurred while removing stakeholder."}), 500

# --- Employee Route (for dropdowns, still needed for stakeholders) ---

@project_bp.route("/../employees", methods=["GET"])
def get_employees():
    """Get a list of all employees."""
    try:
        employees = Employee.query.order_by(Employee.name).all()
        employee_list = [emp.to_dict() for emp in employees]
        return jsonify(employee_list)
    except Exception as e:
        print(f"Error fetching employees: {e}")
        return jsonify({"error": "An error occurred while fetching employees."}), 500

