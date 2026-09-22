import json
import os
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_wikimedia_file_url(file_name):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(file_name)}&prop=imageinfo&iiprop=url&format=json"
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
        print(f"Error for {file_name}: {e}")
    return None

files_to_fetch = {
    "tractor": ["Mahindra_Tractor_in_India.jpg", "Approaching_Tractor_^_-_geograph.org.uk_-_60341.jpg", "Boy_plowing_with_a_tractor_at_sunset_in_Don_Det,_Laos.jpg"],
    "harvester": ["Combine_harvester_1.jpg", "Claas_Lexion_580_Combine_harvester.jpg", "Combine_harvester_in_field.jpg"],
    "rotavator": ["Kuhn_EL201_-_rotavator_at_Bernard_Saunders_WD_2008_-_IMG_4072.jpg", "Rotavator.jpg"],
    "sprayer": ["Crop_sprayer,_Oxpens_Farm_-_geograph.org.uk_-_4429399.jpg", "Self-propelled_sprayer.jpg"],
    "water_pump": ["Diesel_water_pump.jpg", "Irrigation_water_pump.jpg", "Rushton_4cyl_oil-diesel_engine,_Dareton_NSW.jpg"],
    "cultivator": ["Cultivating_in_progress,_near_Park_View_Farm,_Callow_Hill_-_geograph.org.uk_-_1222429.jpg", "Cultivating_near_Melton_Ross_-_geograph.org.uk_-_2106673.jpg"],
    "seeder": ["Seed_drill_-_geograph.org.uk_-_1771557.jpg", "Crop_sowing_near_to_Woolscott,_Warwickshire_-_geograph.org.uk_-_1219351.jpg"],
    "irrigation": ["Agricultural_field_being_irrigated_with_sprinklers.jpg", "Center_pivot_irrigation_in_circle_field.jpg"],
    "power_tools": ["Brushcutter.jpg", "Strimmer.jpg"],
    "trolley": ["Tractor_and_trailer.jpg", "Tractor_with_trailer.jpg"]
}

os.makedirs("scratch/candidates", exist_ok=True)

for category, files in files_to_fetch.items():
    print(f"\nFetching {category}...")
    for idx, fname in enumerate(files, 1):
        url = get_wikimedia_file_url(fname)
        if url:
            dest = f"scratch/candidates/{category}_{idx}.jpg"
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                    out.write(resp.read())
                print(f"  Success: {dest} ({os.path.getsize(dest)} bytes) from {url}")
            except Exception as e:
                print(f"  Failed downloading {url}: {e}")
        else:
            print(f"  No URL found for {fname}")
