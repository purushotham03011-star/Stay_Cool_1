import json
import re

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Searching transcript_full.jsonl...")
with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'index.css' in line:
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                step_type = data.get("type")
                # Look for tool calls that replaced or wrote to index.css
                tool_calls = data.get("tool_calls", [])
                if tool_calls:
                    for tc in tool_calls:
                        if tc.get("name") in ["replace_file_content", "write_to_file"]:
                            args = tc.get("args", {})
                            target = args.get("TargetFile") or args.get("targetFile")
                            if target and "index.css" in target:
                                print(f"Line {i}: Step {step_idx}, Type {step_type}, Tool {tc.get('name')}")
            except Exception as e:
                pass
