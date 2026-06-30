filepath = r"c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/src/pages/SuperAdminPanel.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Searching SuperAdminPanel.tsx for properties filtered by selectedOrgId:")
for i, line in enumerate(lines):
    if "properties" in line and "selectedOrgId" in line:
        if len(line.strip()) < 120:
            print(f"Line {i+1}: {line.strip()}")
