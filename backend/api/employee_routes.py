from flask import Blueprint, request, jsonify
from extensions import db
from models import Employee
import pandas as pd
import io

employee_bp = Blueprint("employee_bp", __name__, url_prefix="/api/employees")

@employee_bp.route("/", methods=["GET"])
def get_employees():
    """Get a list of all employees."""
    try:
        employees = Employee.query.order_by(Employee.name).all()
        employee_list = [emp.to_dict() for emp in employees]
        return jsonify(employee_list)
    except Exception as e:
        print(f"Error fetching employees: {e}")
        return jsonify({"error": "An error occurred while fetching employees."}), 500

@employee_bp.route("/<int:employee_id>", methods=["GET"])
def get_employee(employee_id):
    """Get details for a single employee."""
    try:
        employee = Employee.query.get_or_404(employee_id)
        return jsonify(employee.to_dict())
    except Exception as e:
        print(f"Error fetching employee {employee_id}: {e}")
        return jsonify({"error": "An error occurred while fetching employee details."}), 500

@employee_bp.route("/", methods=["POST"])
def create_employee():
    """Create a new employee."""
    data = request.get_json()
    required_fields = ["name", "email"]
    if not data or not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        # Fix: Evaluate join outside f-string
        missing_fields_str = ", ".join(missing)
        return jsonify({"error": f"Missing required fields: {missing_fields_str}"}), 400

    if Employee.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email address already exists."}), 409

    try:
        new_employee = Employee(
            name=data["name"],
            email=data["email"],
            job_position=data.get("job_position"),
            department=data.get("department")
        )
        db.session.add(new_employee)
        db.session.commit()
        return jsonify({
            "message": "Employee created successfully",
            "employee": new_employee.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating employee: {e}")
        return jsonify({"error": "An error occurred while creating the employee."}), 500

@employee_bp.route("/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):
    """Update an existing employee."""
    employee = Employee.query.get_or_404(employee_id)
    data = request.get_json()
    if not data:
        return jsonify({"error": "No update data provided"}), 400

    try:
        if "email" in data and data["email"] != employee.email:
            if Employee.query.filter(Employee.id != employee_id, Employee.email == data["email"]).first():
                return jsonify({"error": "Email address already exists."}), 409
            employee.email = data["email"]

        if "name" in data: employee.name = data["name"]
        if "job_position" in data: employee.job_position = data["job_position"]
        if "department" in data: employee.department = data["department"]

        db.session.commit()
        return jsonify({
            "message": "Employee updated successfully",
            "employee": employee.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error updating employee {employee_id}: {e}")
        return jsonify({"error": "An error occurred while updating the employee."}), 500

@employee_bp.route("/<int:employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    """Delete an employee."""
    try:
        employee = Employee.query.get_or_404(employee_id)
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": f"Employee ID {employee_id} deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting employee {employee_id}: {e}")
        return jsonify({"error": "An error occurred while deleting the employee."}), 500

# --- Bulk Upload --- 
@employee_bp.route("/upload", methods=["POST"])
def upload_employees():
    """Handles bulk upload of employees from CSV or Excel file."""
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected for uploading"}), 400

    if file:
        try:
            if file.filename.endswith(".csv"):
                df = pd.read_csv(io.StringIO(file.stream.read().decode("UTF8")))
            elif file.filename.endswith( (".xls", ".xlsx") ):
                df = pd.read_excel(io.BytesIO(file.stream.read()))
            else:
                return jsonify({"error": "Unsupported file type. Please upload CSV or Excel."}), 400

            df.columns = df.columns.str.lower().str.replace(" ", "_")

            required_columns = {"name", "email"}
            optional_columns = {"department", "job_position"}
            actual_columns = set(df.columns)

            if not required_columns.issubset(actual_columns):
                missing = required_columns - actual_columns
                missing_fields_str = ", ".join(missing) # Fix: Evaluate join outside f-string
                return jsonify({"error": f"Missing required columns in file: {missing_fields_str}"}), 400

            processed_count = 0
            skipped_count = 0
            error_list = []

            existing_emails = {emp.email for emp in Employee.query.with_entities(Employee.email).all()}

            for index, row in df.iterrows():
                name = row.get("name")
                email = row.get("email")
                department = row.get("department")
                job_position = row.get("job_position")

                if not name or not email:
                    error_list.append(f"Row {index + 2}: Missing name or email.")
                    skipped_count += 1
                    continue
                
                department = str(department) if pd.notna(department) else None
                job_position = str(job_position) if pd.notna(job_position) else None
                name = str(name) if pd.notna(name) else None
                email = str(email) if pd.notna(email) else None

                if not name or not email:
                    error_list.append(f"Row {index + 2}: Invalid name or email after conversion.")
                    skipped_count += 1
                    continue

                if email in existing_emails:
                    error_list.append(f"Row {index + 2}: Email \t{email}\t already exists. Skipping.")
                    skipped_count += 1
                    continue
                
                try:
                    new_employee = Employee(
                        name=name,
                        email=email,
                        department=department,
                        job_position=job_position
                    )
                    db.session.add(new_employee)
                    existing_emails.add(email)
                    processed_count += 1
                except Exception as e:
                    db.session.rollback()
                    error_list.append(f"Row {index + 2}: Error adding employee {email} - {e}")
                    skipped_count += 1
                    continue
            
            db.session.commit()

            return jsonify({
                "message": f"Bulk upload processed. Added: {processed_count}, Skipped/Errors: {skipped_count}",
                "processed_count": processed_count,
                "skipped_count": skipped_count,
                "errors": error_list
            }), 200

        except Exception as e:
            db.session.rollback()
            print(f"Error processing bulk upload: {e}")
            return jsonify({"error": f"An error occurred during file processing: {e}"}), 500

    return jsonify({"error": "An unexpected error occurred"}), 500

