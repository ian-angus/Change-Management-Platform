from flask import Blueprint, request, jsonify
from models import db, Project, Employee

project_bp = Blueprint("project_bp", __name__)

@project_bp.route("/projects", methods=["GET"])
def get_projects():
    projects = Project.query.all()
    return jsonify([{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "start_date": p.start_date.isoformat() if p.start_date else None,
        "end_date": p.end_date.isoformat() if p.end_date else None
    } for p in projects])

@project_bp.route("/projects", methods=["POST"])
def create_project():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Project name is required"}), 400

    new_project = Project(
        name=data["name"],
        description=data.get("description")
        # Add start_date, end_date parsing if provided
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description
    }), 201

@project_bp.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "end_date": project.end_date.isoformat() if project.end_date else None
    })

@project_bp.route("/projects/<int:project_id>/employees", methods=["GET"])
def get_project_employees(project_id):
    project = Project.query.get_or_404(project_id)
    employees = project.employees.all() # Use .all() for lazy='dynamic'
    return jsonify([{
        "id": emp.id,
        "name": emp.name,
        "email": emp.email,
        "role": emp.role.name if emp.role else None
    } for emp in employees])

@project_bp.route("/projects/<int:project_id>/employees", methods=["POST"])
def add_employee_to_project(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    employee_id = data.get("employee_id")

    if not employee_id:
        return jsonify({"error": "Employee ID is required"}), 400

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Check if employee is already in the project
    if employee in project.employees:
        return jsonify({"message": "Employee already in project"}), 200

    project.employees.append(employee)
    db.session.commit()
    return jsonify({"message": f"Employee {employee.name} added to project {project.name}"}), 200

# Add routes for removing employees, updating projects etc. as needed

