import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'stayhub.db')
print("Database path:", db_path)

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get existing columns in properties table
    cursor.execute("PRAGMA table_info(properties)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'status' not in columns:
        try:
            alter_query = "ALTER TABLE properties ADD COLUMN status VARCHAR(50) DEFAULT 'Active';"
            cursor.execute(alter_query)
            print("Added column status to properties table.")
        except Exception as e:
            print(f"Error adding status column: {e}")
    else:
        print("Column status already exists in properties table.")
            
    conn.commit()
    conn.close()
    print("Migration completed successfully.")
else:
    print("Database file stayhub.db not found.")
