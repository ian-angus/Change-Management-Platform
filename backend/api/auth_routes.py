from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from models import Employee, UserAuth, PasswordResetToken
from extensions import db
import logging
import secrets
from datetime import datetime, timedelta
from utils.email_sender import send_password_reset_email
import os
import traceback

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(f"[DEBUG] Registration data: {data}")
    required_fields = ['name', 'email', 'password', 'organization', 'role']
    for field in required_fields:
        if not data.get(field):
            print(f"[DEBUG] Missing required field: {field}")
            return jsonify({'error': f'{field} is required.'}), 400

    # Check if email already exists in UserAuth
    if UserAuth.query.filter_by(email=data['email']).first():
        print(f"[DEBUG] Email already registered: {data['email']}")
        return jsonify({'error': 'Email already registered.'}), 400

    # Create Employee profile
    try:
        print("[DEBUG] Creating Employee...")
        new_employee = Employee(
            name=data['name'],
            email=data['email'],
            job_position=data['role'],
            department=data.get('organization')
        )
        db.session.add(new_employee)
        db.session.flush()  # Get new_employee.id before commit
        print(f"[DEBUG] Employee created with id: {new_employee.id}")
        # Create UserAuth
        print("[DEBUG] Creating UserAuth...")
        new_auth = UserAuth(
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            employee_id=new_employee.id
        )
        db.session.add(new_auth)
        db.session.commit()
        print("[DEBUG] Registration commit successful.")
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
        print(f"[ERROR] Registration failed: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to register user.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"[DEBUG] Login attempt for email: {data.get('email')}")
    if not data or not data.get('email') or not data.get('password'):
        print("[DEBUG] Missing email or password in request.")
        return jsonify({'error': 'Email and password are required.'}), 400
    try:
        user_auth = UserAuth.query.filter_by(email=data['email']).first()
        if not user_auth:
            print("[DEBUG] User not found for email.")
        else:
            print(f"[DEBUG] User found: {user_auth.email}, employee_id: {user_auth.employee_id}")
            pw_check = check_password_hash(user_auth.password_hash, data['password'])
            print(f"[DEBUG] Password check: {pw_check}")
        if not user_auth or not check_password_hash(user_auth.password_hash, data['password']):
            print("[DEBUG] Invalid email or password.")
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
        print(f"[DEBUG] Login successful for {employee.email}")
        return jsonify({'access_token': access_token, 'user': user_info}), 200
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Failed to login.'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    if not data or not data.get('email'):
        return jsonify({'error': 'Email is required.'}), 400
    
    user_auth = UserAuth.query.filter_by(email=data['email']).first()
    if not user_auth:
        # For security reasons, we don't want to reveal if an email exists or not
        return jsonify({'message': 'If your email is registered, you will receive password reset instructions.'}), 200
    
    # Generate a secure token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Create reset token record
    reset_token = PasswordResetToken(
        token=token,
        user_id=user_auth.id,
        expires_at=expires_at
    )
    
    try:
        db.session.add(reset_token)
        db.session.commit()
        
        # Generate reset link
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        # Send the reset link by email
        send_password_reset_email(user_auth.email, reset_link)
        
        # Only return a generic message
        return jsonify({'message': 'If your email is registered, you will receive password reset instructions.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to process password reset request.'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    if not data or not data.get('token') or not data.get('password'):
        return jsonify({'error': 'Token and new password are required.'}), 400
    
    # Find the token
    reset_token = PasswordResetToken.query.filter_by(
        token=data['token'],
        used=False
    ).first()
    
    if not reset_token:
        return jsonify({'error': 'Invalid or expired reset token.'}), 400
    
    # Check if token is expired
    if datetime.utcnow() > reset_token.expires_at:
        return jsonify({'error': 'Reset token has expired.'}), 400
    
    # Update password
    try:
        reset_token.user.password_hash = generate_password_hash(data['password'])
        reset_token.used = True
        db.session.commit()
        return jsonify({'message': 'Password has been reset successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reset password.'}), 500

@auth_bp.route('/validate-reset-token', methods=['POST'])
def validate_reset_token():
    data = request.get_json()
    if not data or not data.get('token'):
        return jsonify({'error': 'Token is required.'}), 400
    
    reset_token = PasswordResetToken.query.filter_by(
        token=data['token'],
        used=False
    ).first()
    
    if not reset_token:
        return jsonify({'valid': False, 'message': 'Invalid or expired reset token.'})
    
    if datetime.utcnow() > reset_token.expires_at:
        return jsonify({'valid': False, 'message': 'Reset token has expired.'})
    
    return jsonify({'valid': True, 'message': 'Token is valid.'}) 