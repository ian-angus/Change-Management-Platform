from flask import Blueprint, request, jsonify
from models import db, Employee, Role

employee_bp = Blueprint("employee_bp", __name__)

# --- Employee Routes ---

@employee_bp.route("/employees", methods=["GET"])
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        "id": emp.id,
        "name": emp.name,
        "email": emp.email,
        "role_id": emp.role_id,
        "role_name": emp.role.name if emp.role else None
    } for emp in employees])

@employee_bp.route("/employees", methods=["POST"])
def create_employee():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"error": "Employee name and email are required"}), 400

    if Employee.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    new_employee = Employee(
        name=data["name"],
        email=data["email"],
        role_id=data.get("role_id")
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify({
        "id": new_employee.id,
        "name": new_employee.name,
        "email": new_employee.email,
        "role_id": new_employee.role_id
    }), 201

@employee_bp.route("/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    return jsonify({
        "id": employee.id,
        "name": employee.name,
        "email": employee.email,
        "role_id": employee.role_id,
        "role_name": employee.role.name if employee.role else None
    })

# Add PUT/DELETE for employees if needed

# --- Role Routes ---

@employee_bp.route("/roles", methods=["GET"])
def get_roles():
    roles = Role.query.all()
    return jsonify([{
        "id": role.id,
        "name": role.name,
        "description": role.description
    } for role in roles])

@employee_bp.route("/roles", methods=["POST"])
def create_role():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Role name is required"}), 400

    if Role.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Role name already exists"}), 400

    new_role = Role(
        name=data["name"],
        description=data.get("description")
    )
    db.session.add(new_role)
    db.session.commit()
    return jsonify({
        "id": new_role.id,
        "name": new_role.name,
        "description": new_role.description
    }), 201

# Add GET/PUT/DELETE for specific roles if needed

