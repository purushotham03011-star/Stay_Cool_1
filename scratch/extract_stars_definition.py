import json
import os
import re

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Searching transcript for stars animations and keyframes...")
with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        # We look for key animation terms like animateStars or connect-stars
        if 'stars' in line.lower() or 'radial-gradient' in line.lower():
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                content = data.get("content") or ""
                # Search for keyframes or animation properties
                if "@keyframes" in content or "animation:" in content:
                    print(f"Step {step_idx} matches:")
                    # Print lines containing stars or animations
                    for l in content.split("\n"):
                        if any(term in l for term in ["stars", "Stars", "keyframes", "animation"]):
                            print(f"  {l[:150]}")
            except Exception as e:
                pass
