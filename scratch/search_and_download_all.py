import json
import os
import time
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'PureFarmApp/2.0 (contact@purefarm.org; agricultural research project)'
}

queries = {
    "tractor": "red agricultural tractor field",
    "harvester": "combine harvester field",
    "rotavator": "rotavator tractor",
    "sprayer": "crop sprayer tractor",
    "water_pump": "water pump engine irrigation",
    "cultivator": "cultivator tractor",
    "seeder": "seed drill tractor",
    "irrigation": "sprinklers irrigation field",
    "power_tools": "brush cutter trimmer",
    "trolley": "tractor trailer"
}

os.makedirs("public/images/machines", exist_ok=True)
os.makedirs("scratch/candidates_all", exist_ok=True)

def search_wm_files(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&srlimit=5&format=json"
    req = urllib.request.Request(url, headers=headers)
    titles = []
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('query', {}).get('search', [])
            for r in results:
                titles.append(r.get('title'))
    except Exception as e:
        print(f"Error searching '{query}': {e}")
    return titles

def get_file_url(title):
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
        print(f"Error getting URL for '{title}': {e}")
    return None

manifest = {}

for category, q in queries.items():
    print(f"\n=================== {category.upper()} ({q}) ===================")
    titles = search_wm_files(q)
    time.sleep(1)
    saved_list = []
    for idx, t in enumerate(titles, 1):
        if not t: continue
        url = get_file_url(t)
        time.sleep(0.5)
        if url and (url.endswith('.jpg') or url.endswith('.png') or url.endswith('.jpeg') or url.endswith('.JPG') or url.endswith('.PNG')):
            dest = f"scratch/candidates_all/{category}_{idx}.jpg"
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                    out.write(resp.read())
                size = os.path.getsize(dest)
                if size > 10000: # filter tiny/broken files
                    print(f"  [{idx}] Saved {dest} ({size} bytes) from {t}")
                    saved_list.append((dest, t, url))
            except Exception as e:
                print(f"  [{idx}] Download failed for {url}: {e}")
    manifest[category] = saved_list

with open("scratch/wm_manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)

print("\nSearch and download complete!")
