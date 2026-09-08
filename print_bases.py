import json

with open('product_list.json', 'r') as f:
    products = json.load(f)

bases = set()
for p in products:
    name = p['name'].split('(')[0].strip()
    bases.add(name)

for b in sorted(bases):
    print(b)
