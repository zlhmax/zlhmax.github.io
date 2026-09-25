#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Verify https://zlhmax.github.io after first deploy (with wait-for-live retries)."""
import urllib.request, urllib.error, ssl, time, re, sys

BASE = "https://zlhmax.github.io"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (verification)"}


def get(path, timeout=25):
    url = BASE + path
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as r:
            return r.status, r.read(), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read(), dict(e.headers)
    except Exception as e:
        return None, str(e).encode(), {}


def wait_live(attempts=9, delay=20):
    for i in range(1, attempts + 1):
        st, body, _ = get("/")
        print("  [wait %d/%d] status=%s len=%s" % (i, attempts, st, len(body)))
        if st == 200 and len(body) > 500:
            return True
        time.sleep(delay)
    return False


def main():
    print("=== STEP 1: wait for site to go live ===")
    if not wait_live():
        print("  !! site not live yet after retries")
        return 1

    print("\n=== STEP 2: route status table ===")
    routes = [
        "/", "/blog/", "/blog/my-new-site/", "/blog/aureus-cli-automation/",
        "/portfolio/", "/portfolio/angkor-wat/", "/resume/",
        "/rss.xml", "/sitemap-index.xml", "/avatar.png",
        "/og/default.png", "/og/portfolio/angkor-wat.png",
        "/pagefind/pagefind.js",
        "/blog/ryze-the-blog-portfolio-starter/",  # deleted template post -> expect 404
    ]
    rows = []
    for p in routes:
        st, body, h = get(p)
        rows.append((p, st, len(body), h.get("Content-Type", "")[:38]))
    for p, st, ln, ct in rows:
        mark = "OK " if (st == 200) else ("404" if st == 404 else "!! ")
        print("  %s %-44s %-4s %9d B  %s" % (mark, p, st, ln, ct))

    print("\n=== STEP 3: homepage meta assertions ===")
    st, body, _ = get("/")
    html = body.decode("utf-8", "replace")
    checks = [
        ("title", "<title>", re.search(r"<title>(.*?)</title>", html)),
        ("lang=zh-CN", '<html lang="zh-CN"', '<html lang="zh-CN"' in html),
        ("canonical", 'rel="canonical"', re.search(r'<link rel="canonical" href="([^"]+)"', html)),
        ("og:url", 'property="og:url"', re.search(r'property="og:url" content="([^"]+)"', html)),
        ("og:image", 'property="og:image"', re.search(r'property="og:image" content="([^"]+)"', html)),
        ("og:site_name", 'og:site_name', re.search(r'property="og:site_name" content="([^"]+)"', html)),
        ("avatar markup", 'width="100"', 'width="100" height="100"' in html),
        ("shrink-0", 'shrink-0', 'shrink-0' in html),
        ("no gsap", 'gsap absent', 'gsap' not in html.lower()),
        ("star link", 'github.com/zlhmax', 'https://github.com/zlhmax/zlhmax.github.io' in html),
    ]
    for name, label, val in checks:
        if hasattr(val, "group"):
            print("  %-14s %s" % (name, val.group(1) if val else "MISSING"))
        else:
            print("  %-14s %s" % (name, "yes" if val else "NO"))

    print("\n=== STEP 4: old domain residue on live site ===")
    hits = len(re.findall(r"lhzhang06\.github\.io", html))
    print("  occurrences of lhzhang06.github.io in homepage:", hits)
    for m in set(re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}", html)):
        print("  email found:", m)

    print("\n=== STEP 5: portfolio order (angkor-wat should be first) ===")
    for p in ("/", "/portfolio/"):
        st, body, _ = get(p)
        h = body.decode("utf-8", "replace")
        ids = re.findall(r'href="/portfolio/([a-z0-9-]+)/?"', h)
        seen, order = set(), []
        for i in ids:
            if i not in seen:
                seen.add(i); order.append(i)
        print("  %-14s order: %s" % (p, " > ".join(order[:6])))

    print("\n=== STEP 6: angkor-wat detail page ===")
    st, body, _ = get("/portfolio/angkor-wat/")
    h = body.decode("utf-8", "replace")
    for pat, lab in [(r"<title>(.*?)</title>", "title"),
                     (r"PHOTOGRAPHY", "category badge"),
                     (r"Jun 26, 2026", "date"),
                     (r"/portfolio/angkor-wat/[^\"']+\.jpg", "images")]:
        m = re.findall(pat, h)
        print("  %-16s %s" % (lab, (m if len(m) < 6 else m[:6])))

    print("\n=== STEP 7: asset details ===")
    for p in ("/avatar.png", "/og/default.png", "/og/portfolio/angkor-wat.png"):
        st, body, h = get(p)
        print("  %-34s %s  %8d B  %s" % (p, st, len(body), h.get("Content-Type", "")[:30]))

    print("\n=== STEP 8: search index (pagefind) ===")
    st, body, h = get("/pagefind/pagefind.js")
    print("  /pagefind/pagefind.js ->", st, len(body), "B")
    return 0


if __name__ == "__main__":
    sys.exit(main())
