import re

js_path = r"c:/Users/milaa/Desktop/Sunny/hostel-management-system (2)/android/app/src/main/assets/public/assets/index-YyNb4wtH.js"
content = open(js_path, "r", encoding="utf-8").read()

for m in re.finditer(r"Customer", content, re.IGNORECASE):
    start = max(0, m.start() - 100)
    end = min(len(content), m.end() + 100)
    print(f"Match for Customer at {m.start()}: {content[start:end]}\n")
