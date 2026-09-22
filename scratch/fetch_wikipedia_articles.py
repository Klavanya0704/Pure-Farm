import json
import os
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

articles = {
    "tractor": ["Tractor", "Mahindra_%26_Mahindra", "Farmall"],
    "harvester": ["Combine_harvester", "Harvest"],
    "water_pump": ["Pump", "Centrifugal_pump"],
    "power_tools": ["String_trimmer", "Brushcutter_(garden_tool)"],
    "trolley": ["Trailer_(vehicle)", "Farm_trailer"]
}

def get_wiki_images(title):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={title}&generator=images&gimlimit=20&prop=imageinfo&iiprop=url|size&format=json"
    req = urllib.request.Request(url, headers=headers)
    img_urls = []
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                info = p.get('imageinfo', [])
                if info:
                    u = info[0].get('url')
                    mime = info[0].get('mime', '')
                    width = info[0].get('width', 0)
                    if u and ('image/jpeg' in mime or 'image/png' in mime) and width > 400:
                        img_urls.append(u)
    except Exception as e:
        print(f"Error getting wiki images for {title}: {e}")
    return img_urls

os.makedirs("scratch/candidates_wiki", exist_ok=True)

for cat, titles in articles.items():
    print(f"\n--- Category: {cat} ---")
    for t in titles:
        urls = get_wiki_images(t)
        for idx, u in enumerate(urls[:5], 1):
            dest = f"scratch/candidates_wiki/{cat}_{t}_{idx}.jpg"
            try:
                req = urllib.request.Request(u, headers=headers)
                with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                    out.write(resp.read())
                print(f"  Saved {dest} ({os.path.getsize(dest)} bytes)")
            except Exception as e:
                print(f"  Failed downloading {u}: {e}")
