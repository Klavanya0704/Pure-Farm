import os
import urllib.request

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# High probability equipment photo candidate URLs from Wikimedia Commons
candidates = {
    "tractor": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Amish_Country_Byway_-_Red_Barn_with_Tractor_-_NARA_-_7716998.jpg/1024px-Amish_Country_Byway_-_Red_Barn_with_Tractor_-_NARA_-_7716998.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Approaching_Tractor_%5E_-_geograph.org.uk_-_60341.jpg/1024px-Approaching_Tractor_%5E_-_geograph.org.uk_-_60341.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Mahindra_Tractor_in_India.jpg/1024px-Mahindra_Tractor_in_India.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Red_tractor_plowing_field.jpg/1024px-Red_tractor_plowing_field.jpg"
    ],
    "harvester": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Claas_Lexion_580_Combine_harvester.jpg/1024px-Claas_Lexion_580_Combine_harvester.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Combine_harvester_in_wheat_field.jpg/1024px-Combine_harvester_in_wheat_field.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Combine_harvester_harvesting_wheat.jpg/1024px-Combine_harvester_harvesting_wheat.jpg"
    ],
    "rotavator": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Kuhn_EL201_-_rotavator_at_Bernard_Saunders_WD_2008_-_IMG_4072.jpg/1024px-Kuhn_EL201_-_rotavator_at_Bernard_Saunders_WD_2008_-_IMG_4072.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Rotary_tiller_behind_tractor.jpg/1024px-Rotary_tiller_behind_tractor.jpg"
    ],
    "sprayer": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Crop_sprayer%2C_Oxpens_Farm_-_geograph.org.uk_-_4429399.jpg/1024px-Crop_sprayer%2C_Oxpens_Farm_-_geograph.org.uk_-_4429399.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Tractor_mounted_crop_sprayer.jpg/1024px-Tractor_mounted_crop_sprayer.jpg"
    ],
    "water_pump": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Rushton_4cyl_oil-diesel_engine%2C_Dareton_NSW.jpg/1024px-Rushton_4cyl_oil-diesel_engine%2C_Dareton_NSW.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Diesel_water_pump_for_irrigation.jpg/1024px-Diesel_water_pump_for_irrigation.jpg"
    ],
    "cultivator": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cultivating_in_progress%2C_near_Park_View_Farm%2C_Callow_Hill_-_geograph.org.uk_-_1222429.jpg/1024px-Cultivating_in_progress%2C_near_Park_View_Farm%2C_Callow_Hill_-_geograph.org.uk_-_1222429.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Cultivating_near_Melton_Ross_-_geograph.org.uk_-_2106673.jpg/1024px-Cultivating_near_Melton_Ross_-_geograph.org.uk_-_2106673.jpg"
    ],
    "seeder": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Seed_drill_-_geograph.org.uk_-_1771557.jpg/1024px-Seed_drill_-_geograph.org.uk_-_1771557.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Crop_sowing_near_to_Woolscott%2C_Warwickshire_-_geograph.org.uk_-_1219351.jpg/1024px-Crop_sowing_near_to_Woolscott%2C_Warwickshire_-_geograph.org.uk_-_1219351.jpg"
    ],
    "irrigation": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Agricultural_field_being_irrigated_with_sprinklers.jpg/1024px-Agricultural_field_being_irrigated_with_sprinklers.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Agricultural_field_being_irrigated_with_sprinklers_%281%29.jpg/1024px-Agricultural_field_being_irrigated_with_sprinklers_%281%29.jpg"
    ],
    "power_tools": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Strimmer.jpg/1024px-Strimmer.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Brushcutter.jpg/1024px-Brushcutter.jpg"
    ],
    "trolley": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Tractor_and_trailer.jpg/1024px-Tractor_and_trailer.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Tractor_with_trailer.jpg/1024px-Tractor_with_trailer.jpg"
    ]
}

os.makedirs("scratch/candidates", exist_ok=True)

for name, urls in candidates.items():
    for idx, url in enumerate(urls):
        dest = f"scratch/candidates/{name}_{idx+1}.jpg"
        print(f"Downloading {dest} from {url}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                out.write(resp.read())
            print(f"Saved {dest} ({os.path.getsize(dest)} bytes)")
        except Exception as e:
            print(f"Failed {url}: {e}")
