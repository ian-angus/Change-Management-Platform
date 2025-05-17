from app import app
from models import Role
from extensions import db

with app.app_context():
    if not Role.query.filter_by(name='Change Manager').first():
        role = Role(name='Change Manager', description='Default Change Manager role')
        db.session.add(role)
        db.session.commit()
        print('Added Change Manager role.')
    else:
        print('Change Manager role already exists.') 