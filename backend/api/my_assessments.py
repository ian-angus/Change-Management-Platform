from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Assessment, Employee, GroupMember, Project, assessment_stakeholders, project_groups, Group
from datetime import datetime

my_assessments_bp = Blueprint('my_assessments_bp', __name__, url_prefix='/api')

@my_assessments_bp.route('/my-assessments', methods=['GET'])
@jwt_required()
def get_my_assessments():
    user_id = get_jwt_identity()
    now = datetime.utcnow()

    # Find all group IDs the user is a member of
    group_ids = [gm.group_id for gm in GroupMember.query.filter_by(employee_id=user_id).all()]

    # Find all project IDs where the user's group is assigned
    project_ids_from_groups = []
    if group_ids:
        project_ids_from_groups = [pg.project_id for pg in db.session.execute(project_groups.select().where(project_groups.c.group_id.in_(group_ids)))]

    # Find all assessments where:
    # - The user is a direct stakeholder
    # - OR the assessment's project is assigned to a group the user is in
    direct_assessments = db.session.query(Assessment).join(assessment_stakeholders).filter(assessment_stakeholders.c.employee_id == user_id)
    group_assessments = db.session.query(Assessment).filter(Assessment.project_id.in_(project_ids_from_groups))
    all_assessments = direct_assessments.union(group_assessments).all()

    # For each assessment, determine if the user has taken it (results exist for this user)
    result = []
    for a in all_assessments:
        taken = False
        if a.results and isinstance(a.results, dict):
            taken = str(user_id) in a.results
        elif a.results and isinstance(a.results, list):
            taken = any(str(user_id) == str(r.get('user_id')) for r in a.results)
        deploy_at = getattr(a, 'deploy_at', None)
        print(f"Assessment {a.id}: deploy_at={deploy_at}")
        is_locked = False
        if deploy_at:
            print(f"  now={now}, deploy_at={deploy_at}, now < deploy_at? {now < deploy_at}")
            is_locked = now < deploy_at
        else:
            print(f"  deploy_at is None, unlocked")
        result.append({
            'id': a.id,
            'title': a.assessment_type,
            'project_id': a.project_id,
            'status': 'taken' if taken else 'not_taken',
            'locked': is_locked,
            'deploy_at': deploy_at.isoformat() if deploy_at else None,
        })
    return jsonify({'assessments': result}) 