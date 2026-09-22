import json
import os
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'PureFarmApp/4.0 (contact@purefarm.org; educational agricultural app)'
}

targets = {
    "tractor": ["Tractor", "Farmall", "Agricultural_machinery"],
    "harvester": ["Combine_harvester", "Forage_harvester", "Combine_harvester_threshing_system"],
    "water_pump": ["Pump", "Submersible_pump", "Centrifugal_pump"],
    "power_tools": ["String_trimmer", "Chainsaw", "Lawn_mower"],
    "trolley": ["Trailer_(vehicle)", "Dump_truck", "Wagon"]
}

os.makedirs("scratch/candidates_rest", exist_ok=True)

for cat, page_list in targets.items():
    print(f"\n=================== {cat.upper()} ===================")
    for title in page_list:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                original = data.get('originalimage', {}).get('source')
                thumb = data.get('thumbnail', {}).get('source')
                img_url = original or thumb
                print(f"Page '{title}' -> Image URL: {img_url}")
                if img_url:
                    dest = f"scratch/candidates_rest/{cat}_{title}.jpg"
                    img_req = urllib.request.Request(img_url, headers=headers)
                    with urllib.request.urlopen(img_req) as img_resp, open(dest, 'wb') as out:
                        out.write(img_resp.read())
                    print(f"  Downloaded {dest} ({os.path.getsize(dest)} bytes)")
        except Exception as e:
            print(f"Error for page {title}: {e}")
