from flask import Blueprint, request, jsonify
from extensions import db
from models import Assessment, Project, Employee, AssessmentTemplate
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
import traceback

assessment_bp = Blueprint("assessment_bp", __name__, url_prefix="/api/assessments")

@assessment_bp.route("/", methods=["GET"])
def get_assessments():
    """Get assessments, filtered by project_id."""
    project_id = request.args.get("project_id")
    if not project_id:
        return jsonify({"error": "project_id parameter is required"}), 400

    try:
        project_id = int(project_id)
        assessments = Assessment.query.filter_by(project_id=project_id).order_by(Assessment.creation_date.desc()).all()
        assessment_list = [a.to_dict() for a in assessments]
        return jsonify(assessment_list)
    except ValueError:
        return jsonify({"error": "Invalid project_id format"}), 400
    except Exception as e:
        print(f"Error fetching assessments: {e}") # Log error
        return jsonify({"error": "An error occurred while fetching assessments."}), 500

@assessment_bp.route("/", methods=["POST"])
def create_assessment():
    """Initiate a new assessment for a project based on type."""
    data = request.get_json()
    if not data or not data.get("project_id") or not data.get("assessment_type"):
        return jsonify({"error": "project_id and assessment_type are required"}), 400

    try:
        project_id = int(data["project_id"])
        # Check if project exists
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "Project not found"}), 404

        # Find the template by assessment_type
        template = AssessmentTemplate.query.filter_by(name=data["assessment_type"]).first()
        template_description = template.description if template else None

        new_assessment = Assessment(
            project_id=project_id,
            assessment_type=data["assessment_type"],
            status="Not Started", # Default status
            description=template_description
            # Add other fields like results if provided during creation
        )
        db.session.add(new_assessment)
        db.session.commit()
        
        # Return the newly created assessment data along with a success message
        return jsonify({
            "message": f"{new_assessment.assessment_type} assessment created successfully for project {project_id}",
            "assessment": new_assessment.to_dict()
        }), 201

    except ValueError:
         return jsonify({"error": "Invalid project_id format"}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating assessment: {e}") # Log error
        return jsonify({"error": "An error occurred while creating the assessment."}), 500

@assessment_bp.route("/<int:assessment_id>/deploy", methods=["POST"])
def deploy_assessment(assessment_id):
    """Mark an assessment as deployed (supports scheduling via deploy_at)."""
    try:
        assessment = Assessment.query.get(assessment_id)
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        # Check if assessment can be deployed (e.g., not already completed)
        if assessment.status in ["Deployed", "Completed"]:
            return jsonify({"message": "Assessment is already deployed or completed"}), 400

        data = request.get_json() or {}
        deploy_at = data.get("deploy_at")
        if deploy_at:
            assessment.deploy_at = datetime.fromisoformat(deploy_at)
        else:
            assessment.deploy_at = None  # Immediate deployment
        assessment.status = "Deployed"
        db.session.commit()
        return jsonify({
            "message": f"Assessment ID {assessment_id} deployed successfully.",
            "assessment": assessment.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deploying assessment {assessment_id}: {e}")
        return jsonify({"error": "An error occurred while deploying the assessment."}), 500

# DELETE endpoint for assessments
@assessment_bp.route("/<int:assessment_id>", methods=["DELETE"])
def delete_assessment(assessment_id):
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({"error": "Assessment not found"}), 404
    db.session.delete(assessment)
    db.session.commit()
    return jsonify({"message": f"Assessment {assessment_id} deleted successfully."}), 200

# --- Stakeholder Assignment Endpoints ---
@assessment_bp.route("/project/<int:project_id>/stakeholders", methods=["GET"])
def get_project_stakeholders(project_id):
    project = Project.query.get_or_404(project_id)
    stakeholders = project.stakeholders
    return jsonify([s.to_dict() for s in stakeholders]), 200

@assessment_bp.route("/<int:assessment_id>/stakeholders", methods=["GET"])
def get_assessment_stakeholders(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    stakeholders = assessment.stakeholders
    return jsonify([s.to_dict() for s in stakeholders]), 200

@assessment_bp.route("/<int:assessment_id>/stakeholders", methods=["POST"])
def assign_stakeholders_to_assessment(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    data = request.get_json()
    if not data or "employee_ids" not in data or not isinstance(data["employee_ids"], list):
        return jsonify({"error": "employee_ids (list) required"}), 400
    added = []
    for emp_id in data["employee_ids"]:
        emp = Employee.query.get(emp_id)
        if emp and emp not in assessment.stakeholders:
            assessment.stakeholders.append(emp)
            added.append(emp_id)
    db.session.commit()
    return jsonify({"message": f"Assigned {len(added)} stakeholders", "added": added}), 200

@assessment_bp.route("/<int:assessment_id>/stakeholders/<int:employee_id>", methods=["DELETE"])
def remove_stakeholder_from_assessment(assessment_id, employee_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    emp = Employee.query.get_or_404(employee_id)
    if emp in assessment.stakeholders:
        assessment.stakeholders.remove(emp)
        db.session.commit()
        return jsonify({"message": "Stakeholder removed"}), 200
    else:
        return jsonify({"error": "Stakeholder not assigned to this assessment"}), 404

@assessment_bp.route("/<int:assessment_id>/submit", methods=["POST"])
@jwt_required()
def submit_assessment(assessment_id):
    print(f"[DEBUG] /submit endpoint called for assessment_id={assessment_id}")
    user_id = str(get_jwt_identity())
    data = request.get_json()
    print(f"[DEBUG] user_id={user_id}, data={data}")
    answers = data.get('answers')
    if not answers:
        print("[DEBUG] No answers provided.")
        return jsonify({"error": "No answers provided."}), 400
    assessment = Assessment.query.get_or_404(assessment_id)
    try:
        # Store results as a dict of user_id -> answers
        if not assessment.results or not isinstance(assessment.results, dict):
            assessment.results = {}
        assessment.results[user_id] = answers
        db.session.commit()
        print("[DEBUG] Assessment submitted successfully.")
        return jsonify({"message": "Assessment submitted successfully."})
    except Exception as e:
        db.session.rollback()
        print("[DEBUG] Exception in /submit endpoint:", e)
        print(traceback.format_exc())
        return jsonify({"error": "Failed to submit assessment.", "details": str(e)}), 500

# Potential future routes:
# GET /<int:assessment_id> - Get details of a single assessment
# PUT /<int:assessment_id> - Update assessment details or results

