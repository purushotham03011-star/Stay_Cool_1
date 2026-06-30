import re

css_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\src_landing\src\index.css"
output_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\src\landing_scoped.css"

with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()

lines = css_content.split('\n')
scoped_lines = []

in_keyframes = False

for line in lines:
    stripped = line.strip()
    if not stripped:
        scoped_lines.append(line)
        continue
    
    # Check for imports/keyframes
    if stripped.startswith('@import'):
        scoped_lines.append(line)
        continue
    
    if '@keyframes' in stripped:
        in_keyframes = True
        scoped_lines.append(line)
        continue
        
    if in_keyframes:
        scoped_lines.append(line)
        if stripped == '}':
            in_keyframes = False
        continue
        
    # Check for theme / variables
    if stripped.startswith(':root'):
        # Map :root variables to .landing-promo-canvas-scoped
        scoped_lines.append(line.replace(':root', '.landing-promo-canvas-scoped'))
        continue

    # If it's a media query start
    if stripped.startswith('@media'):
        scoped_lines.append(line)
        continue
        
    # If it is a closing brace
    if stripped == '}':
        scoped_lines.append(line)
        continue
        
    # If the line contains a selector block start '{'
    if '{' in line:
        parts = line.split('{')
        selector_part = parts[0]
        style_part = '{' + '{'.join(parts[1:])
        
        # Split selectors by comma
        selectors = selector_part.split(',')
        scoped_selectors = []
        for sel in selectors:
            sel_strip = sel.strip()
            if not sel_strip:
                continue
            
            # Map body, html, ion-app, ion-content to .landing-promo-canvas-scoped
            if sel_strip in ['body', 'html', 'ion-app', 'ion-content']:
                scoped_selectors.append(sel.replace(sel_strip, '.landing-promo-canvas-scoped'))
            elif sel_strip.startswith('@') or sel_strip.endswith('%') or sel_strip in ['from', 'to']:
                # keep keyframes or other specials
                scoped_selectors.append(sel)
            else:
                # prepend scoping class
                leading_ws = len(sel) - len(sel.lstrip())
                scoped_selectors.append(sel[:leading_ws] + '.landing-promo-canvas-scoped ' + sel_strip)
                
        scoped_lines.append(','.join(scoped_selectors) + style_part)
    else:
        # Regular style property line
        scoped_lines.append(line)

with open(output_path, "w", encoding="utf-8") as f:
    f.write('\n'.join(scoped_lines))

print("Scoping completed successfully!")
