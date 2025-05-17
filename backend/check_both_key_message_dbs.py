import glob
from flask import Flask
from extensions import db
from models import KeyMessage
import os

def check_db(db_path):
    db_uri = f'sqlite:///{db_path}'
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    print(f"\n{db_path}")
    with app.app_context():
        try:
            messages = KeyMessage.query.all()
            print(f"  Found {len(messages)} key messages.")
            for msg in messages:
                print(f"  - {msg.id}: {msg.title} (Project ID: {msg.project_id})")
        except Exception as e:
            print(f"  Error - {e}")

if __name__ == "__main__":
    # Find all dev.db files in the project
    for db_path in glob.glob('../../**/dev.db', recursive=True):
        abs_path = os.path.abspath(db_path)
        check_db(abs_path)
    # Also check the two known locations
    check_db(os.path.abspath('../instance/dev.db'))
    check_db(os.path.abspath('instance/dev.db')) 