import urllib.request

urls = {
    "Tractor": "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1000",
    "Harvester": "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a63?auto=format&fit=crop&w=1000",
    "Rotavator": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000",
    "Sprayer": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000",
    "Water Pump": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000",
    "Cultivator": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000",
    "Seeder": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000",
    "Irrigation": "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1000",
    "Power Tools": "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=1000",
    "Other Farm Equipment": "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1000",
}

for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"[{res.status}] {name}: {url[:60]}...")
    except Exception as e:
        print(f"[FAIL] {name}: {e}")
