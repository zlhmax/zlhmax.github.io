"""线上核验：Angkor Wat 项目页 + 排序 + 图片真实体积（curl 抖动时用这个）"""
import re
import ssl
import time
import urllib.request

BASE = "https://lhzhang06.github.io"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def get(url, tries=3):
    last = "?"
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
                return r.status, r.read()
        except Exception as exc:  # noqa: BLE001
            last = str(exc)
            time.sleep(2)
    return None, last


print("=== 路由 ===")
for u in ["/", "/portfolio/", "/portfolio/angkor-wat/"]:
    s, b = get(BASE + u)
    print(f"  {u:<26} -> {s}  {len(b) if isinstance(b, bytes) else b} bytes")

print("\n=== 首页「精选作品」顺序（应 angkor-wat 第一）===")
s, b = get(BASE + "/")
if isinstance(b, bytes):
    print("  ", re.findall(r'href="/portfolio/([a-z-]+)/"', b.decode("utf-8", "ignore"))[:8])

print("\n=== 作品集列表顺序 ===")
s, b = get(BASE + "/portfolio/")
if isinstance(b, bytes):
    print("  ", re.findall(r'href="/portfolio/([a-z-]+)/"', b.decode("utf-8", "ignore"))[:8])

print("\n=== 线上 4 张图真实下载体积（原图共 20.4MB）===")
total = 0
for f in [
    "IMG_20260626_162745.vcMUSgfY.jpg",
    "IMG_20260626_163014.C2RRnd2X.jpg",
    "IMG_20260626_175801.BPGG7Ufn.jpg",
    "IMG_20260626_180813.DqPh13BD.jpg",
]:
    s, b = get(BASE + "/_astro/" + f)
    n = len(b) if isinstance(b, bytes) else 0
    total += n
    print(f"  {f:<36} {s}  {n / 1024:.0f} KB")
print(f"  ---- 合计 {total / 1048576:.2f} MB")

print("\n=== OG 分享图 ===")
s, b = get(BASE + "/og/portfolio/angkor-wat.png")
print(f"  /og/portfolio/angkor-wat.png  {s}  {len(b) if isinstance(b, bytes) else b} bytes")
