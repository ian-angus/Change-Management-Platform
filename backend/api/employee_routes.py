from flask import Blueprint, request, jsonify, current_app
from models import db, Employee, Role # Assuming Role model is correctly defined in models.py
import pandas as pd
import os
from werkzeug.utils import secure_filename
import datetime

employee_bp = Blueprint("employee_bp", __name__)

ALLOWED_EXTENSIONS = {"csv", "xlsx"}

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Employee Routes ---

@employee_bp.route("/employees/upload", methods=["POST"])
def upload_employees():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # It's better to save to a temporary location or process in memory if possible
        # For simplicity here, let's assume a temporary upload folder if configured
        # In a real app, use a proper temporary file handling mechanism
        # filepath = os.path.join(current_app.config.get("UPLOAD_FOLDER", "./uploads"), filename)
        # file.save(filepath)

        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(file)
            elif filename.endswith(".xlsx"):
                df = pd.read_excel(file)
            else:
                return jsonify({"error": "Invalid file type"}), 400

            required_columns = ["Name", "Email Address"]
            for col in required_columns:
                if col not in df.columns:
                    return jsonify({"error": f"Missing required column: {col}"}), 400

            imported_count = 0
            skipped_count = 0
            errors = []

            for index, row in df.iterrows():
                name = row.get("Name")
                email = row.get("Email Address")
                department = row.get("Department")
                job_position = row.get("Job Position")

                if not name or not email:
                    errors.append(f"Row {index+2}: Name and Email are required.")
                    skipped_count += 1
                    continue
                
                # Basic email format validation (can be more robust)
                if "@" not in email or "." not in email.split("@")[-1]:
                    errors.append(f"Row {index+2}: Invalid email format for {email}.")
                    skipped_count +=1
                    continue

                if Employee.query.filter_by(email=email).first():
                    errors.append(f"Row {index+2}: Email {email} already exists.")
                    skipped_count += 1
                    continue
                
                new_employee = Employee(
                    name=name,
                    email=email,
                    department=department if pd.notna(department) else None,
                    job_position=job_position if pd.notna(job_position) else None,
                    source="spreadsheet",
                    created_at=datetime.datetime.utcnow(),
                    updated_at=datetime.datetime.utcnow()
                )
                db.session.add(new_employee)
                imported_count += 1
            
            db.session.commit()
            # os.remove(filepath) # Clean up uploaded file if saved

            return jsonify({
                "message": "Employee data processed.",
                "imported_count": imported_count,
                "skipped_count": skipped_count,
                "errors": errors
            }), 200

        except Exception as e:
            db.session.rollback()
            # if os.path.exists(filepath): os.remove(filepath)
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500
    else:
        return jsonify({"error": "File type not allowed"}), 400

@employee_bp.route("/employees", methods=["GET"])
def get_employees():
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search_name = request.args.get("name")
        search_email = request.args.get("email")
        filter_department = request.args.get("department")
        filter_job_position = request.args.get("job_position")

        query = Employee.query

        if search_name:
            query = query.filter(Employee.name.ilike(f"%{search_name}%"))
        if search_email:
            query = query.filter(Employee.email.ilike(f"%{search_email}%"))
        if filter_department:
            query = query.filter(Employee.department.ilike(f"%{filter_department}%"))
        if filter_job_position:
            query = query.filter(Employee.job_position.ilike(f"%{filter_job_position}%"))
        
        query = query.order_by(Employee.created_at.desc())
        paginated_employees = query.paginate(page=page, per_page=per_page, error_out=False)
        
        employees_data = [emp.to_dict() for emp in paginated_employees.items]

        return jsonify({
            "employees": employees_data,
            "total_pages": paginated_employees.pages,
            "current_page": paginated_employees.page,
            "total_items": paginated_employees.total
        })
    except Exception as e:
        print(f"Error fetching employees: {str(e)}")
        return jsonify({"error": "An error occurred while fetching employees"}), 500

@employee_bp.route("/employees", methods=["POST"])
def create_employee():
    try:
        data = request.get_json()
        if not data or not data.get("name") or not data.get("email"):
            return jsonify({"error": "Employee name and email are required"}), 400

        if Employee.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email already exists"}), 400

        new_employee = Employee(
            name=data["name"],
            email=data["email"],
            department=data.get("department"),
            job_position=data.get("job_position"),
            source="manual",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.session.add(new_employee)
        db.session.commit()
        return jsonify(new_employee.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating employee: {str(e)}")
        return jsonify({"error": "An error occurred while creating the employee"}), 500

@employee_bp.route("/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        return jsonify(employee.to_dict())
    except Exception as e:
        print(f"Error fetching employee {employee_id}: {str(e)}")
        return jsonify({"error": "An error occurred while fetching the employee"}), 500

@employee_bp.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Check for email uniqueness if email is being changed
        if "email" in data and data["email"] != employee.email:
            if Employee.query.filter(Employee.id != employee_id, Employee.email == data["email"]).first():
                return jsonify({"error": "Email already exists"}), 400
            employee.email = data["email"]

        employee.name = data.get("name", employee.name)
        employee.department = data.get("department", employee.department)
        employee.job_position = data.get("job_position", employee.job_position)
        employee.updated_at = datetime.datetime.utcnow()
        
        db.session.commit()
        return jsonify(employee.to_dict())
    except Exception as e:
        db.session.rollback()
        print(f"Error updating employee {employee_id}: {str(e)}")
        return jsonify({"error": "An error occurred while updating the employee"}), 500

@employee_bp.route("/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Employee deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting employee {employee_id}: {str(e)}")
        return jsonify({"error": "An error occurred while deleting the employee"}), 500


# --- Role Routes (Keep existing or adapt as needed) ---
# Assuming these are mostly fine for now, but ensure they align with frontend needs.

@employee_bp.route("/roles", methods=["GET"])
def get_roles():
    roles = Role.query.all()
    return jsonify([{
        "id": role.id,
        "name": role.name,
        "description": role.description
    } for role in roles])

@employee_bp.route("/roles", methods=["POST"])
def create_role():
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Role name is required"}), 400

    if Role.query.filter_by(name=data["name"]).first():
        return jsonify({"error": "Role name already exists"}), 400

    new_role = Role(
        name=data["name"],
        description=data.get("description")
    )
    db.session.add(new_role)
    db.session.commit()
    return jsonify({
        "id": new_role.id,
        "name": new_role.name,
        "description": new_role.description
    }), 201

# Consider adding GET by ID, PUT, DELETE for individual roles if frontend needs it for management.

