#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""第二轮清理上线核验：CTA 组件/旧头像/draft 示例文。"""
import json
import time
import urllib.error
import urllib.request

REPO = "zlhmax/zlhmax.github.io"
SHA = "cae5dba"
BASE = "https://zlhmax.github.io"
UA = {"User-Agent": "hermes-verify"}


def get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def fetch(path, retries=6):
    for _ in range(retries):
        try:
            return "200", get(BASE + path)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return "404", ""
            time.sleep(4)
        except Exception:
            time.sleep(5)
    return "ERR", ""


def wait_ci():
    print("== 等待 GitHub Actions ==")
    for i in range(28):
        try:
            d = json.loads(get("https://api.github.com/repos/%s/actions/runs?per_page=5" % REPO))
            runs = d.get("workflow_runs") or []
            r0 = runs[0] if runs else None
            if r0 and r0["head_sha"].startswith(SHA):
                if r0["status"] == "completed":
                    print("   run #%s -> %s | %s" % (r0["run_number"], r0["conclusion"], r0["html_url"]))
                    return r0["conclusion"]
                print("   [%02d] %s" % (i, r0["status"]))
            else:
                print("   [%02d] 最新 run sha=%s（等待 %s）" % (i, (r0 or {}).get("head_sha", "-")[:7], SHA))
        except Exception as e:
            print("   [%02d] 轮询异常: %s" % (i, e))
        time.sleep(15)
    return "timeout"


def n(hay, needle):
    return hay.lower().count(needle.lower())


def main():
    concl = wait_ci()
    time.sleep(10)
    ok = True
    print("\n== 线上核验 ==")

    for p in ("/avatar.jpg", "/avatar.svg"):
        st, _ = fetch(p)
        print("   %-18s 状态=%s %s" % (p, st, "OK(已移除)" if st == "404" else "FAIL(仍可访问)"))
        ok &= st == "404"

    st, img = fetch("/avatar.png")
    print("   %-18s 状态=%s %s" % ("/avatar.png", st, "OK(现役头像)" if st == "200" else "FAIL"))
    ok &= st == "200"

    st, art = fetch("/blog/my-new-site/")
    a, med, cta = n(art, "王小波"), n(art, "Subscribe to Medium"), n(art, "Enjoyed this article")
    print("   %-18s 状态=%s 含'王小波'=%d 订阅框=%d CTA=%d %s"
          % ("/blog/my-new-site/", st, a, med, cta, "OK" if (st == "200" and a >= 1 and med == 0 and cta == 0) else "FAIL"))
    ok &= st == "200" and a >= 1 and med == 0 and cta == 0

    st, det = fetch("/portfolio/angkor-wat/")
    c, cta = n(det, "ryze"), n(det, "Follow on Github")
    print("   %-18s 状态=%s 署名 ryze=%d 关注按钮=%d %s"
          % ("/portfolio/angkor-wat/", st, c, cta, "OK" if (st == "200" and c == 2 and cta == 0) else "FAIL"))
    ok &= st == "200" and c == 2 and cta == 0

    st, home = fetch("/")
    print("   %-18s 状态=%s ryze=%d %s" % ("/", st, n(home, "ryze"), "OK" if n(home, "ryze") == 0 else "FAIL"))
    ok &= st == "200" and n(home, "ryze") == 0

    st, rss = fetch("/rss.xml")
    print("   %-18s 状态=%s ryze=%d %s" % ("/rss.xml", st, n(rss, "ryze"), "OK" if n(rss, "ryze") == 0 else "FAIL"))
    ok &= st == "200" and n(rss, "ryze") == 0

    print("\n== 结论 ==\n   CI: %s | 核验: %s" % (concl, "全部通过 ✓" if ok else "存在问题 ✗"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
