# /home/ubuntu/melyn_cm_platform/backend/api/group_routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from models import Group, Employee, group_members

group_bp = Blueprint("group_bp", __name__, url_prefix="/api/groups")

# --- Group CRUD ---

@group_bp.route("", methods=["POST"])
def create_group():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Group name is required"}), 400

    if Group.query.filter_by(name=data["name"]).first():
         return jsonify({"error": "Group name already exists"}), 409

    new_group = Group(
        name=data["name"],
        description=data.get("description", "")
    )
    db.session.add(new_group)
    db.session.commit()
    return jsonify(new_group.to_dict()), 201

@group_bp.route("", methods=["GET"])
def get_groups():
    groups = Group.query.order_by(Group.name).all()
    return jsonify([group.to_dict() for group in groups]), 200

@group_bp.route("/<int:group_id>", methods=["GET"])
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify(group.to_dict(include_members=True)), 200

@group_bp.route("/<int:group_id>", methods=["PUT"])
def update_group(group_id):
    group = Group.query.get_or_404(group_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Check if name is being changed and if the new name already exists
    new_name = data.get("name")
    if new_name and new_name != group.name and Group.query.filter_by(name=new_name).first():
        return jsonify({"error": "Group name already exists"}), 409

    group.name = new_name if new_name else group.name
    group.description = data.get("description", group.description)
    db.session.commit()
    return jsonify(group.to_dict()), 200

@group_bp.route("/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    group = Group.query.get_or_404(group_id)
    # Ensure members are handled if needed (SQLAlchemy handles association table cleanup)
    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted successfully"}), 200

# --- Group Member Management ---

@group_bp.route("/<int:group_id>/members", methods=["POST"])
def add_group_members(group_id):
    group = Group.query.get_or_404(group_id)
    data = request.get_json()
    if not data or "employee_ids" not in data or not isinstance(data["employee_ids"], list):
        return jsonify({"error": "Invalid data format. 'employee_ids' list is required."}), 400

    added_count = 0
    skipped_count = 0
    not_found_ids = []

    for emp_id in data["employee_ids"]:
        employee = Employee.query.get(emp_id)
        if not employee:
            not_found_ids.append(emp_id)
            continue

        if employee in group.members:
            skipped_count += 1
        else:
            group.members.append(employee)
            added_count += 1

    db.session.commit()

    response = {
        "message": f"Added {added_count} members, skipped {skipped_count} duplicates.",
        "group": group.to_dict(include_members=True)
    }
    if not_found_ids:
        response["warning"] = f"Employee IDs not found: {not_found_ids}"

    return jsonify(response), 200

@group_bp.route("/<int:group_id>/members/<int:employee_id>", methods=["DELETE"])
def remove_group_member(group_id, employee_id):
    group = Group.query.get_or_404(group_id)
    employee = Employee.query.get_or_404(employee_id)

    if employee not in group.members:
        return jsonify({"error": "Employee is not a member of this group"}), 404

    group.members.remove(employee)
    db.session.commit()
    return jsonify({"message": "Member removed successfully", "group": group.to_dict(include_members=True)}), 200


