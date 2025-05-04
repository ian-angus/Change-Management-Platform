from flask import Blueprint, request, jsonify
from models import db, AssessmentTemplate

assessment_template_bp = Blueprint("assessment_template_bp", __name__)

@assessment_template_bp.route("/assessment_templates", methods=["GET"])
def get_assessment_templates():
    templates = AssessmentTemplate.query.all()
    return jsonify([{
        "id": t.id,
        "name": t.name,
        "description": t.description,
        # Avoid sending full questions list in general GET
        # "questions": t.questions
    } for t in templates])

@assessment_template_bp.route("/assessment_templates", methods=["POST"])
def create_assessment_template():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Template name is required"}), 400

    new_template = AssessmentTemplate(
        name=data["name"],
        description=data.get("description"),
        questions=data.get("questions", []) # Default to empty list if not provided
    )
    db.session.add(new_template)
    db.session.commit()
    return jsonify({
        "id": new_template.id,
        "name": new_template.name,
        "description": new_template.description,
        "questions": new_template.questions
    }), 201

@assessment_template_bp.route("/assessment_templates/<int:template_id>", methods=["GET"])
def get_assessment_template(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    return jsonify({
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "questions": template.questions
    })

# Add PUT/DELETE for templates if needed

