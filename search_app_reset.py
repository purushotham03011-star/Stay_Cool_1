import sys
import codecs

sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

filepath = r"c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/src/App.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx in range(104, 135):
    if idx < len(lines):
        sys.stdout.write(f"{idx+1}: {lines[idx]}")
