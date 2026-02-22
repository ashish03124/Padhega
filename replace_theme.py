import os
import re

directory = r"c:\Users\Agaru\OneDrive\Documents\visual studio 1\PADHEGAA\my-first-website\src\app"

# We must be careful to match rgba(139, 92, 246, ...) and other variations
# #8b5cf6 -> #305229
# 139, 92, 246 -> 48, 82, 41
# #ec4899 -> #4a7c3f
# 236, 72, 153 -> 74, 124, 63

replacements = [
    (re.compile(r"#8b5cf6", flags=re.IGNORECASE), "#305229"),
    (re.compile(r"139,\s*92,\s*246", flags=re.IGNORECASE), "48, 82, 41"),
    (re.compile(r"#ec4899", flags=re.IGNORECASE), "#4a7c3f"),
    (re.compile(r"236,\s*72,\s*153", flags=re.IGNORECASE), "74, 124, 63")
]

count = 0
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".css") or file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            orig = content
            for regex, rep in replacements:
                content = regex.sub(rep, content)
                
            if content != orig:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                count += 1
                print(f"Updated {path}")

print(f"Total files updated: {count}")
