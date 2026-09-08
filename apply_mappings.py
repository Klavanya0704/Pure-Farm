import json
import re

with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

with open('mappings_code.txt', 'r', encoding='utf-8') as f:
    new_mappings = f.read()

# Replace the IMAGE_MAPPINGS object
content = re.sub(r'export const IMAGE_MAPPINGS: Record<string, string> = \{[\s\S]*?\};\n?', new_mappings + '\n', content)

with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("IMAGE_MAPPINGS successfully updated in products.ts")
