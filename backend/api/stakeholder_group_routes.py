# /home/ubuntu/melyn_cm_platform/backend/api/stakeholder_group_routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from models import StakeholderGroup, Employee

stakeholder_group_bp = Blueprint("stakeholder_group_bp", __name__)

# --- Stakeholder Group CRUD ---

@stakeholder_group_bp.route("/", methods=["POST"])
def create_stakeholder_group():
    """Create a new stakeholder group."""
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Group name is required"}), 400

    # Check if group name already exists
    if StakeholderGroup.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "A group with this name already exists"}), 409 # Conflict

    try:
        new_group = StakeholderGroup(
            name=data["name"],
            description=data.get("description")
        )
        db.session.add(new_group)
        db.session.commit()
        return jsonify(new_group.to_dict()), 201 # Created
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create group: {str(e)}"}), 500

@stakeholder_group_bp.route("/", methods=["GET"])
def get_stakeholder_groups():
    """Get a list of all stakeholder groups."""
    try:
        groups = StakeholderGroup.query.order_by(StakeholderGroup.name).all()
        # Return dict with member count, but not full member list by default
        return jsonify([group.to_dict(include_members=False) for group in groups]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve groups: {str(e)}"}), 500

@stakeholder_group_bp.route("/<int:group_id>", methods=["GET"])
def get_stakeholder_group(group_id):
    """Get details of a specific stakeholder group, including members."""
    group = StakeholderGroup.query.get_or_404(group_id)
    try:
        # Include members when fetching a single group
        return jsonify(group.to_dict(include_members=True)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve group details: {str(e)}"}), 500

@stakeholder_group_bp.route("/<int:group_id>", methods=["PUT"])
def update_stakeholder_group(group_id):
    """Update an existing stakeholder group."""
    group = StakeholderGroup.query.get_or_404(group_id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Check for name change and potential conflict
    new_name = data.get("name")
    if new_name and new_name != group.name:
        if StakeholderGroup.query.filter(StakeholderGroup.name == new_name, StakeholderGroup.id != group_id).first():
            return jsonify({"error": "Another group with this name already exists"}), 409
        group.name = new_name

    # Update description if provided
    if "description" in data:
        group.description = data["description"]

    try:
        db.session.commit()
        return jsonify(group.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update group: {str(e)}"}), 500

@stakeholder_group_bp.route("/<int:group_id>", methods=["DELETE"])
def delete_stakeholder_group(group_id):
    """Delete a stakeholder group."""
    group = StakeholderGroup.query.get_or_404(group_id)
    try:
        # Manually clear the relationship before deleting the group
        # to avoid potential foreign key issues if cascade isn't set up
        group.employees.clear()
        db.session.delete(group)
        db.session.commit()
        return jsonify({"message": f"Group \"{group.name}\" deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete group: {str(e)}"}), 500

# --- Group Membership Management ---

@stakeholder_group_bp.route("/<int:group_id>/members", methods=["POST"])
def add_member_to_group(group_id):
    """Add an employee to a stakeholder group."""
    group = StakeholderGroup.query.get_or_404(group_id)
    data = request.get_json()
    if not data or "employee_id" not in data:
        return jsonify({"error": "Employee ID is required"}), 400

    employee = Employee.query.get(data["employee_id"])
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    if employee in group.employees:
        return jsonify({"message": "Employee already in group"}), 200 # Or 409 Conflict?

    try:
        group.employees.append(employee)
        db.session.commit()
        return jsonify(group.to_dict(include_members=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to add member: {str(e)}"}), 500

@stakeholder_group_bp.route("/<int:group_id>/members/<int:employee_id>", methods=["DELETE"])
def remove_member_from_group(group_id, employee_id):
    """Remove an employee from a stakeholder group."""
    group = StakeholderGroup.query.get_or_404(group_id)
    employee = Employee.query.get(employee_id)

    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    if employee not in group.employees:
        return jsonify({"error": "Employee not found in this group"}), 404

    try:
        group.employees.remove(employee)
        db.session.commit()
        return jsonify(group.to_dict(include_members=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to remove member: {str(e)}"}), 500

@stakeholder_group_bp.route("/<int:group_id>/members", methods=["PUT"])
def set_group_members(group_id):
    """Set the complete list of members for a group (replaces existing)."""
    group = StakeholderGroup.query.get_or_404(group_id)
    data = request.get_json()
    if not data or "employee_ids" not in data or not isinstance(data["employee_ids"], list):
        return jsonify({"error": "A list of employee_ids is required"}), 400

    try:
        new_members = []
        for emp_id in data["employee_ids"]:
            employee = Employee.query.get(emp_id)
            if employee:
                new_members.append(employee)
            else:
                # Optionally raise an error if an ID is invalid
                # return jsonify({"error": f"Employee with ID {emp_id} not found"}), 404
                pass # Silently ignore invalid IDs for now
        
        group.employees = new_members # Replace the list
        db.session.commit()
        return jsonify(group.to_dict(include_members=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to set group members: {str(e)}"}), 500

