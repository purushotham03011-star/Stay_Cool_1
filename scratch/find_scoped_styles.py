import os

reconstruct_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\scratch\reconstructed.css"

print("Searching reconstructed CSS for scoped landing overrides...")
if os.path.exists(reconstruct_path):
    with open(reconstruct_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Let's find all lines containing .landing-promo-canvas-scoped
    count = 0
    in_block = False
    brace_depth = 0
    
    for i, line in enumerate(lines):
        if ".landing-promo-canvas-scoped" in line or in_block:
            if not in_block:
                print(f"\n--- Line {i+1} ---")
                in_block = True
            print(line.rstrip())
            
            brace_depth += line.count("{") - line.count("}")
            if brace_depth <= 0 and "}" in line:
                in_block = False
                brace_depth = 0
                count += 1
                if count > 30:
                    print("... [TRUNCATED]")
                    break
else:
    print("Reconstructed CSS file not found.")
