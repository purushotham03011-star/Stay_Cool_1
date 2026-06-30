import json

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx in [533, 534, 535]:
                print(f"=== STEP {step_idx} ===")
                content = data.get("content", "")
                print(content)
        except Exception as e:
            pass
