import urllib.request

test_urls = [
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1000",
    "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=1000"
]

for url in test_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req)
        print(f"[200 OK] {url}")
    except Exception as e:
        print(f"[FAIL {e}] {url}")
