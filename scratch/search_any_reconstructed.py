import os
import re

reconstruct_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\scratch\reconstructed.css"

print("Searching reconstructed CSS for carousel/memory terms...")
if os.path.exists(reconstruct_path):
    with open(reconstruct_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    for term in ["carousel", "memory", "quote", "author", "pos-"]:
        count = content.count(term)
        print(f"Term '{term}': found {count} times")
        if count > 0:
            # print first match
            idx = content.find(term)
            print(f"  Snippet: {content[max(0, idx-50):min(len(content), idx+150)]}")
else:
    print("Reconstructed CSS file not found.")
