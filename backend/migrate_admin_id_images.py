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
    
    new_cols = {
        'admin_id': 'VARCHAR(100)',
        'images': 'TEXT'
    }
    
    for col_name, col_type in new_cols.items():
        if col_name not in columns:
            try:
                alter_query = f"ALTER TABLE properties ADD COLUMN {col_name} {col_type};"
                cursor.execute(alter_query)
                print(f"Added column {col_name} to properties table.")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists in properties table.")
            
    conn.commit()
    conn.close()
    print("Migration completed successfully.")
else:
    print("Database file stayhub.db not found.")
