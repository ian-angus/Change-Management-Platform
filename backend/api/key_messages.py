from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, KeyMessage, KeyMessageHistory, Employee, Project
from datetime import datetime
import os

key_messages_bp = Blueprint('key_messages', __name__)

@key_messages_bp.route('/api/key-messages', methods=['POST'])
@jwt_required()
def create_key_message():
    import os
    db_uri = str(db.engine.url)
    abs_path = db_uri.replace('sqlite:///', '')
    abs_path = os.path.abspath(abs_path)
    print(f"[DEBUG] Creating key message in database: {abs_path}")
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    # Validate required fields
    required_fields = ['title', 'supporting_statement', 'tone_purpose', 'stage_tag', 'project_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create new key message
    key_message = KeyMessage(
        title=data['title'],
        supporting_statement=data['supporting_statement'],
        tone_purpose=data['tone_purpose'],
        stage_tag=data['stage_tag'],
        status='Draft',
        created_by_id=current_user_id,
        project_id=data['project_id']
    )
    
    db.session.add(key_message)
    db.session.commit()
    
    # Create initial history record
    history = KeyMessageHistory(
        key_message_id=key_message.id,
        title=key_message.title,
        supporting_statement=key_message.supporting_statement,
        tone_purpose=key_message.tone_purpose,
        stage_tag=key_message.stage_tag,
        status=key_message.status,
        version=key_message.version,
        changed_by_id=current_user_id
    )
    
    db.session.add(history)
    db.session.commit()
    
    return jsonify(key_message.to_dict()), 201

@key_messages_bp.route('/api/key-messages/<int:message_id>', methods=['PUT'])
@jwt_required()
def update_key_message(message_id):
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    key_message = KeyMessage.query.get_or_404(message_id)
    
    # Update fields
    if 'title' in data:
        key_message.title = data['title']
    if 'supporting_statement' in data:
        key_message.supporting_statement = data['supporting_statement']
    if 'tone_purpose' in data:
        key_message.tone_purpose = data['tone_purpose']
    if 'stage_tag' in data:
        key_message.stage_tag = data['stage_tag']
    if 'status' in data:
        key_message.status = data['status']
    
    key_message.version += 1
    key_message.updated_at = datetime.utcnow()
    
    # Create history record
    history = KeyMessageHistory(
        key_message_id=key_message.id,
        title=key_message.title,
        supporting_statement=key_message.supporting_statement,
        tone_purpose=key_message.tone_purpose,
        stage_tag=key_message.stage_tag,
        status=key_message.status,
        version=key_message.version,
        changed_by_id=current_user_id
    )
    
    db.session.add(history)
    db.session.commit()
    
    return jsonify(key_message.to_dict())

@key_messages_bp.route('/api/key-messages/<int:message_id>', methods=['GET'])
@jwt_required()
def get_key_message(message_id):
    key_message = KeyMessage.query.get_or_404(message_id)
    return jsonify(key_message.to_dict())

@key_messages_bp.route('/api/key-messages', methods=['GET'])
@jwt_required()
def get_key_messages():
    project_id = request.args.get('project_id')
    status = request.args.get('status')
    stage_tag = request.args.get('stage_tag')
    print(f"[DEBUG] GET /api/key-messages params: project_id={project_id}, status={status}, stage_tag={stage_tag}")
    query = KeyMessage.query
    if project_id and project_id not in ('All', '*', ''):
        print(f"[DEBUG] Filtering by project_id={project_id}")
        query = query.filter_by(project_id=project_id)
    if status and status not in ('All', '*', ''):
        print(f"[DEBUG] Filtering by status={status}")
        query = query.filter_by(status=status)
    if stage_tag and stage_tag not in ('All', '*', ''):
        print(f"[DEBUG] Filtering by stage_tag={stage_tag}")
        query = query.filter_by(stage_tag=stage_tag)
    try:
        key_messages = query.order_by(KeyMessage.created_at.desc()).all()
        print(f"[DEBUG] Found {len(key_messages)} key messages")
        return jsonify([msg.to_dict() for msg in key_messages])
    except Exception as e:
        import traceback
        print(f"[ERROR] Exception in get_key_messages: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@key_messages_bp.route('/api/key-messages/<int:message_id>/history', methods=['GET'])
@jwt_required()
def get_key_message_history(message_id):
    history = KeyMessageHistory.query.filter_by(key_message_id=message_id).order_by(KeyMessageHistory.version.desc()).all()
    return jsonify([record.to_dict() for record in history])

@key_messages_bp.route('/api/key-messages/<int:message_id>/approve', methods=['POST'])
@jwt_required()
def approve_key_message(message_id):
    current_user_id = get_jwt_identity()
    key_message = KeyMessage.query.get_or_404(message_id)
    
    key_message.status = 'Approved'
    key_message.version += 1
    
    # Create history record for approval
    history = KeyMessageHistory(
        key_message_id=key_message.id,
        title=key_message.title,
        supporting_statement=key_message.supporting_statement,
        tone_purpose=key_message.tone_purpose,
        stage_tag=key_message.stage_tag,
        status=key_message.status,
        version=key_message.version,
        changed_by_id=current_user_id
    )
    
    db.session.add(history)
    db.session.commit()
    
    return jsonify(key_message.to_dict())

@key_messages_bp.route('/api/key-messages/<int:message_id>/archive', methods=['POST'])
@jwt_required()
def archive_key_message(message_id):
    current_user_id = get_jwt_identity()
    key_message = KeyMessage.query.get_or_404(message_id)
    
    key_message.status = 'Archived'
    key_message.version += 1
    
    # Create history record for archiving
    history = KeyMessageHistory(
        key_message_id=key_message.id,
        title=key_message.title,
        supporting_statement=key_message.supporting_statement,
        tone_purpose=key_message.tone_purpose,
        stage_tag=key_message.stage_tag,
        status=key_message.status,
        version=key_message.version,
        changed_by_id=current_user_id
    )
    
    db.session.add(history)
    db.session.commit()
    
    return jsonify(key_message.to_dict()) 