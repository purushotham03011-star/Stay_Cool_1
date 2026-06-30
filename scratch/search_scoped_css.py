import os

scoped_css_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\src\landing_scoped.css"

print("Searching landing_scoped.css for section overrides...")
if os.path.exists(scoped_css_path):
    with open(scoped_css_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for term in ["wins-section", "portals-switcher-section", "testimonials-section", "memories-section"]:
        count = content.count(term)
        print(f"Term '{term}': found {count} times")
else:
    print("landing_scoped.css not found.")
