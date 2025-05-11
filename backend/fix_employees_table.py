import sqlite3

DB_PATH = 'instance/dev.db'

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# Helper to check if column exists
def column_exists(table, column):
    c.execute(f"PRAGMA table_info({table})")
    return any(col[1] == column for col in c.fetchall())

if not column_exists('employees', 'department'):
    c.execute("ALTER TABLE employees ADD COLUMN department VARCHAR(100)")
    print("Added 'department' column.")
else:
    print("'department' column already exists.")

if not column_exists('employees', 'source'):
    c.execute("ALTER TABLE employees ADD COLUMN source VARCHAR(50)")
    print("Added 'source' column.")
else:
    print("'source' column already exists.")

conn.commit()
conn.close()
print("Done.") 