import json
import os
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&format=json"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            results = []
            for page_id, page in pages.items():
                imageinfo = page.get('imageinfo', [])
                if imageinfo:
                    img_url = imageinfo[0].get('url')
                    mime = imageinfo[0].get('mime')
                    if img_url and ('image/jpeg' in mime or 'image/png' in mime or 'image/webp' in mime):
                        results.append((page.get('title'), img_url))
            return results
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

categories = {
    "tractor": "red agricultural tractor field",
    "harvester": "combine harvester harvesting paddy wheat",
    "rotavator": "rotary tiller rotavator tractor",
    "sprayer": "agricultural crop sprayer tractor",
    "water_pump": "irrigation water pump diesel engine",
    "cultivator": "field cultivator tractor tines",
    "seeder": "seed drill tractor sowing",
    "irrigation": "agricultural sprinkler irrigation field",
    "power_tools": "brush cutter motorized weed trimmer",
    "trolley": "tractor trailer tipping trolley"
}

os.makedirs("public/images/machines", exist_ok=True)

for key, query in categories.items():
    print(f"\n--- Searching Wikimedia for {key}: '{query}' ---")
    results = search_wikimedia(query)
    for title, img_url in results[:3]:
        print(f"Found: {title} -> {img_url}")
