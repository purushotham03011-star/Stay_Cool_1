import json

log_path = r"C:\Users\milaa\.gemini\antigravity\brain\30acad9e-d13f-48ab-a8af-19612551b2a5\.system_generated\logs\transcript_full.jsonl"
target_steps = [755, 759, 775, 799]

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            step_idx = data.get("step_index")
            if step_idx in target_steps:
                print(f"=== STEP {step_idx} ===")
                print(f"Type: {data.get('type')}")
                tool_calls = data.get("tool_calls", [])
                if tool_calls:
                    for tc in tool_calls:
                        print(f"Tool Call Name: {tc.get('name')}")
                        args = tc.get("args", {})
                        for k, v in args.items():
                            val_str = str(v)
                            if len(val_str) > 500:
                                val_str = val_str[:500] + "... [TRUNCATED]"
                            print(f"  Arg {k}: {val_str}")
                else:
                    content = data.get("content", "")
                    if len(content) > 500:
                        content = content[:500] + "... [TRUNCATED]"
                    print(f"Content: {content}")
        except Exception as e:
            pass
