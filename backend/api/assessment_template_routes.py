# /home/ubuntu/melyn_cm_platform/backend/api/assessment_template_routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from models import AssessmentTemplate, AssessmentQuestion
from sqlalchemy.exc import IntegrityError

assessment_template_bp = Blueprint("assessment_template_bp", __name__)

# --- Template CRUD ---

@assessment_template_bp.route("/", methods=["POST"])
def create_assessment_template():
    """Create a new assessment template."""
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Template title is required"}), 400

    try:
        new_template = AssessmentTemplate(
            title=data["title"],
            description=data.get("description"),
            is_default=data.get("is_default", False),
            version=1 # Initial version
        )
        
        # Handle default status - ensure only one default
        if new_template.is_default:
            AssessmentTemplate.query.filter_by(is_default=True).update({"is_default": False})

        db.session.add(new_template)
        db.session.commit()
        return jsonify(new_template.to_dict(include_questions=True)), 201
    except IntegrityError: # Handles potential unique constraint violations if added
        db.session.rollback()
        return jsonify({"error": "A template with this title might already exist or another integrity issue occurred"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create template: {str(e)}"}), 500

@assessment_template_bp.route("/", methods=["GET"])
def get_assessment_templates():
    """Get a list of all assessment templates (latest version)."""
    try:
        # Simple approach: Get all templates for now. Version filtering can be added.
        templates = AssessmentTemplate.query.order_by(AssessmentTemplate.title, AssessmentTemplate.version.desc()).all()
        # In a real scenario, you might group by a base_template_id and get the latest version.
        return jsonify([t.to_dict(include_questions=False) for t in templates]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve templates: {str(e)}"}), 500

@assessment_template_bp.route("/<int:template_id>", methods=["GET"])
def get_assessment_template(template_id):
    """Get details of a specific assessment template, including questions."""
    template = AssessmentTemplate.query.get_or_404(template_id)
    try:
        return jsonify(template.to_dict(include_questions=True)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve template details: {str(e)}"}), 500

@assessment_template_bp.route("/<int:template_id>", methods=["PUT"])
def update_assessment_template(template_id):
    """Update an existing assessment template (creates a new version)."""
    # Versioning approach: Create a new template record with incremented version.
    # Simpler approach for now: Just update in place.
    template = AssessmentTemplate.query.get_or_404(template_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        if "title" in data:
            template.title = data["title"]
        if "description" in data:
            template.description = data["description"]
        if "is_default" in data:
             # Handle default status - ensure only one default
            if data["is_default"] and not template.is_default:
                AssessmentTemplate.query.filter(AssessmentTemplate.id != template_id, AssessmentTemplate.is_default == True).update({"is_default": False})
            template.is_default = data["is_default"]
        
        # Note: Updating questions is handled via separate endpoints.
        
        db.session.commit()
        return jsonify(template.to_dict(include_questions=True)), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Update failed due to potential integrity constraint violation (e.g., duplicate title)"}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update template: {str(e)}"}), 500

@assessment_template_bp.route("/<int:template_id>", methods=["DELETE"])
def delete_assessment_template(template_id):
    """Delete an assessment template and its questions."""
    template = AssessmentTemplate.query.get_or_404(template_id)
    try:
        # Questions should cascade delete due to relationship setting
        db.session.delete(template)
        db.session.commit()
        return jsonify({"message": f"Template \"{template.title}\" deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete template: {str(e)}"}), 500

@assessment_template_bp.route("/<int:template_id>/set-default", methods=["PUT"])
def set_template_as_default(template_id):
    """Mark a specific template as the default, unsetting others."""
    template = AssessmentTemplate.query.get_or_404(template_id)
    try:
        # Unset other defaults
        AssessmentTemplate.query.filter(AssessmentTemplate.id != template_id, AssessmentTemplate.is_default == True).update({"is_default": False})
        # Set this one as default
        template.is_default = True
        db.session.commit()
        return jsonify(template.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to set template as default: {str(e)}"}), 500

# --- Question CRUD within a Template ---

@assessment_template_bp.route("/<int:template_id>/questions", methods=["POST"])
def add_question_to_template(template_id):
    """Add a new question to a specific assessment template."""
    template = AssessmentTemplate.query.get_or_404(template_id)
    data = request.get_json()
    if not data or not data.get("text") or not data.get("question_type"):
        return jsonify({"error": "Question text and type are required"}), 400
    
    # Basic validation for question type
    valid_types = ["single_choice", "multiple_choice", "likert_scale", "open_ended"]
    if data["question_type"] not in valid_types:
        return jsonify({"error": f"Invalid question type. Must be one of: {', '.join(valid_types)}"}), 400

    # Validate options for choice types
    if data["question_type"] in ["single_choice", "multiple_choice", "likert_scale"]:
        if not data.get("options") or not isinstance(data["options"], list) or len(data["options"]) == 0:
             return jsonify({"error": "Options list is required for choice-based questions"}), 400

    try:
        # Determine the order for the new question
        max_order = db.session.query(db.func.max(AssessmentQuestion.order)).filter_by(template_id=template_id).scalar()
        new_order = (max_order or 0) + 1

        new_question = AssessmentQuestion(
            template_id=template_id,
            text=data["text"],
            question_type=data["question_type"],
            options=data.get("options"), # Stored as JSON
            order=new_order
        )
        db.session.add(new_question)
        db.session.commit()
        # Return the updated template or just the new question?
        # Returning updated template for consistency
        return jsonify(template.to_dict(include_questions=True)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to add question: {str(e)}"}), 500

@assessment_template_bp.route("/<int:template_id>/questions/<int:question_id>", methods=["PUT"])
def update_question_in_template(template_id, question_id):
    """Update an existing question within a template."""
    question = AssessmentQuestion.query.filter_by(id=question_id, template_id=template_id).first_or_404()
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        if "text" in data:
            question.text = data["text"]
        if "question_type" in data:
            # Add validation if type changes, e.g., ensure options exist if changing to choice type
            question.question_type = data["question_type"]
        if "options" in data:
            # Ensure options are provided if it's a choice type
            question.options = data["options"]
        if "order" in data:
            # Handle order changes carefully - might need reordering logic for other questions
            question.order = data["order"]

        db.session.commit()
        # Return the updated template
        template = AssessmentTemplate.query.get(template_id)
        return jsonify(template.to_dict(include_questions=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update question: {str(e)}"}), 500

@assessment_template_bp.route("/<int:template_id>/questions/<int:question_id>", methods=["DELETE"])
def delete_question_from_template(template_id, question_id):
    """Delete a question from a template."""
    question = AssessmentQuestion.query.filter_by(id=question_id, template_id=template_id).first_or_404()
    try:
        db.session.delete(question)
        # Optionally, re-order remaining questions
        db.session.commit()
        template = AssessmentTemplate.query.get(template_id)
        return jsonify(template.to_dict(include_questions=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete question: {str(e)}"}), 500

