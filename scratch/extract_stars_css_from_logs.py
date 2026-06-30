import json
import os
import re

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Searching transcript for connect-stars-container CSS block...")
with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'connect-stars-container' in line:
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                content = data.get("content") or ""
                # Search for CSS block in content
                match = re.search(r"(\.connect-stars-container.*?\{.*?\})", content, re.DOTALL)
                if match:
                    print(f"Step {step_idx} matches (re.search):")
                    print(match.group(1))
                else:
                    # Let's search for broader context
                    idx = content.find("connect-stars-container")
                    if idx != -1:
                        print(f"Step {step_idx} matches (context):")
                        print(content[max(0, idx-200):min(len(content), idx+1500)])
            except Exception as e:
                pass
