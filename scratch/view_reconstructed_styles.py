import os
import re

scoped_css_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\src\landing_scoped.css"

print("Searching landing_scoped.css for specific sections...")
if os.path.exists(scoped_css_path):
    with open(scoped_css_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for section in ["wins-section", "portals-switcher-section", "memories-section", "testimonials-section"]:
        print(f"\n=================== {section.upper()} ===================")
        matches = re.finditer(r"([^\}]+)\{([^\}]+)\}", content)
        found = 0
        for m in matches:
            selector = m.group(1).strip()
            body = m.group(2).strip()
            if section in selector:
                print(f"{selector} {{\n  {body}\n}}")
                found += 1
        print(f"Total blocks found for {section}: {found}")
else:
    print("landing_scoped.css not found.")
