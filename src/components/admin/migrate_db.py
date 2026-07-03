import sqlite3

db_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\backend\stayhub.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE rooms ADD COLUMN price_seasonal REAL DEFAULT 0.0")
    conn.commit()
    print("Successfully added price_seasonal column to rooms table.")
except Exception as e:
    print(f"Skipped column addition or error: {e}")

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())

conn.close()
