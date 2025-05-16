import sqlite3

# Path to the correct database
DB_PATH = 'instance/dev.db'

conn = sqlite3.connect(DB_PATH)
try:
    conn.execute('ALTER TABLE assessment ADD COLUMN deploy_at DATETIME;')
    print('Column deploy_at added to assessment table in instance/dev.db.')
except Exception as e:
    print('Error:', e)
finally:
    conn.commit()
    conn.close() 