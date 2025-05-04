# backend/api/assessment_routes.py
from flask import Blueprint, request, jsonify
from models import db, Assessment, AssessmentResponse, Employee, StakeholderGroup, Project
from sqlalchemy.orm import joinedload
from datetime import datetime

assessment_bp = Blueprint("assessment_bp", __name__)

# Get assessments for a specific project
@assessment_bp.route("/project/<int:project_id>", methods=["GET"])
def get_assessments_for_project(project_id):
    try:
        assessments = Assessment.query.filter_by(project_id=project_id).options(joinedload(Assessment.template)).all()
        return jsonify([assessment.to_dict() for assessment in assessments]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Create a new assessment for a project (based on a template)
@assessment_bp.route("/", methods=["POST"])
def create_assessment():
    data = request.get_json()
    if not data or not "project_id" in data or not "template_id" in data:
        return jsonify({"error": "Missing required fields (project_id, template_id)"}), 400
    try:
        # Optionally fetch template name if needed
        # template = AssessmentTemplate.query.get(data["template_id"])
        # name = data.get("name", template.name if template else "Assessment")

        new_assessment = Assessment(
            project_id=data["project_id"],
            template_id=data["template_id"],
            name=data.get("name", "New Assessment"), # Use provided name or default
            status="Not Started",
            due_date=datetime.fromisoformat(data["due_date"]) if data.get("due_date") else None
        )
        db.session.add(new_assessment)
        db.session.commit()
        # Eager load template for the response
        db.session.refresh(new_assessment)
        new_assessment = Assessment.query.options(joinedload(Assessment.template)).get(new_assessment.id)
        return jsonify(new_assessment.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Deploy an assessment to employees/groups
@assessment_bp.route("/<int:assessment_id>/deploy", methods=["POST"])
def deploy_assessment(assessment_id):
    data = request.get_json()
    assessment = Assessment.query.get_or_404(assessment_id)
    employee_ids = data.get("employee_ids", [])
    group_ids = data.get("group_ids", [])

    if not employee_ids and not group_ids:
        return jsonify({"error": "No employees or groups selected for deployment"}), 400

    try:
        target_employee_ids = set(employee_ids)

        # Add employees from selected groups
        if group_ids:
            groups = StakeholderGroup.query.filter(StakeholderGroup.id.in_(group_ids)).options(joinedload(StakeholderGroup.employees)).all()
            for group in groups:
                for employee in group.employees:
                    target_employee_ids.add(employee.id)

        # Here you would typically create entries in a separate table
        # linking the assessment to each target employee, or send notifications.
        # For now, we just update the assessment status.

        assessment.status = "Deployed"
        assessment.deployment_date = datetime.utcnow()
        # In a real app, you might store the list of deployed_to_employee_ids
        # or create individual AssessmentInstance records.

        db.session.commit()
        return jsonify(assessment.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get results for a specific assessment
@assessment_bp.route("/<int:assessment_id>/results", methods=["GET"])
def get_assessment_results(assessment_id):
    try:
        # Fetch all responses for this assessment, joining with Employee to get names
        responses = AssessmentResponse.query.filter_by(assessment_id=assessment_id)\
                                          .options(joinedload(AssessmentResponse.respondent)).all()

        if not responses:
             # Return structure expected by frontend even if no responses yet
             return jsonify({"responses": [], "summary": {}}), 200

        # Basic structure for summary - can be expanded
        summary = {
            "total_responses": len(responses),
            # Add more summary calculations here (e.g., average scores)
        }

        # Example: Aggregate ADKAR scores if applicable (requires knowing template structure)
        # This is a placeholder - actual logic depends heavily on template.structure
        # if assessment.template.type == 'ADKAR':
        #     adkar_summary = {'Awareness': 0, 'Desire': 0, 'Knowledge': 0, 'Ability': 0, 'Reinforcement': 0}
        #     for response in responses:
        #         # Assuming answers structure like {'adkar_section': score}
        #         for key, score in response.answers.items():
        #              if key in adkar_summary: # Basic check
        #                 adkar_summary[key] += score # Or average, etc.
        #     summary['adkar_scores'] = adkar_summary

        return jsonify({
            "responses": [response.to_dict() for response in responses],
            "summary": summary
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Submit a response to an assessment (Placeholder - typically done by end-user)
@assessment_bp.route("/<int:assessment_id>/submit", methods=["POST"])
def submit_assessment_response(assessment_id):
    data = request.get_json()
    if not data or not "employee_id" in data or not "answers" in data:
        return jsonify({"error": "Missing required fields (employee_id, answers)"}), 400

    try:
        # Check if assessment exists and is deployed
        assessment = Assessment.query.get_or_404(assessment_id)
        if assessment.status != "Deployed":
             return jsonify({"error": "Assessment is not currently active"}), 400

        # Check if employee exists
        employee = Employee.query.get_or_404(data["employee_id"])

        # Check if employee already submitted
        existing_response = AssessmentResponse.query.filter_by(
            assessment_id=assessment_id,
            employee_id=data["employee_id"]
        ).first()

        if existing_response:
            # Update existing response
            existing_response.answers = data["answers"]
            existing_response.submitted_at = datetime.utcnow()
            db.session.commit()
            return jsonify(existing_response.to_dict()), 200
        else:
            # Create new response
            new_response = AssessmentResponse(
                assessment_id=assessment_id,
                employee_id=data["employee_id"],
                answers=data["answers"],
                submitted_at=datetime.utcnow()
            )
            db.session.add(new_response)
            db.session.commit()
            return jsonify(new_response.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Update an assessment (e.g., name, due date - limited scope for now)
@assessment_bp.route("/<int:assessment_id>", methods=["PUT"])
def update_assessment(assessment_id):
    data = request.get_json()
    assessment = Assessment.query.get_or_404(assessment_id)

    # Prevent editing if not in 'Not Started' status?
    # if assessment.status != 'Not Started':
    #     return jsonify({'error': 'Cannot edit an assessment that has been deployed or completed'}), 400

    try:
        assessment.name = data.get("name", assessment.name)
        if data.get("due_date"):
            assessment.due_date = datetime.fromisoformat(data["due_date"])
        else:
            assessment.due_date = None # Allow clearing the due date

        # Add other editable fields as needed

        db.session.commit()
        # Eager load template for the response
        db.session.refresh(assessment)
        assessment = Assessment.query.options(joinedload(Assessment.template)).get(assessment.id)
        return jsonify(assessment.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete an assessment
@assessment_bp.route("/<int:assessment_id>", methods=["DELETE"])
def delete_assessment(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)

    # Add checks? Prevent deletion if responses exist?
    # if assessment.responses:
    #    return jsonify({'error': 'Cannot delete assessment with existing responses'}), 400

    try:
        # Manually delete responses first if necessary due to cascade settings
        AssessmentResponse.query.filter_by(assessment_id=assessment_id).delete()

        db.session.delete(assessment)
        db.session.commit()
        return jsonify({"message": "Assessment deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

