"""线上部署验证：逐路由 + 逐资源检查 https://lhzhang06.github.io/"""
import os, re, json, urllib.request, urllib.error, ssl

BASE = "https://lhzhang06.github.io"
DIST = r"D:\Myblog\ryze\dist"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def get(path, want_bytes=False):
    url = BASE + path
    req = urllib.request.Request(url, headers={"User-Agent": "verify"})
    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            body = r.read()
            return r.status, len(body), body if want_bytes else body, dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, 0, b"", {}
    except Exception as e:
        return None, 0, str(e).encode(), {}


def route_of(rel):
    rel = rel.replace("\\", "/")
    if rel.endswith("index.html"):
        return "/" + rel[: -len("index.html")]
    return "/" + rel


print("=" * 74)
print("一、页面路由（以本地 dist 为基准）")
print("=" * 74)
routes = []
for root, _, files in os.walk(DIST):
    for f in files:
        if f.endswith(".html"):
            rel = os.path.relpath(os.path.join(root, f), DIST)
            routes.append(route_of(rel))
routes.sort(key=lambda x: (len(x), x))

ok = bad = 0
for r in routes:
    st, size, _, _ = get(r)
    flag = "OK " if st == 200 else "FAIL"
    if st == 200:
        ok += 1
    else:
        bad += 1
    print(f"  [{flag}] {st}  {r:<34} {size:>7} bytes")
print(f"  ---> 通过 {ok} / 失败 {bad}")

print()
print("=" * 74)
print("二、关键静态资源（CSS/JS/字体/OG图/搜索索引）")
print("=" * 74)
# 从首页 HTML 里抽出真实引用到的资源
st, _, body, _ = get("/")
html = body.decode("utf-8", "ignore")
refs = sorted(set(re.findall(r'(?:href|src)="(/_astro/[^"]+)"', html)))
print(f"  首页引用的 /_astro 资源 {len(refs)} 个，抽查前 8 个:")
aok = abad = 0
for u in refs[:8]:
    st2, size2, _, _ = get(u)
    if st2 == 200:
        aok += 1
    else:
        abad += 1
    print(f"    [{'OK ' if st2 == 200 else 'FAIL'}] {st2}  {u[:70]:<70} {size2:>8}")

# 字体（关键：验证 _astro 隐藏目录没被 Jekyll 吃掉）
print()
print("  字体文件抽查:")
st, _, body, _ = get("/")
fonts = sorted(set(re.findall(r'url\((/_astro/[^)]+\.woff2)\)', html)))
fonts = [f for f in fonts if "noto-sans-sc" in f] or fonts
for u in fonts[:4]:
    st2, size2, _, _ = get(u)
    print(f"    [{'OK ' if st2 == 200 else 'FAIL'}] {st2}  {u[:70]:<70} {size2:>8}")

print()
print("  关键文件:")
critical = [
    "/og/default.png", "/og/blog/my-new-site.png",
    "/rss.xml", "/sitemap-index.xml", "/robots.txt", "/favicon.svg",
    "/.nojekyll", "/pagefind/pagefind.js", "/404.html",
]
for u in critical:
    st2, size2, _, hdr = get(u)
    ct = hdr.get("Content-Type", "")[:24] if hdr else ""
    print(f"    [{'OK ' if st2 == 200 else '?? '}] {st2}  {u:<31} {size2:>8}  {ct}")

print()
print("=" * 74)
print("三、OG 分享图（中文文章）字节数 —— 应与本地 dist 一致")
print("=" * 74)
local_png = os.path.join(DIST, "og", "blog", "my-new-site.png")
lsize = os.path.getsize(local_png) if os.path.exists(local_png) else -1
st2, rsize, _, _ = get("/og/blog/my-new-site.png")
print(f"  本地 dist = {lsize} bytes   线上 = {rsize} bytes   {'一致 ✓' if lsize == rsize else '不一致 ✗'}")

print()
print("=" * 74)
print("四、sitemap 内容与 canonical 域名")
print("=" * 74)
st, _, body, _ = get("/sitemap-0.xml")
xml = body.decode("utf-8", "ignore")
urls = re.findall(r"<loc>([^<]+)</loc>", xml)
print(f"  sitemap 收录 {len(urls)} 条，示例:")
for u in urls[:5]:
    print(f"    {u}")
wrong = [u for u in urls if "lhzhang06.github.io" not in u]
print(f"  域名异常条目: {len(wrong)} {wrong[:3] if wrong else ''}")
st, _, body, _ = get("/")
html = body.decode("utf-8", "ignore")
canon = re.findall(r'<link rel="canonical" href="([^"]+)"', html)
print(f"  首页 canonical = {canon}")
og = re.findall(r'<meta property="og:image" content="([^"]+)"', html)
print(f"  首页 og:image  = {og}")

print()
print("=" * 74)
print("五、http -> https 跳转")
print("=" * 74)
req = urllib.request.Request("http://lhzhang06.github.io/", headers={"User-Agent": "verify"})
try:
    with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
        print(f"  最终 URL: {r.url}   状态 {r.status}")
except Exception as e:
    print("  ", type(e).__name__, e)
