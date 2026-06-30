css_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\src\landing_scoped.css"

with open(css_path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "testimonials-ribbon" in line:
            print(f"Line {idx+1}: {line.strip()}")
