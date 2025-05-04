# /home/ubuntu/melyn_cm_platform/backend/api/employee_routes.py

from flask import Blueprint, request, jsonify
from extensions import db # Import db from extensions
from models import Employee
import pandas as pd
import io

employee_bp = Blueprint("employee_bp", __name__)

ALLOWED_EXTENSIONS = {"xlsx", "csv"}
REQUIRED_COLUMNS = ["Name", "Email address", "Department", "Role"]

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@employee_bp.route("/upload", methods=["POST"])
def upload_employees():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        try:
            filename = file.filename
            file_extension = filename.rsplit(".", 1)[1].lower()
            # Use BytesIO for pandas compatibility with file streams
            file_stream = io.BytesIO(file.read())

            if file_extension == "xlsx":
                # Corrected syntax: remove unnecessary backslashes
                df = pd.read_excel(file_stream, engine="openpyxl")
            elif file_extension == "csv":
                # Try detecting separator, default to comma
                try:
                    # Corrected syntax: remove unnecessary backslashes
                    # Use sep=None for auto-detection with python engine
                    df = pd.read_csv(file_stream, sep=None, engine="python")
                except Exception as e:
                     # Fallback to comma if auto-detect fails
                     file_stream.seek(0) # Reset stream position for re-reading
                     df = pd.read_csv(file_stream, sep=",")
            else:
                 return jsonify({"error": "Invalid file type"}), 400

            # --- Data Validation ---
            # Normalize column names (lowercase, strip whitespace)
            df.columns = df.columns.str.lower().str.strip()
            required_columns_lower = [col.lower() for col in REQUIRED_COLUMNS]

            missing_cols = [col for col in required_columns_lower if col not in df.columns]
            if missing_cols:
                # Corrected f-string syntax
                return jsonify({"error": f"Missing required columns: {'; '.join(missing_cols)}"}), 400

            errors = []
            processed_count = 0
            created_count = 0
            updated_count = 0

            # Use a transaction for bulk operations
            # Removed nested transaction as commit/rollback is handled below
            for index, row in df.iterrows():
                email = row.get("email address")
                name = row.get("name")
                department = row.get("department")
                role = row.get("role")

                # Basic validation
                if not email or not isinstance(email, str) or "@" not in email:
                    errors.append(f"Row {index + 2}: Invalid or missing email address.")
                    continue
                if not name or not isinstance(name, str):
                    errors.append(f"Row {index + 2}: Invalid or missing name.")
                    continue
                # Department and Role are optional strings, handle NaN/None from pandas
                department = str(department) if pd.notna(department) else None
                role = str(role) if pd.notna(role) else None

                # Check if employee exists
                existing_employee = Employee.query.filter_by(email=email).first()

                if existing_employee:
                    # Update existing employee
                    existing_employee.name = name
                    existing_employee.department = department
                    existing_employee.role = role
                    updated_count += 1
                else:
                    # Create new employee
                    new_employee = Employee(
                        name=name,
                        email=email,
                        department=department,
                        role=role
                    )
                    db.session.add(new_employee)
                    created_count += 1
                
                processed_count += 1

            if errors:
                 # If errors occurred, rollback the session
                 db.session.rollback()
                 return jsonify({"error": "Validation errors occurred during processing", "details": errors}), 400
            else:
                # If no errors, commit the session
                db.session.commit()
                return jsonify({
                    "message": f"Successfully processed {processed_count} records.",
                    "created": created_count,
                    "updated": updated_count
                }), 200

        except Exception as e:
            db.session.rollback() # Rollback main session on unexpected errors
            return jsonify({"error": f"An error occurred during file processing: {str(e)}"}), 500
    else:
        return jsonify({"error": "File type not allowed"}), 400

# --- NEW: GET, PUT, DELETE Endpoints ---

@employee_bp.route("/", methods=["GET"])
def get_employees():
    """Get a list of all employees."""
    try:
        employees = Employee.query.order_by(Employee.name).all()
        return jsonify([employee.to_dict() for employee in employees]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve employees: {str(e)}"}), 500

@employee_bp.route("/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    """Update an existing employee."""
    employee = Employee.query.get_or_404(employee_id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Validate required fields
    if "name" not in data or not data["name"]:
        return jsonify({"error": "Name is required"}), 400
    if "email" not in data or not data["email"] or "@" not in data["email"]:
        return jsonify({"error": "Valid email is required"}), 400

    # Check if email is being changed and if it conflicts with another user
    if data["email"] != employee.email:
        existing_employee = Employee.query.filter(Employee.email == data["email"], Employee.id != employee_id).first()
        if existing_employee:
            return jsonify({"error": "Email address already in use by another employee"}), 409 # 409 Conflict

    try:
        employee.name = data["name"]
        employee.email = data["email"]
        employee.department = data.get("department") # Optional
        employee.role = data.get("role") # Optional
        db.session.commit()
        return jsonify(employee.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update employee: {str(e)}"}), 500

@employee_bp.route("/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    """Delete an employee."""
    employee = Employee.query.get_or_404(employee_id)
    try:
        db.session.delete(employee)
        db.session.commit()
        # Use f-string correctly
        return jsonify({"message": f"Employee \"{employee.name}\" deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        # Check for potential foreign key constraints if Employee is linked elsewhere
        # For now, assume simple deletion
        return jsonify({"error": f"Failed to delete employee: {str(e)}"}), 500

