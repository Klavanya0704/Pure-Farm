import json
with open('product_list.json', 'r') as f:
    products = json.load(f)

for p in products:
    if 'Maize' in p['name'] or 'Seed' in p['name']:
        print(p['name'])
