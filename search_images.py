import urllib.request, json, urllib.parse

queries = [
    "farmer field india",
    "crop protection field",
    "storm clouds field agriculture",
    "farmer smartphone agriculture",
    "modern agriculture laptop",
    "crop growth field",
    "sunrise agricultural field",
    "farm supplies warehouse"
]

for q in queries:
    url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&srnamespace=6&format=json&utf8="
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req).read()
    data = json.loads(res)
    found = False
    for s in data['query']['search'][:3]:
        title = s['title']
        iurl = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
        ireq = urllib.request.Request(iurl, headers={'User-Agent': 'Mozilla/5.0'})
        ires = urllib.request.urlopen(ireq).read()
        idata = json.loads(ires)
        pages = idata['query']['pages']
        for p in pages:
            if 'imageinfo' in pages[p]:
                print(f"{q} -> {pages[p]['imageinfo'][0]['url']}")
                found = True
                break
        if found: break
    if not found:
        print(f"{q} -> None found")
