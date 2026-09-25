# -*- coding: utf-8 -*-
"""Verify: Portfolio -> Travel label rename + daily-blog category fix.

Two layers: (1) GitHub Actions CI for the local HEAD, (2) live site assertions.
"""
import json
import subprocess
import sys
import time
import urllib.request

REPO = "zlhmax/zlhmax.github.io"
BASE = "https://zlhmax.github.io"
LOCAL = r"D:\Myblog\ryze"


def http(url, accept="text/html"):
    req = urllib.request.Request(url, headers={"User-Agent": "verify-bot", "Accept": accept})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.status, r.read().decode("utf-8", "replace")


def api(url):
    _, body = http(url, accept="application/vnd.github+json")
    return json.loads(body)


def sha():
    return subprocess.check_output(["git", "-C", LOCAL, "rev-parse", "HEAD"], text=True).strip()


def wait_ci(target, timeout_s=420):
    t0 = time.time()
    last = ""
    while time.time() - t0 < timeout_s:
        try:
            runs = api(f"https://api.github.com/repos/{REPO}/actions/runs?per_page=20")
        except Exception as exc:  # noqa: BLE001
            last = f"api error {exc}"
            time.sleep(12)
            continue
        for r in runs.get("workflow_runs", []):
            if r["head_sha"] == target:
                if r["status"] == "completed":
                    return r["run_number"], r["conclusion"]
                last = f"run#{r['run_number']} {r['status']}"
        time.sleep(12)
    return None, f"timeout ({last})"


CHECKS = []


def chk(name, cond, detail=""):
    CHECKS.append((name, bool(cond), detail))


def main():
    target = sha()
    print(f"[ci] waiting for SHA {target[:7]} ...")
    run_no, concl = wait_ci(target)
    print(f"[ci] run#{run_no} -> {concl}")
    chk("CI completed success", concl == "success", f"run#{run_no} {concl}")

    try:
        st_p, page = http(f"{BASE}/portfolio/")
    except Exception as exc:  # noqa: BLE001
        st_p, page = 0, ""
        chk("/portfolio/ 200", False, str(exc))
    chk("/portfolio/ 200", st_p == 200)
    chk("title = Travel - lhZhang", "<title>Travel - lhZhang</title>" in page)
    chk("h1 Travel present", ">Travel<" in page)
    chk("no visible 'Portfolio'", ">Portfolio<" not in page)
    chk("meta desc travel-flavoured", "旅拍" in page)

    st_h, home = http(f"{BASE}/")
    chk("/ 200", st_h == 200)
    chk("nav shows Travel", ">Travel<" in home)
    chk("nav no longer lowercase 'portfolio'", ">portfolio<" not in home)
    chk("href stays /portfolio (no 404)", 'href="/portfolio"' in home)
    chk("no /Travel href created", 'href="/Travel"' not in home)

    st_d, detail = http(f"{BASE}/portfolio/angkor-wat/")
    chk("detail URL /portfolio/angkor-wat/ 200", st_d == 200)
    chk("detail page ok (has gallery text)", "Angkor" in detail or "吴哥" in detail)

    st_b, post = http(f"{BASE}/blog/slow-down-tidy-up/")
    chk("rebuilt post /blog/slow-down-tidy-up/ 200", st_b == 200)
    chk("category 'daily blog' rendered", "daily blog" in post.lower())

    st_r, rss = http(f"{BASE}/rss.xml")
    chk("/rss.xml 200", st_r == 200)
    chk("rss has 3 items", rss.count("<item>") == 3, f"items={rss.count('<item>')}")

    ok = sum(1 for _, c, _ in CHECKS if c)
    print("\n=== RESULTS ===")
    for name, cond, detail in CHECKS:
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}" + (f"  ({detail})" if detail else ""))
    print(f"\n  {ok}/{len(CHECKS)} passed")
    return 0 if ok == len(CHECKS) else 1


if __name__ == "__main__":
    sys.exit(main())
