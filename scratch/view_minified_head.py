import os

minified_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\android\app\src\main\assets\public\assets\index-c9iietQd.css"

if os.path.exists(minified_path):
    with open(minified_path, "r", encoding="utf-8") as f:
        content = f.read(1000)
    print("Head of file:")
    print(content)
else:
    print("File not found.")
