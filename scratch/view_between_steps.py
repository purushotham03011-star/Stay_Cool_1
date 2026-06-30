import json

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if 540 <= step_idx <= 575:
                print(f"=== STEP {step_idx} ===")
                print(f"Source: {data.get('source')}, Type: {data.get('type')}, Status: {data.get('status')}")
                content = data.get("content", "")
                tool_calls = data.get("tool_calls", [])
                if tool_calls:
                    for tc in tool_calls:
                        print(f"  Tool: {tc.get('name')}, Args keys: {list(tc.get('args', {}).keys())}")
                if content:
                    print(f"  Content: {content[:300]}...")
        except Exception as e:
            pass
