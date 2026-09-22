import os
import urllib.request

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

candidates = [
    # Tractors
    ("tractor_1", "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800"),
    ("tractor_2", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800"),
    ("tractor_3", "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800"),
    ("tractor_4", "https://images.unsplash.com/photo-1562684847-0759816575b5?w=800"),
    ("tractor_5", "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a63?w=800"),
    
    # Harvesters
    ("harvester_1", "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800"),
    ("harvester_2", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800"),
    ("harvester_3", "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800"),
    
    # Rotavators / Tillers
    ("rotavator_1", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800"),
    ("rotavator_2", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800"),
    
    # Sprayers
    ("sprayer_1", "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800"),
    ("sprayer_2", "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800"),
    
    # Water Pump
    ("water_pump_1", "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800"),
    ("water_pump_2", "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800"),
    
    # Cultivators
    ("cultivator_1", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800"),
    
    # Seeders
    ("seeder_1", "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800"),
    
    # Irrigation
    ("irrigation_1", "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800"),
    
    # Power tools
    ("power_tools_1", "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800"),
    
    # Trolley
    ("trolley_1", "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800")
]

os.makedirs("scratch/inspect_images", exist_ok=True)

for name, url in candidates:
    dest = f"scratch/inspect_images/{name}.jpg"
    print(f"Downloading {name} from {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
            out.write(resp.read())
        print(f"Saved {dest} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"Failed {name}: {e}")
