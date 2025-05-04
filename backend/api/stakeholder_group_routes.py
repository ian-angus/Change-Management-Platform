from flask import Blueprint, request, jsonify
from models import db, StakeholderGroup, Project

stakeholder_group_bp = Blueprint("stakeholder_group_bp", __name__)

@stakeholder_group_bp.route("/stakeholder_groups", methods=["GET"])
def get_stakeholder_groups():
    project_id = request.args.get("project_id")
    if not project_id:
        return jsonify({"error": "project_id parameter is required"}), 400

    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    groups = project.stakeholder_groups.all()
    return jsonify([{
        "id": g.id,
        "name": g.name,
        "description": g.description,
        "project_id": g.project_id
    } for g in groups])

@stakeholder_group_bp.route("/stakeholder_groups", methods=["POST"])
def create_stakeholder_group():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("project_id"):
        return jsonify({"error": "Group name and project_id are required"}), 400

    project = Project.query.get(data["project_id"])
    if not project:
        return jsonify({"error": "Project not found"}), 404

    new_group = StakeholderGroup(
        name=data["name"],
        description=data.get("description"),
        project_id=data["project_id"]
    )
    db.session.add(new_group)
    db.session.commit()
    return jsonify({
        "id": new_group.id,
        "name": new_group.name,
        "description": new_group.description,
        "project_id": new_group.project_id
    }), 201

@stakeholder_group_bp.route("/stakeholder_groups/<int:group_id>", methods=["GET"])
def get_stakeholder_group(group_id):
    group = StakeholderGroup.query.get_or_404(group_id)
    return jsonify({
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "project_id": group.project_id
    })

@stakeholder_group_bp.route("/stakeholder_groups/<int:group_id>", methods=["PUT"])
def update_stakeholder_group(group_id):
    group = StakeholderGroup.query.get_or_404(group_id)
    data = request.get_json()

    if "name" in data:
        group.name = data["name"]
    if "description" in data:
        group.description = data.get("description") # Use get for optional field

    db.session.commit()
    return jsonify({"message": "Stakeholder group updated successfully"})

@stakeholder_group_bp.route("/stakeholder_groups/<int:group_id>", methods=["DELETE"])
def delete_stakeholder_group(group_id):
    group = StakeholderGroup.query.get_or_404(group_id)
    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Stakeholder group deleted successfully"})

