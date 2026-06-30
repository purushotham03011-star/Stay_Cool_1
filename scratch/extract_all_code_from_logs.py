import json
import os

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Searching transcript for memories carousel CSS rules in earlier steps...")
with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'pos-left' in line or 'memory-card' in line or 'memories-carousel' in line:
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                if step_idx < 500 and data.get("type") == "PLANNER_RESPONSE":
                    tool_calls = data.get("tool_calls", [])
                    for tc in tool_calls:
                        if tc.get("name") in ["replace_file_content", "write_to_file", "multi_replace_file_content"]:
                            print(f"Line {i}: Step {step_idx}, Tool: {tc.get('name')}")
                            # Print a snippet of the replacement content
                            rc = tc.get("args", {}).get("ReplacementContent") or ""
                            if not rc:
                                rc = str(tc.get("args", {}).get("ReplacementChunks", ""))
                            print(f"Snippet: {rc[:500]}... [TRUNCATED]\n")
            except Exception as e:
                pass
