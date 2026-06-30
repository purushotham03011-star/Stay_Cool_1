import re

css_path = r"c:\Users\milaa\Desktop\Sunny\hostel-management-system (2)\src\index.css"

with open(css_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the connect-section background color
content = content.replace(
    ".landing-promo-canvas-scoped .connect-section {\n  background-color: #000000;",
    ".landing-promo-canvas-scoped .connect-section {\n  background-color: #ffffff;"
)

# 2. Update connect-stars-container background color
content = re.sub(
    r"\.landing-promo-canvas-scoped \.connect-stars-container \{(.*?)\n\s*background-color:\s*#000000;\n\}",
    r".landing-promo-canvas-scoped .connect-stars-container {\1\n  background-color: #ffffff;\n}",
    content,
    flags=re.DOTALL
)

# 3. Update connect-stars-container::before background-color
content = content.replace(
    "background: #000000;\n  background-image: radial-gradient",
    "background: #ffffff;\n  background-image: radial-gradient"
)

# 4. Remove the text color overrides that made text white on black background
overrides_pattern = r"/\* Light text color overrides for readability on black background \*/\s*\.landing-promo-canvas-scoped \.connect-title \{(.*?)\}\s*\.landing-promo-canvas-scoped \.connect-subtitle \{(.*?)\}\s*\.landing-promo-canvas-scoped \.form-label \{(.*?)\}\s*\.landing-promo-canvas-scoped \.copyright-label \{(.*?)\}\s*\.landing-promo-canvas-scoped \.footer-nav-links a \{(.*?)\}\s*\.landing-promo-canvas-scoped \.nav-separator \{(.*?)\}"
content = re.sub(overrides_pattern, "", content, flags=re.DOTALL)

# 5. Let's adjust form wrapper and inputs for light background
# Update form-wrapper background and border
content = content.replace(
    ".landing-promo-canvas-scoped .form-wrapper {\n  background-color: rgba(255, 255, 255, 0.4);\n  border: 1px solid rgba(255, 255, 255, 0.35);",
    ".landing-promo-canvas-scoped .form-wrapper {\n  background-color: rgba(255, 255, 255, 0.75);\n  border: 1px solid rgba(43, 24, 20, 0.1);"
)

# Update form-input and form-textarea borders
content = content.replace(
    ".landing-promo-canvas-scoped .form-input, .landing-promo-canvas-scoped .form-textarea {\nbackground-color: #ffffff;\n  border: none;",
    ".landing-promo-canvas-scoped .form-input, .landing-promo-canvas-scoped .form-textarea {\nbackground-color: #ffffff;\n  border: 1.5px solid rgba(43, 24, 20, 0.12);"
)

# 6. Now let's change the radial gradients colors to blue and pink falling stars
# Let's extract the radial-gradient block inside connect-stars-container::before
# We can find all radial-gradient(...) calls.
# Let's define the blue and pink color lists.
blue_shades = [
    "rgb(59, 130, 246)",  # Blue-500
    "rgb(37, 99, 235)",  # Blue-600
    "rgb(14, 165, 233)",  # Sky-500
    "rgb(6, 182, 212)",   # Cyan-500
    "rgb(79, 70, 229)"    # Indigo-600
]

pink_shades = [
    "rgb(236, 72, 153)",  # Pink-500
    "rgb(219, 39, 119)",  # Pink-600
    "rgb(244, 63, 94)",   # Rose-500
    "rgb(192, 38, 211)",  # Fuchsia-600
    "rgb(168, 85, 247)"   # Purple-500
]

# We will alternate colors.
# Let's search for the gradients inside the connect-stars-container::before rule
match = re.search(r"(\.landing-promo-canvas-scoped \.connect-stars-container::before \{.*?background-image:)(.*?)(;\s*background-size:)", content, re.DOTALL)
if match:
    prefix = match.group(1)
    gradients_block = match.group(2)
    suffix = match.group(3)
    
    # Split gradients by individual radial-gradient lines
    # Gradients look like: radial-gradient(...) followed by a comma
    individual_gradients = re.findall(r"radial-gradient\([^\)]+\)", gradients_block)
    
    new_gradients = []
    for idx, grad in enumerate(individual_gradients):
        # Determine target color: alternate between blue and pink
        new_color = blue_shades[idx % len(blue_shades)] if idx % 2 == 0 else pink_shades[idx % len(pink_shades)]
        
        # Replace rgb(...) or rgb(...) color in the gradient
        # Let's find any rgb(r, g, b) or similar pattern
        # The color is before the transparency '#0000' or '#884e2800' or similar
        # E.g.: rgb(255, 140, 17) or rgb(255, 119, 0)
        grad_mod = re.sub(r"rgb\(\d+,\s*\d+,\s*\d+\)", new_color, grad)
        
        # Replace the transparent colors `#0000` or `#884e2800` or `transparent 150%` with `rgba(255, 255, 255, 0)`
        grad_mod = grad_mod.replace("#0000", "rgba(255, 255, 255, 0)")
        grad_mod = grad_mod.replace("#884e2800", "rgba(255, 255, 255, 0)")
        
        new_gradients.append(grad_mod)
        
    # Reassemble gradients block
    new_gradients_block = "\n    " + ",\n    ".join(new_gradients)
    content = content.replace(gradients_block, new_gradients_block)
    print("Successfully replaced colors and gradients!")
else:
    print("Could not match connect-stars-container::before rules!")

with open(css_path, "w", encoding="utf-8") as f:
    f.write(content)
