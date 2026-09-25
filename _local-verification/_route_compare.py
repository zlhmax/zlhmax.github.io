import urllib.request, re, json, ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

LOCAL = "http://localhost:4321"
LIVE = "https://ryze.pages.dev"

routes = [
    "/", "/blog/", "/portfolio/", "/resume/", "/404",
    "/blog/aureus-cli-automation/", "/blog/markdown-showcase/",
    "/blog/ryze-the-blog-portfolio-starter/", "/blog/how-to-write-numbers/",
    "/portfolio/aureus/", "/portfolio/drift/", "/portfolio/forge/",
    "/portfolio/nova/", "/portfolio/sentinel/",
    "/robots.txt", "/rss.xml", "/sitemap-index.xml", "/sitemap-0.xml",
    "/og/default.png", "/og/blog/aureus-cli-automation.png",
    "/og/portfolio/nova.png", "/pagefind/pagefind.js",
]

def fetch(url, timeout=20):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            body = r.read()
            return r.status, body
    except urllib.error.HTTPError as e:
        return e.code, b""
    except Exception as e:
        return f"ERR:{type(e).__name__}:{e}", b""

def title(body):
    m = re.search(rb"<title>(.*?)</title>", body, re.S)
    return m.group(1).decode("utf-8", "replace").strip() if m else ""

rows = []
for r in routes:
    ls, lb = fetch(LOCAL + r)
    vs, vb = fetch(LIVE + r)
    lt, vt = title(lb), title(vb)
    rows.append({
        "route": r,
        "local_status": ls, "live_status": vs,
        "local_bytes": len(lb), "live_bytes": len(vb),
        "local_title": lt, "live_title": vt,
        "title_match": (lt == vt) if (lt or vt) else None,
    })

print(f"{'ROUTE':<45}{'LOCAL':<8}{'LIVE':<8}{'L/B':>9}{'V/B':>9}  TITLE-MATCH")
for r in rows:
    print(f"{r['route']:<45}{str(r['local_status']):<8}{str(r['live_status']):<8}"
          f"{r['local_bytes']:>9}{r['live_bytes']:>9}  {r['title_match']}")

ok = sum(1 for r in rows if r["local_status"] == 200)
print(f"\nLOCAL 200 OK: {ok}/{len(rows)}")
missing_live = [r["route"] for r in rows if r["live_status"] == 200 and r["local_status"] != 200]
print("LIVE 有而 LOCAL 无:", missing_live or "无")
extra_local = [r["route"] for r in rows if r["local_status"] == 200 and r["live_status"] != 200]
print("LOCAL 有而 LIVE 无:", extra_local or "无")
json.dump(rows, open(r"D:\Myblog\ryze\_route_compare.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
