import json

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx == 653:
                print("=== STEP 653 ===")
                print(data.get("content"))
        except Exception as e:
            pass
