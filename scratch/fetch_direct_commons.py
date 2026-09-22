import re
import os
import time
import urllib.request
import urllib.parse

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def get_commons_search_images(query):
    url = f"https://commons.wikimedia.org/w/index.php?search={urllib.parse.quote(query)}&title=Special:MediaSearch&go=Go&type=image"
    req = urllib.request.Request(url, headers=headers)
    img_urls = []
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract upload.wikimedia.org image URLs
            matches = re.findall(r'https://upload\.wikimedia\.org/wikipedia/commons/thumb/[^"\']+\.(?:jpg|jpeg|png)', html, re.IGNORECASE)
            for m in matches:
                # convert thumbnail URL to a clean 800px or 1000px version
                parts = m.split('/')
                if len(parts) > 7:
                    # original file name is at parts[7]
                    filename = parts[7]
                    clean_url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{parts[5]}/{parts[6]}/{filename}/800px-{filename}"
                    if clean_url not in img_urls:
                        img_urls.append(clean_url)
    except Exception as e:
        print(f"Error for {query}: {e}")
    return img_urls

search_categories = {
    "tractor": "red tractor field",
    "harvester": "combine harvester wheat",
    "water_pump": "diesel water pump irrigation",
    "power_tools": "motorized brushcutter weed trimmer",
    "trolley": "tractor tipping trailer"
}

os.makedirs("scratch/candidates_direct", exist_ok=True)

for cat, q in search_categories.items():
    print(f"\n--- Searching {cat} ({q}) ---")
    urls = get_commons_search_images(q)
    print(f"Found {len(urls)} URLs")
    for idx, u in enumerate(urls[:5], 1):
        dest = f"scratch/candidates_direct/{cat}_{idx}.jpg"
        try:
            req = urllib.request.Request(u, headers=headers)
            with urllib.request.urlopen(req) as resp, open(dest, 'wb') as out:
                out.write(resp.read())
            print(f"  Saved {dest} ({os.path.getsize(dest)} bytes)")
        except Exception as e:
            print(f"  Failed {u}: {e}")
    time.sleep(1)
