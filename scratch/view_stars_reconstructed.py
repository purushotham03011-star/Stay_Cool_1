import os

reconstruct_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\scratch\reconstructed.css"

if os.path.exists(reconstruct_path):
    with open(reconstruct_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    print("Printing lines containing 'stars' in reconstructed.css:")
    for idx, l in enumerate(lines):
        if "stars" in l.lower():
            print(f"Line {idx+1}: {l.strip()}")
            # Print next 2 lines
            for offset in [1, 2]:
                if idx + offset < len(lines):
                    print(f"  + {lines[idx+offset].strip()}")
else:
    print("Reconstructed CSS not found.")
