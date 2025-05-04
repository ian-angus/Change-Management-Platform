from flask import Blueprint, request, jsonify
from models import db, Assessment, Project, AssessmentTemplate, Employee, AssessmentResult

assessment_bp = Blueprint("assessment_bp", __name__)

@assessment_bp.route("/assessments", methods=["GET"])
def get_assessments():
    project_id = request.args.get("project_id")
    query = Assessment.query
    if project_id:
        query = query.filter_by(project_id=project_id)
    assessments = query.all()
    return jsonify([{
        "id": a.id,
        "name": a.name,
        "project_id": a.project_id,
        "template_id": a.template_id,
        "status": a.status,
        "deployment_date": a.deployment_date.isoformat() if a.deployment_date else None,
        "completion_date": a.completion_date.isoformat() if a.completion_date else None,
        "project_name": a.project.name if a.project else None, # Include project name
        "template_name": a.template.name if a.template else None # Include template name
    } for a in assessments])

@assessment_bp.route("/assessments", methods=["POST"])
def create_assessment():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("project_id") or not data.get("template_id"):
        return jsonify({"error": "Assessment name, project_id, and template_id are required"}), 400

    # Verify project and template exist
    project = Project.query.get(data["project_id"])
    if not project:
        return jsonify({"error": "Project not found"}), 404
    template = AssessmentTemplate.query.get(data["template_id"])
    if not template:
        return jsonify({"error": "Assessment Template not found"}), 404

    new_assessment = Assessment(
        name=data["name"],
        project_id=data["project_id"],
        template_id=data["template_id"],
        status=data.get("status", "Not Started")
    )
    db.session.add(new_assessment)
    db.session.commit()
    return jsonify({
        "id": new_assessment.id,
        "name": new_assessment.name,
        "project_id": new_assessment.project_id,
        "template_id": new_assessment.template_id,
        "status": new_assessment.status
    }), 201

@assessment_bp.route("/assessments/<int:assessment_id>", methods=["GET"])
def get_assessment(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    return jsonify({
        "id": assessment.id,
        "name": assessment.name,
        "project_id": assessment.project_id,
        "template_id": assessment.template_id,
        "status": assessment.status,
        "deployment_date": assessment.deployment_date.isoformat() if assessment.deployment_date else None,
        "completion_date": assessment.completion_date.isoformat() if assessment.completion_date else None,
        "project_name": assessment.project.name if assessment.project else None,
        "template_name": assessment.template.name if assessment.template else None
    })

@assessment_bp.route("/assessments/<int:assessment_id>", methods=["PUT"])
def update_assessment(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    data = request.get_json()

    if "name" in data:
        assessment.name = data["name"]
    if "status" in data:
        assessment.status = data["status"]
        # Potentially update deployment/completion dates based on status
        # if data["status"] == "Deployed" and not assessment.deployment_date:
        #     assessment.deployment_date = datetime.datetime.utcnow()
        # elif data["status"] == "Completed" and not assessment.completion_date:
        #     assessment.completion_date = datetime.datetime.utcnow()

    db.session.commit()
    return jsonify({"message": "Assessment updated successfully"})

# --- Assessment Results --- #

@assessment_bp.route("/assessments/<int:assessment_id>/results", methods=["GET"])
def get_assessment_results(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    results = assessment.results.all()
    return jsonify([{
        "result_id": r.id,
        "employee_id": r.employee_id,
        "employee_name": r.employee.name if r.employee else None,
        "submission_date": r.submission_date.isoformat() if r.submission_date else None,
        "answers": r.answers
    } for r in results])

@assessment_bp.route("/assessments/<int:assessment_id>/results", methods=["POST"])
def submit_assessment_result(assessment_id):
    assessment = Assessment.query.get_or_404(assessment_id)
    data = request.get_json()
    if not data or not data.get("employee_id") or not data.get("answers"):
        return jsonify({"error": "employee_id and answers are required"}), 400

    employee = Employee.query.get(data["employee_id"])
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Check if result already submitted by this employee for this assessment
    existing_result = AssessmentResult.query.filter_by(
        assessment_id=assessment_id,
        employee_id=data["employee_id"]
    ).first()
    if existing_result:
        return jsonify({"error": "Result already submitted by this employee"}), 409

    new_result = AssessmentResult(
        assessment_id=assessment_id,
        employee_id=data["employee_id"],
        answers=data["answers"]
    )
    db.session.add(new_result)
    db.session.commit()
    return jsonify({"message": "Assessment result submitted successfully", "result_id": new_result.id}), 201

# Add routes for deploying assessment to specific employees if needed

