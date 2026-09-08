import json
import urllib.request
import urllib.parse
import time

with open('product_list.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Load existing successful mappings
try:
    with open('image_mappings.json', 'r', encoding='utf-8') as f:
        mappings = json.load(f)
except:
    mappings = {}

def get_wiki_image(search_term):
    # Clean the search term
    # E.g., "Paddy Seed PR-126 (5 kg)" -> "Paddy"
    clean = search_term.split('(')[0].strip()
    words = clean.split()
    # take first two words usually to get the essence (e.g., "Paddy Seed", "Urea Fertilizer")
    if len(words) > 2:
        clean = " ".join(words[:2])
        
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(clean)}&srnamespace=6&format=json&utf8="
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'PureFarm-Bot/1.0'})
        res = urllib.request.urlopen(req).read()
        data = json.loads(res)
        for s in data['query']['search'][:1]:
            title = s['title']
            iurl = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
            ireq = urllib.request.Request(iurl, headers={'User-Agent': 'PureFarm-Bot/1.0'})
            ires = urllib.request.urlopen(ireq).read()
            idata = json.loads(ires)
            pages = idata['query']['pages']
            for p in pages:
                if 'imageinfo' in pages[p]:
                    img_url = pages[p]['imageinfo'][0]['url']
                    if not img_url.endswith('.svg') and not img_url.endswith('.pdf'):
                        return img_url
    except Exception as e:
        print("Error fetching from Wiki:", e)
    return None

for i, p in enumerate(products):
    name = p['name']
    if name not in mappings:
        print(f"[{i+1}/120] Fetching wiki for {name}...")
        img = get_wiki_image(name)
        if img:
            mappings[name] = img
        time.sleep(0.5)

with open('image_mappings.json', 'w', encoding='utf-8') as f:
    json.dump(mappings, f, indent=2)

print(f"Total mappings now: {len(mappings)}/120")
