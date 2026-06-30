import zipfile
import os

zip_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2).zip"

print("Listing zip contents...")
if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for info in zip_ref.infolist():
            if not info.is_dir() and "index.css" in info.filename:
                print(f"File: {info.filename}, Size: {info.file_size} bytes")
else:
    print("Zip file not found.")
