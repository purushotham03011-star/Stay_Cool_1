import json
import re

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Scanning log transcript to collect segments of index.css...")
segments = []

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'index.css' in line:
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                step_type = data.get("type")
                content = data.get("content") or ""
                
                # Check if it contains actual CSS lines
                if "Total Lines:" in content and "Showing lines" in content:
                    # Extract the lines
                    lines = content.split("\n")
                    css_lines = []
                    for l in lines:
                        match = re.match(r"^(\d+): (.*)$", l.strip())
                        if match:
                            line_num = int(match.group(1))
                            line_content = match.group(2)
                            css_lines.append((line_num, line_content))
                    if css_lines:
                        segments.append((step_idx, css_lines))
                        print(f"Found segment at Step {step_idx}: lines {css_lines[0][0]} to {css_lines[-1][0]}")
            except Exception as e:
                pass

print(f"Total segments found: {len(segments)}")

# Let's assemble the lines we found
if segments:
    assembled = {}
    for step_idx, css_lines in segments:
        for num, content in css_lines:
            # We take the latest step's view if there are duplicates
            assembled[num] = content
            
    # Print the coverage
    max_line = max(assembled.keys()) if assembled else 0
    print(f"Max line number seen: {max_line}")
    print(f"Distinct lines retrieved: {len(assembled)}")
    
    # Save the reconstructed file
    reconstruct_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\scratch\reconstructed.css"
    with open(reconstruct_path, "w", encoding="utf-8") as out:
        for num in sorted(assembled.keys()):
            out.write(assembled[num] + "\n")
    print(f"Saved reconstructed lines to {reconstruct_path}")
