import sqlite3
import json
import os

db_path = os.path.join(os.path.dirname(__file__), "stayhub.db")
print(f"Connecting to database at {db_path}...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Add amenities column if not exists
cursor.execute("PRAGMA table_info(properties)")
columns = [col[1] for col in cursor.fetchall()]

if "amenities" not in columns:
    print("Adding 'amenities' column to 'properties' table...")
    cursor.execute("ALTER TABLE properties ADD COLUMN amenities TEXT")
else:
    print("'amenities' column already exists.")

if "rules" not in columns:
    print("Adding 'rules' column to 'properties' table...")
    cursor.execute("ALTER TABLE properties ADD COLUMN rules TEXT")
else:
    print("'rules' column already exists.")

# 2. Update existing properties with default values
default_data = {
    "prop-1": {
        "amenities": ["Wi-Fi", "Daily Cleaning", "Geyser", "Washing Machine", "Smart TV", "A/C", "GYM Access", "Elevator", "24/7 Security"],
        "rules": ["No loud music after 10 PM", "No smoking inside rooms", "Visitors allowed 9 AM - 8 PM only", "Gate closes at 11:30 PM"]
    },
    "prop-2": {
        "amenities": ["Free Wi-Fi", "Valet Parking", "Swimming Pool", "Room Service", "Mini Bar", "A/C", "Complimentary Breakfast", "Bath Tub"],
        "rules": ["Valid ID mandatory during entry", "Checkout time is 11 AM", "Pets not allowed", "Quiet hours 11 PM - 7 AM"]
    },
    "prop-3": {
        "amenities": ["High-speed Wi-Fi", "Professional Housekeeping", "Buffet Dining Hall", "Biometric Security", "PlayStation Lounge"],
        "rules": ["Rent payment in advance by 5th", "Washing machines are self-service", "No outside cooks allowed"]
    }
}

for prop_id, data in default_data.items():
    amenities_json = json.dumps(data["amenities"])
    rules_json = json.dumps(data["rules"])
    cursor.execute(
        "UPDATE properties SET amenities = ?, rules = ? WHERE id = ?",
        (amenities_json, rules_json, prop_id)
    )
    print(f"Updated default amenities and rules for {prop_id}.")

conn.commit()
conn.close()
print("Migration completed successfully!")
