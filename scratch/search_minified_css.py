import os

minified_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\android\app\src\main\assets\public\assets\index-c9iietQd.css"

print("Searching minified CSS via Python...")
if os.path.exists(minified_path):
    with open(minified_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print(f"Length of minified file: {len(content)} characters")
    
    for term in ["memories-section", "wins-section", "clip-path", "now-open-banner"]:
        count = content.count(term)
        print(f"Term '{term}': found {count} times")
        
        # Let's show a snippet if found
        if count > 0:
            idx = content.find(term)
            start = max(0, idx - 50)
            end = min(len(content), idx + 150)
            print(f"  Snippet: {content[start:end]}\n")
else:
    print("Minified file not found.")
