filepath = r"c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/src/App.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Searching App.tsx for syncAllFromBackend:")
for i, line in enumerate(lines):
    if "syncAllFromBackend" in line:
        print(f"Line {i+1}: {line.strip()}")
