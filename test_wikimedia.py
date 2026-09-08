import urllib.request
import json
import urllib.parse

def search_wikimedia(query):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        for result in data['query']['search']:
            title = result['title']
            if not title.lower().endswith('.svg'):
                # Get the image url
                img_req = urllib.request.Request(f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json", headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(img_req) as img_res:
                    img_data = json.loads(img_res.read())
                    pages = img_data['query']['pages']
                    for page_id in pages:
                        return pages[page_id]['imageinfo'][0]['url']
    return None

print("Maize seeds:", search_wikimedia("corn seeds"))
print("Urea fertilizer:", search_wikimedia("urea fertilizer sack"))
