import zipfile
import os

zip_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2).zip"
dest_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\scratch\index_zip.css"

print("Checking zip archive...")
if os.path.exists(zip_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Find index.css inside the zip
        css_file_in_zip = None
        for name in zip_ref.namelist():
            if name.endswith("src/index.css"):
                css_file_in_zip = name
                break
        
        if css_file_in_zip:
            print(f"Found CSS file: {css_file_in_zip}")
            # Extract it
            with zip_ref.open(css_file_in_zip) as source, open(dest_path, "wb") as target:
                target.write(source.read())
            print(f"Extracted to {dest_path}")
        else:
            print("CSS file not found in zip.")
else:
    print("Zip file not found.")
