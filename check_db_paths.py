import os
from backend.config import Config
from alembic.config import Config as AlembicConfig

def check_database_paths():
    # Get Flask database path
    flask_db_path = Config.SQLALCHEMY_DATABASE_URI.replace('sqlite:///', '')
    flask_db_path = os.path.abspath(flask_db_path)
    
    # Get Alembic database path
    alembic_cfg = AlembicConfig('backend/alembic.ini')
    alembic_db_path = alembic_cfg.get_main_option('sqlalchemy.url').replace('sqlite:///', '')
    alembic_db_path = os.path.abspath(alembic_db_path)
    
    print("=== Database Path Check ===")
    print(f"Flask DB Path: {flask_db_path}")
    print(f"Alembic DB Path: {alembic_db_path}")
    print(f"Paths match: {flask_db_path == alembic_db_path}")
    
    # Check if files exist
    print("\n=== File Existence Check ===")
    print(f"Flask DB exists: {os.path.exists(flask_db_path)}")
    print(f"Alembic DB exists: {os.path.exists(alembic_db_path)}")

if __name__ == '__main__':
    check_database_paths() 