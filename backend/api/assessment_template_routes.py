from flask import Blueprint, request, jsonify
from models import db, AssessmentTemplate, AssessmentQuestion
from datetime import datetime

assessment_template_bp = Blueprint("assessment_template_bp", __name__)

# --- Template CRUD ---
@assessment_template_bp.route("", methods=["GET"])
@assessment_template_bp.route("/", methods=["GET"])
def get_assessment_templates():
    templates = AssessmentTemplate.query.order_by(AssessmentTemplate.updated_at.desc()).all()
    return jsonify({"templates": [t.to_dict() for t in templates]})

@assessment_template_bp.route("", methods=["POST"])
@assessment_template_bp.route("/", methods=["POST"])
def create_assessment_template():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Template name is required"}), 400
    new_template = AssessmentTemplate(
        name=data["name"],
        description=data.get("description"),
        # status and is_default are not in the model, so we skip them
        # last_updated is handled by updated_at
    )
    db.session.add(new_template)
    db.session.commit()
    return jsonify(new_template.to_dict()), 201

@assessment_template_bp.route("/<int:template_id>", methods=["GET"])
def get_assessment_template(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    return jsonify(template.to_dict(include_questions=True))

@assessment_template_bp.route("/<int:template_id>", methods=["PUT"])
def update_assessment_template(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    template.title = data.get("title", template.title)
    template.description = data.get("description", template.description)
    template.status = data.get("status", template.status)
    template.last_updated = datetime.utcnow()
    template.version += 1
    db.session.commit()
    return jsonify(template.to_dict(include_questions=True))

@assessment_template_bp.route("/<int:template_id>", methods=["DELETE"])
def delete_assessment_template(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    db.session.delete(template)
    db.session.commit()
    return jsonify({"message": "Template deleted"}), 200

# --- Duplicate Template ---
@assessment_template_bp.route("/<int:template_id>/duplicate", methods=["POST"])
def duplicate_assessment_template(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    new_template = AssessmentTemplate(
        title=template.title + " (Copy)",
        description=template.description,
        status="Draft",
        is_default=False,
        last_updated=datetime.utcnow(),
        version=1
    )
    db.session.add(new_template)
    db.session.flush()  # Get new_template.id
    # Duplicate questions
    for q in template.questions:
        new_q = AssessmentQuestion(
            template_id=new_template.id,
            label=q.label,
            type=q.type,
            required=q.required,
            helper_text=q.helper_text,
            default_answer=q.default_answer,
            order=q.order,
            options=q.options,
            placeholder=q.placeholder
        )
        db.session.add(new_q)
    db.session.commit()
    return jsonify(new_template.to_dict(include_questions=True)), 201

# --- Set Default Template ---
@assessment_template_bp.route("/<int:template_id>/set-default", methods=["PUT"])
def set_default_assessment_template(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    # Unset previous default
    AssessmentTemplate.query.update({AssessmentTemplate.is_default: False})
    template.is_default = True
    db.session.commit()
    return jsonify({"message": "Template set as default", "template": template.to_dict()})

# --- Question Management ---
@assessment_template_bp.route("/<int:template_id>/questions", methods=["GET"])
def get_template_questions(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    return jsonify([q.to_dict() for q in template.questions])

@assessment_template_bp.route("/<int:template_id>/questions", methods=["POST"])
def add_template_question(template_id):
    template = AssessmentTemplate.query.get_or_404(template_id)
    data = request.get_json()
    if not data or not data.get("label") or not data.get("type"):
        return jsonify({"error": "Question label and type are required"}), 400
    new_q = AssessmentQuestion(
        template_id=template.id,
        label=data["label"],
        type=data["type"],
        required=data.get("required", False),
        helper_text=data.get("helper_text"),
        default_answer=data.get("default_answer"),
        order=data.get("order", len(template.questions)),
        options=data.get("options"),
        placeholder=data.get("placeholder")
    )
    db.session.add(new_q)
    db.session.commit()
    return jsonify(new_q.to_dict()), 201

@assessment_template_bp.route("/assessment_questions/<int:question_id>", methods=["PUT"])
def update_template_question(question_id):
    q = AssessmentQuestion.query.get_or_404(question_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    q.label = data.get("label", q.label)
    q.type = data.get("type", q.type)
    q.required = data.get("required", q.required)
    q.helper_text = data.get("helper_text", q.helper_text)
    q.default_answer = data.get("default_answer", q.default_answer)
    q.order = data.get("order", q.order)
    q.options = data.get("options", q.options)
    q.placeholder = data.get("placeholder", q.placeholder)
    db.session.commit()
    return jsonify(q.to_dict()), 200

@assessment_template_bp.route("/assessment_questions/<int:question_id>", methods=["DELETE"])
def delete_template_question(question_id):
    q = AssessmentQuestion.query.get_or_404(question_id)
    db.session.delete(q)
    db.session.commit()
    return jsonify({"message": "Question deleted"}), 200

