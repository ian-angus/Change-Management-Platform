from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from models import Employee, UserAuth
from extensions import db
import logging

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['name', 'email', 'password', 'organization', 'role']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required.'}), 400

    # Check if email already exists in UserAuth
    if UserAuth.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered.'}), 400

    # Create Employee profile
    new_employee = Employee(
        name=data['name'],
        email=data['email'],
        job_position=data['role'],
        department=data.get('organization')
    )
    try:
        db.session.add(new_employee)
        db.session.flush()  # Get new_employee.id before commit
        # Create UserAuth
        new_auth = UserAuth(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            employee_id=new_employee.id
        )
        db.session.add(new_auth)
        db.session.commit()
        access_token = create_access_token(identity=str(new_employee.id))
        user_info = {
            'id': new_employee.id,
            'name': new_employee.name,
            'email': new_employee.email,
            'job_position': new_employee.job_position,
            'department': new_employee.department
        }
        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'user': user_info
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to register user.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required.'}), 400
    user_auth = UserAuth.query.filter_by(email=data['email']).first()
    if not user_auth or not check_password_hash(user_auth.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password.'}), 401
    employee = user_auth.employee
    access_token = create_access_token(identity=str(employee.id))
    user_info = {
        'id': employee.id,
        'name': employee.name,
        'email': employee.email,
        'job_position': employee.job_position,
        'department': employee.department
    }
    return jsonify({'access_token': access_token, 'user': user_info}), 200 