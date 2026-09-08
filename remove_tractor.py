with open('src/data/products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('let imageUrl = IMAGE_MAPPINGS[name] || "https://upload.wikimedia.org/wikipedia/commons/1/12/Tractor_New_Holland_T6.165_plowing_%28Zadobrova%2C_Ljubljana%29.jpg";', 'let imageUrl = IMAGE_MAPPINGS[name] || "";')

with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Tractor fallback removed.")
