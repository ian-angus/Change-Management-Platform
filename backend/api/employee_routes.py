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
                role_name = row.get("Role") # Assuming role is given by name in spreadsheet

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
                
                employee_role = None
                if role_name and isinstance(role_name, str) and role_name.strip():
                    employee_role = Role.query.filter_by(name=role_name.strip()).first()
                    if not employee_role:
                        # Optionally create the role if it doesn't exist, or report error
                        # For MVP, let's assume roles must exist or are optional
                        errors.append(f"Row {index+2}: Role '{role_name}' not found. Employee will be added without this role.")
                        # If role is mandatory and not found, then: errors.append(...); skipped_count+=1; continue

                new_employee = Employee(
                    name=name,
                    email=email,
                    department=department if pd.notna(department) else None,
                    role_id=employee_role.id if employee_role else None,
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
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search_name = request.args.get("name")
    search_email = request.args.get("email")
    filter_department = request.args.get("department")
    filter_role_id = request.args.get("role_id", type=int) # Assuming role is filtered by ID

    query = Employee.query

    if search_name:
        query = query.filter(Employee.name.ilike(f"%{search_name}%"))
    if search_email:
        query = query.filter(Employee.email.ilike(f"%{search_email}%"))
    if filter_department:
        query = query.filter(Employee.department.ilike(f"%{filter_department}%"))
    if filter_role_id:
        query = query.filter(Employee.role_id == filter_role_id)
    
    query = query.order_by(Employee.created_at.desc())
    paginated_employees = query.paginate(page=page, per_page=per_page, error_out=False)
    
    employees_data = []
    for emp in paginated_employees.items:
        employees_data.append({
            "id": emp.id,
            "name": emp.name,
            "email": emp.email,
            "department": emp.department,
            "role_id": emp.role_id,
            "role_name": emp.role_info.name if emp.role_info else None, # Assuming role_info is the relationship name
            "date_added": emp.created_at.isoformat() if emp.created_at else None,
            "source": emp.source
        })

    return jsonify({
        "employees": employees_data,
        "total_pages": paginated_employees.pages,
        "current_page": paginated_employees.page,
        "total_items": paginated_employees.total
    })

@employee_bp.route("/employees", methods=["POST"])
def create_employee():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("email"):
        return jsonify({"error": "Employee name and email are required"}), 400

    if Employee.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    new_employee = Employee(
        name=data["name"],
        email=data["email"],
        department=data.get("department"),
        role_id=data.get("role_id"),
        source="manual",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.session.add(new_employee)
    db.session.commit()
    return jsonify({
        "id": new_employee.id,
        "name": new_employee.name,
        "email": new_employee.email,
        "department": new_employee.department,
        "role_id": new_employee.role_id,
        "role_name": new_employee.role_info.name if new_employee.role_info else None,
        "date_added": new_employee.created_at.isoformat(),
        "source": new_employee.source
    }), 201

@employee_bp.route("/employees/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    return jsonify({
        "id": employee.id,
        "name": employee.name,
        "email": employee.email,
        "department": employee.department,
        "role_id": employee.role_id,
        "role_name": employee.role_info.name if employee.role_info else None,
        "date_added": employee.created_at.isoformat() if employee.created_at else None,
        "date_updated": employee.updated_at.isoformat() if employee.updated_at else None,
        "source": employee.source
    })

@employee_bp.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
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
    employee.role_id = data.get("role_id", employee.role_id)
    employee.updated_at = datetime.datetime.utcnow()
    
    db.session.commit()
    return jsonify({
        "id": employee.id,
        "name": employee.name,
        "email": employee.email,
        "department": employee.department,
        "role_id": employee.role_id,
        "role_name": employee.role_info.name if employee.role_info else None,
        "date_updated": employee.updated_at.isoformat(),
        "source": employee.source
    })

@employee_bp.route("/employees/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    # MVP: Direct delete. Future: Check assignments.
    db.session.delete(employee)
    db.session.commit()
    return jsonify({"message": "Employee deleted successfully"}), 200


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

