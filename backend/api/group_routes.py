# /home/ubuntu/melyn_cm_platform/backend/api/group_routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from models import Group, Employee, GroupMember

group_bp = Blueprint("group_bp", __name__, url_prefix="/groups")

# --- Group CRUD ---

@group_bp.route("", methods=["POST"])
@group_bp.route("/", methods=["POST"])
def create_group():
    try:
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
    except Exception as e:
        db.session.rollback()
        print(f"Error creating group: {str(e)}")
        return jsonify({"error": "An error occurred while creating the group"}), 500

@group_bp.route("", methods=["GET"])
@group_bp.route("/", methods=["GET"])
def get_groups():
    try:
        groups = Group.query.order_by(Group.name).all()
        return jsonify([group.to_dict() for group in groups]), 200
    except Exception as e:
        print(f"Error fetching groups: {str(e)}")
        return jsonify({"error": "An error occurred while fetching groups"}), 500

@group_bp.route("/<int:group_id>", methods=["GET"])
def get_group(group_id):
    try:
        group = Group.query.get_or_404(group_id)
        return jsonify(group.to_dict(include_members=True)), 200
    except Exception as e:
        print(f"Error fetching group {group_id}: {str(e)}")
        return jsonify({"error": "An error occurred while fetching the group"}), 500

@group_bp.route("/<int:group_id>", methods=["PUT"])
def update_group(group_id):
    try:
        group = Group.query.get_or_404(group_id)
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if "name" in data and data["name"] != group.name:
            if Group.query.filter(Group.id != group_id, Group.name == data["name"]).first():
                return jsonify({"error": "Group name already exists"}), 409
            group.name = data["name"]

        group.description = data.get("description", group.description)
        db.session.commit()
        return jsonify(group.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating group {group_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating the group"}), 500

@group_bp.route("/<int:group_id>", methods=["DELETE"])
def delete_group(group_id):
    try:
        group = Group.query.get_or_404(group_id)
        db.session.delete(group)
        db.session.commit()
        return jsonify({"message": "Group deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting group {group_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting the group"}), 500

# --- Group Member Management ---

@group_bp.route("/<int:group_id>/members", methods=["POST"])
def add_group_members(group_id):
    try:
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

            # Check if already a member
            existing = GroupMember.query.filter_by(group_id=group.id, employee_id=employee.id).first()
            if existing:
                skipped_count += 1
            else:
                new_member = GroupMember(group_id=group.id, employee_id=employee.id)
                db.session.add(new_member)
                added_count += 1

        db.session.commit()

        # Refresh group with members
        group = Group.query.get(group_id)
        response = {
            "message": f"Added {added_count} members, skipped {skipped_count} duplicates.",
            "group": group.to_dict(include_members=True)
        }
        if not_found_ids:
            response["warning"] = f"Employee IDs not found: {not_found_ids}"

        return jsonify(response), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error adding members to group {group_id}: {str(e)}")
        return jsonify({"error": "An error occurred while adding members to the group"}), 500

@group_bp.route("/<int:group_id>/members/<int:employee_id>", methods=["DELETE"])
def remove_group_member(group_id, employee_id):
    try:
        member = GroupMember.query.filter_by(group_id=group_id, employee_id=employee_id).first()
        if not member:
            return jsonify({"error": "Employee is not a member of this group"}), 404
        db.session.delete(member)
        db.session.commit()
        group = Group.query.get(group_id)
        return jsonify({
            "message": "Member removed successfully",
            "group": group.to_dict(include_members=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error removing member {employee_id} from group {group_id}: {str(e)}")
        return jsonify({"error": "An error occurred while removing the member"}), 500


