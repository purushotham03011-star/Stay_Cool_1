import json
import os

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

print("Searching transcript for memories carousel rules in all tool call arguments...")
with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'PLANNER_RESPONSE' in line:
            try:
                data = json.loads(line)
                step_idx = data.get("step_index")
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    args_str = json.dumps(tc.get("args", {}))
                    if any(term in args_str for term in ['memory-card', 'memories-carousel', 'pos-left', 'pos-right']):
                        print(f"Line {i}: Step {step_idx}, Tool: {tc.get('name')}")
                        print(f"  Args: {args_str[:500]}... [TRUNCATED]\n")
            except Exception as e:
                pass
