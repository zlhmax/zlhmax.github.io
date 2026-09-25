import json, urllib.request, sys

def repos(user):
    url = f"https://api.github.com/users/{user}/repos?per_page=100&sort=updated"
    req = urllib.request.Request(url, headers={"User-Agent": "probe", "Accept": "application/vnd.github+json"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            d = json.load(r)
    except Exception as e:
        return f"ERR {type(e).__name__}: {e}"
    if isinstance(d, dict):
        return "API: " + str(d.get("message"))
    return d

for user in ["lhzhang06", "lhzhang"]:
    print("=" * 62)
    print(f"账号 {user}")
    d = repos(user)
    if isinstance(d, str):
        print("  ", d)
        continue
    pages = [r for r in d if r["name"].endswith(".github.io")]
    print(f"  公开仓库数: {len(d)}")
    print(f"  Pages 仓库: {[r['name'] for r in pages] or '无'}")
    for r in d[:12]:
        flag = "  <-- PAGES" if r["name"].endswith(".github.io") else ""
        print(f"    - {r['name']:<34} 更新 {r['updated_at'][:10]}  描述={(r.get('description') or '')[:28]}{flag}")
