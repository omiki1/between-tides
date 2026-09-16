import json
import time
import urllib.request
from pathlib import Path

UID = "41883170"
OUT = Path(r"C:\workspace\wuwa\data\bangumi.json")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

def fetch_type(kind: int):
    items = []
    pn = 1
    ps = 30
    total = None
    while True:
        url = (
            "https://api.bilibili.com/x/space/bangumi/follow/list"
            f"?type={kind}&vmid={UID}&pn={pn}&ps={ps}"
        )
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://space.bilibili.com/"})
        with urllib.request.urlopen(req, timeout=30) as res:
            data = json.loads(res.read().decode("utf-8"))
        if data.get("code") != 0:
            raise SystemExit(f"API error type={kind}: {data}")
        payload = data.get("data") or {}
        batch = payload.get("list") or []
        total = payload.get("total", total)
        items.extend(batch)
        print(f"type={kind} pn={pn} got={len(batch)} total={total}")
        if not batch or (total is not None and len(items) >= total):
            break
        pn += 1
        time.sleep(0.25)
    return items, total or len(items)

def slim(item: dict) -> dict:
    cover = item.get("cover") or ""
    if cover.startswith("http://"):
        cover = "https://" + cover[len("http://"):]
    rating = item.get("rating") or {}
    new_ep = item.get("new_ep") or {}
    return {
        "id": item.get("media_id"),
        "seasonId": item.get("season_id"),
        "title": item.get("title") or "",
        "cover": cover,
        "seasonType": item.get("season_type") or 1,
        "seasonTypeName": item.get("season_type_name") or "",
        "rating": float(rating.get("score") or 0),
        "evaluate": item.get("evaluate") or item.get("brief") or "",
        "followStatus": item.get("follow_status") or 0,
        "epStatus": (new_ep.get("index_show") or ""),
        "areas": [a.get("name") for a in (item.get("areas") or []) if a.get("name")],
        "link": f"https://www.bilibili.com/bangumi/play/ss{item.get('season_id')}",
    }

anime, anime_total = fetch_type(1)
drama, drama_total = fetch_type(2)
merged = [slim(x) for x in [*anime, *drama]]
# de-dupe by media id
seen = set()
unique = []
for item in merged:
    if item["id"] in seen:
        continue
    seen.add(item["id"])
    unique.append(item)

payload = {
    "uid": UID,
    "space": f"https://space.bilibili.com/{UID}",
    "fetchedAt": time.strftime("%Y-%m-%d"),
    "animeTotal": anime_total,
    "dramaTotal": drama_total,
    "items": unique,
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {len(unique)} items to {OUT}")
print("sample:", [i["title"] for i in unique[:12]])
