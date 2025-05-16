import sqlite3

conn = sqlite3.connect('backend/instance/dev.db')
try:
    conn.execute('ALTER TABLE assessment ADD COLUMN deploy_at DATETIME;')
    print('Column deploy_at added to assessment table.')
except Exception as e:
    print('Error:', e)
finally:
    conn.commit()
    conn.close() 