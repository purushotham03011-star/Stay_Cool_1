import os
import re

minified_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\android\app\src\main\assets\public\assets\index-c9iietQd.css"

print("Extracting selectors from minified CSS...")
if os.path.exists(minified_path):
    with open(minified_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Selectors are followed by {
    # Let's find all chunks before {
    matches = re.finditer(r"([^\}]+)\{", content)
    found = 0
    for m in matches:
        selector = m.group(1).strip()
        # Clean up selector (remove newlines, comments)
        selector = re.sub(r"\/\*.*?\*\/", "", selector, flags=re.DOTALL)
        selector = selector.strip()
        if "memories" in selector or "card" in selector or "landing" in selector or "wins" in selector:
            print(f"Selector: {selector}")
            found += 1
            if found > 40:
                print("... [TRUNCATED]")
                break
    print(f"Search complete. Found {found} selectors.")
else:
    print("Minified file not found.")
