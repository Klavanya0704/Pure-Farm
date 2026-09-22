import json
import os
import time
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'PureFarmApp/3.0 (contact@purefarm.org; agricultural research project)'
}

queries = {
    "tractor": ["File:Red tractor.jpg", "File:Mahindra Tractor.jpg", "File:Red tractor in field.jpg", "File:Case IH tractor.jpg", "File:Massey Ferguson tractor.jpg"],
    "harvester": ["File:Combine harvester.jpg", "File:Combine harvester in wheat field.jpg", "File:Claas Lexion 580.jpg", "File:Combine harvester harvesting.jpg"],
    "water_pump": ["File:Water pump engine.jpg", "File:Diesel water pump.jpg", "File:Pump for irrigation.jpg", "File:Irrigation pump.jpg"],
    "power_tools": ["File:Strimmer.jpg", "File:Brushcutter.jpg", "File:Brush cutter.jpg", "File:Weed trimmer.jpg"],
    "trolley": ["File:Tractor and trailer.jpg", "File:Tractor trailer.jpg", "File:Farm trailer.jpg", "File:Tipping trailer.jpg"]
}

os.makedirs("scratch/candidates_rem", exist_ok=True)

def search_wm_api(term):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(term)}&srnamespace=6&srlimit=8&format=json"
    req = urllib.request.Request(url, headers=headers)
    titles = []
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for r in data.get('query', {}).get('search', []):
                titles.append(r.get('title'))
    except Exception as e:
        print(f"Error searching {term}: {e}")
    return titles

def get_wm_url(title):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                info = p.get('imageinfo', [])
                if info:
                    return info[0].get('url')
    except Exception as e:
        pass
    return None

search_terms = {
    "tractor": "red tractor field farm",
    "harvester": "combine harvester field crop",
    "water_pump": "diesel water pump irrigation",
    "power_tools": "brushcutter strimmer trimmer",
    "trolley": "tractor trailer farm tipping"
}

for cat, term in search_terms.items():
    print(f"\nSearching for {cat} ({term})...")
    titles = search_wm_api(term)
    time.sleep(1)
    for idx, t in enumerate(titles, 1):
        url = get_wm_url(t)
        time.sleep(0.5)
        if url and (url.lower().endswith('.jpg') or url.lower().endswith('.jpeg') or url.lower().endswith('.png')):
            dest = f"scratch/candidates_rem/{cat}_{idx}.jpg"
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                    out.write(resp.read())
                size = os.path.getsize(dest)
                if size > 15000:
                    print(f"  Saved {dest} ({size} bytes) from {t}")
            except Exception as e:
                print(f"  Failed downloading {url}: {e}")
