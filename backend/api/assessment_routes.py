from flask import Blueprint, request, jsonify
from app import db
from models import Assessment, Project
from datetime import datetime

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

        new_assessment = Assessment(
            project_id=project_id,
            assessment_type=data["assessment_type"],
            status="Not Started" # Default status
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
    """Mark an assessment as deployed (updates status and timestamp)."""
    try:
        assessment = Assessment.query.get(assessment_id)
        if not assessment:
            return jsonify({"error": "Assessment not found"}), 404

        # Check if assessment can be deployed (e.g., not already completed)
        if assessment.status in ["Deployed", "Completed"]:
             return jsonify({"message": "Assessment is already deployed or completed"}), 400

        # Update status and completion_date (using completion_date for deployment time for now)
        assessment.status = "Deployed"
        assessment.completion_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "message": f"Assessment ID {assessment_id} deployed successfully.",
            "assessment": assessment.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deploying assessment {assessment_id}: {e}") # Log error
        return jsonify({"error": "An error occurred while deploying the assessment."}), 500

# Potential future routes:
# GET /<int:assessment_id> - Get details of a single assessment
# PUT /<int:assessment_id> - Update assessment details or results
# DELETE /<int:assessment_id> - Delete an assessment

