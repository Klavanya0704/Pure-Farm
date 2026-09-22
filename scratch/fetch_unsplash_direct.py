import json
import os
import time
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_unsplash_photos(query):
    url = f"https://unsplash.com/napi/search/photos?query={urllib.parse.quote(query)}&per_page=10"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            urls = []
            for item in results:
                raw_url = item.get('urls', {}).get('regular') or item.get('urls', {}).get('small')
                desc = item.get('alt_description') or item.get('description') or ''
                photo_id = item.get('id')
                if raw_url:
                    urls.append((photo_id, raw_url, desc))
            return urls
    except Exception as e:
        print(f"Error searching Unsplash for '{query}': {e}")
        return []

queries = {
    "tractor": "red tractor farm",
    "harvester": "combine harvester",
    "rotavator": "rotary tiller tractor",
    "sprayer": "crop sprayer tractor",
    "water_pump": "water pump irrigation engine",
    "cultivator": "cultivator tractor field",
    "seeder": "seed drill tractor",
    "irrigation": "sprinkler irrigation farm",
    "power_tools": "brush cutter weed trimmer",
    "trolley": "tractor trailer"
}

os.makedirs("scratch/candidates_unsplash", exist_ok=True)

all_downloaded = {}

for category, q in queries.items():
    print(f"\n=================== {category.upper()} ({q}) ===================")
    photos = search_unsplash_photos(q)
    time.sleep(1)
    downloaded_count = 0
    cat_list = []
    for photo_id, url, desc in photos[:5]:
        dest = f"scratch/candidates_unsplash/{category}_{photo_id}.jpg"
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                out.write(resp.read())
            print(f"  Saved {dest} ({os.path.getsize(dest)} bytes) - Description: {desc}")
            cat_list.append((dest, desc, url))
            downloaded_count += 1
        except Exception as e:
            print(f"  Failed {url}: {e}")
    all_downloaded[category] = cat_list

with open("scratch/downloaded_manifest.json", "w") as f:
    json.dump(all_downloaded, f, indent=2)

print("\nFinished downloading photos to scratch/candidates_unsplash/")
