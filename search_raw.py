import os

print("Searching for raw localStorage references:")
for root, dirs, files in os.walk("."):
    if "node_modules" in root or "dist" in root or ".git" in root:
        continue
    for file in files:
        if file.endswith((".ts", ".tsx")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                lines = f.readlines()
            for i, line in enumerate(lines):
                if "localStorage" in line:
                    if len(line.strip()) < 120:
                        print(f"{filepath} Line {i+1}: {line.strip()}")
