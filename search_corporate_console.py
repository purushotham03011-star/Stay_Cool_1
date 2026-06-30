filepath = r"c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/src/pages/SuperAdminPanel.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("Searching SuperAdminPanel.tsx for tenants/customers in corporate-console tab:")
in_tab = False
for i, line in enumerate(lines):
    if "activeTab === 'corporate-console'" in line:
        in_tab = True
        print(f"Corporate Console starts at line {i+1}")
    if in_tab and "activeTab ===" in line and "corporate-console" not in line:
        in_tab = False
        print(f"Corporate Console ends at line {i+1}")
    if in_tab and any(k in line for k in ["tenants", "customers", "mapped", "filtered"]):
        if len(line.strip()) < 120:
            print(f"  Line {i+1}: {line.strip()}")
