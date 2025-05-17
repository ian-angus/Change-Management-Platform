from app import app
from models import Employee
from extensions import db

EMAIL = 'ian.a.n.thomson@gmail.com'

with app.app_context():
    emp = Employee.query.filter_by(email=EMAIL).first()
    if emp:
        db.session.delete(emp)
        db.session.commit()
        print(f"Deleted employee with email: {EMAIL}")
    else:
        print(f"No employee found with email: {EMAIL}") 