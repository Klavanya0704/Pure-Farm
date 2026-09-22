import json
import os
import time
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'PureFarmApp/1.0 (contact@purefarm.org; agricultural research project)'
}

queries = {
    "tractor": ["File:Mahindra Tractor in India.jpg", "File:Red tractor plowing field.jpg", "File:John Deere 6620 front.jpg", "File:Tractor in field.jpg", "File:Fendt tractor.jpg"],
    "harvester": ["File:Combine harvester in action.jpg", "File:Combine harvester 1.jpg", "File:Claas Lexion 580 Combine harvester.jpg", "File:Mähdrescher in Aktion.jpg"],
    "rotavator": ["File:Kuhn EL201 - rotavator at Bernard Saunders WD 2008 - IMG 4072.jpg", "File:Rotavator.jpg", "File:Rotary tiller behind tractor.jpg"],
    "sprayer": ["File:Crop sprayer, Oxpens Farm - geograph.org.uk - 4429399.jpg", "File:Tractor mounted crop sprayer.jpg", "File:Self-propelled sprayer.jpg"],
    "water_pump": ["File:Irrigation water pump.jpg", "File:Diesel water pump.jpg", "File:Water pump for irrigation.jpg"],
    "cultivator": ["File:Cultivating in progress, near Park View Farm, Callow Hill - geograph.org.uk - 1222429.jpg", "File:Cultivator implement.jpg"],
    "seeder": ["File:Seed drill - geograph.org.uk - 1771557.jpg", "File:Drilling wheat near Melton Ross - geograph.org.uk - 2106676.jpg"],
    "irrigation": ["File:Agricultural field being irrigated with sprinklers.jpg", "File:Sprinkler irrigation.jpg"],
    "power_tools": ["File:Strimmer.jpg", "File:Brushcutter.jpg"],
    "trolley": ["File:Tractor and trailer.jpg", "File:Tractor with trailer.jpg"]
}

os.makedirs("public/images/machines", exist_ok=True)
os.makedirs("scratch/candidates_wm", exist_ok=True)

def fetch_wm_url(title):
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
        print(f"Error fetching {title}: {e}")
    return None

for category, titles in queries.items():
    print(f"\n--- {category} ---")
    for idx, t in enumerate(titles, 1):
        url = fetch_wm_url(t)
        time.sleep(0.5)
        if url:
            dest = f"scratch/candidates_wm/{category}_{idx}.jpg"
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                    out.write(resp.read())
                print(f"  Downloaded: {dest} ({os.path.getsize(dest)} bytes) from {url}")
            except Exception as e:
                print(f"  Failed download {url}: {e}")
        else:
            print(f"  Not found: {t}")
