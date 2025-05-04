# /home/ubuntu/melyn_cm_platform/backend/api/project_routes.py
from flask import Blueprint, request, jsonify
from extensions import db
from models import Project, Employee

project_bp = Blueprint("project_bp", __name__, url_prefix="/api/projects")

# --- Project CRUD Operations ---

@project_bp.route("/", methods=["GET"])
def get_projects():
    """Get a list of all projects."""
    try:
        projects = Project.query.all()
        return jsonify([project.to_dict() for project in projects]), 200
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return jsonify({"error": "Failed to fetch projects"}), 500

@project_bp.route("/", methods=["POST"])
def create_project():
    """Create a new project."""
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Project name is required"}), 400

    try:
        new_project = Project(
            name=data["name"],
            description=data.get("description", ""),
            status=data.get("status", "Planning"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date")
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify(new_project.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating project: {e}")
        return jsonify({"error": "Failed to create project"}), 500

@project_bp.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    """Delete a specific project."""
    project = Project.query.get_or_404(project_id)
    try:
        # Optionally handle related data cleanup here if needed
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": f"Project {project_id} deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting project: {e}")
        return jsonify({"error": "Failed to delete project"}), 500

# --- Project Employee Management ---

@project_bp.route("/<int:project_id>/employees", methods=["GET"])
def get_project_employees(project_id):
    """Get a list of employees assigned to a specific project."""
    project = Project.query.get_or_404(project_id)
    employees = project.employees # Access the relationship
    return jsonify([emp.to_dict() for emp in employees]), 200

@project_bp.route("/<int:project_id>/employees", methods=["POST"])
def add_employee_to_project(project_id):
    """Add one or more employees to a project. Supports adding by ID or by role."""
    project = Project.query.get_or_404(project_id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input"}), 400

    employee_ids_to_add = data.get("employee_ids", [])
    role_to_add = data.get("role")

    added_employees = []
    errors = []
    warnings = [] # To track already assigned employees

    # Add by specific IDs
    if employee_ids_to_add:
        for emp_id in employee_ids_to_add:
            employee = Employee.query.get(emp_id)
            if not employee:
                errors.append(f"Employee with ID {emp_id} not found.")
                continue
            if employee not in project.employees:
                project.employees.append(employee)
                added_employees.append(employee.id)
            else:
                 warnings.append(f"Employee {employee.name} (ID: {emp_id}) is already assigned.")

    # Add by role
    if role_to_add:
        employees_with_role = Employee.query.filter_by(role=role_to_add).all()
        if not employees_with_role:
            errors.append(f"No employees found with role 	'{role_to_add}	'.")
        else:
            for employee in employees_with_role:
                if employee not in project.employees:
                    project.employees.append(employee)
                    added_employees.append(employee.id)
                else:
                    warnings.append(f"Employee {employee.name} (ID: {employee.id}) with role 	'{role_to_add}	' is already assigned.")

    if not added_employees and not errors and not warnings:
         return jsonify({"message": "No employees specified or found to add."}), 400 # Changed to 400 as it's likely an input issue
    elif not added_employees and errors:
         return jsonify({"error": "Failed to add employees.", "details": errors}), 400

    try:
        db.session.commit()
        response = {
            "message": f"Operation complete. Added {len(added_employees)} new employee(s) to project {project_id}.",
            "added_employee_ids": added_employees
        }
        # Combine warnings and errors for frontend display
        all_details = warnings + errors
        if all_details:
            response["details"] = all_details
        return jsonify(response), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error adding employees to project: {e}")
        # Combine warnings and errors for frontend display
        all_details = warnings + errors + [f"Database error: {str(e)}"]
        return jsonify({"error": "Failed to add employees to project.", "details": all_details}), 500

@project_bp.route("/<int:project_id>/employees/<int:employee_id>", methods=["DELETE"])
def remove_employee_from_project(project_id, employee_id):
    """Remove a specific employee from a project."""
    project = Project.query.get_or_404(project_id)
    employee = Employee.query.get(employee_id)

    if not employee:
        return jsonify({"error": f"Employee with ID {employee_id} not found."}), 404

    if employee in project.employees:
        project.employees.remove(employee)
        try:
            db.session.commit()
            return jsonify({"message": f"Employee {employee_id} removed from project {project_id}."}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error removing employee from project: {e}")
            return jsonify({"error": "Failed to remove employee from project."}), 500
    else:
        return jsonify({"error": f"Employee {employee_id} is not assigned to project {project_id}."}), 404

