import json
import re

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Searching for shell commands or python scripts related to index.css...")
with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'index.css' in line:
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                step_type = data.get("type")
                tool_calls = data.get("tool_calls", [])
                if tool_calls:
                    for tc in tool_calls:
                        if tc.get("name") == "run_command":
                            cmd = tc.get("args", {}).get("CommandLine", "")
                            if "index.css" in cmd or "copy" in cmd or "py" in cmd:
                                print(f"Line {i}: Step {step_idx}, Command: {cmd}")
            except Exception as e:
                pass
