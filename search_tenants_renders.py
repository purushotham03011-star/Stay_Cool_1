filepath = r"c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/src/pages/SuperAdminPanel.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Searching SuperAdminPanel.tsx for tenants map/renders:")
for i, line in enumerate(lines):
    if "tenants.map" in line or "orgTenants" in line or "filteredTenants.map" in line:
        print(f"Line {i+1}: {line.strip()}")
