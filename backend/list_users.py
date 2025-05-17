from app import app
from models import UserAuth, Employee

with app.app_context():
    user_auths = UserAuth.query.all()
    print(f"Found {len(user_auths)} user auth records:")
    for ua in user_auths:
        emp = Employee.query.get(ua.employee_id)
        print(f"UserAuth ID: {ua.id}, Email: {ua.email}, Employee Name: {emp.name if emp else 'N/A'}") 