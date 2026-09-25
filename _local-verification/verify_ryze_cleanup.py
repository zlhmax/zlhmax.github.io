#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Ryze 清理上线核验：等 CI 完成后逐项检查线上真实内容。"""
import json
import time
import urllib.error
import urllib.request

REPO = "zlhmax/zlhmax.github.io"
SHA = "8be4b86"
BASE = "https://zlhmax.github.io"
UA = {"User-Agent": "hermes-verify"}


def get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def fetch(path, retries=6):
    """返回 (状态, 正文)；404 单独标记。"""
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
    print("== 1) 等待 GitHub Actions ==")
    for i in range(28):
        try:
            d = json.loads(get("https://api.github.com/repos/%s/actions/runs?per_page=5" % REPO))
            runs = d.get("workflow_runs") or []
            r0 = runs[0] if runs else None
            if r0 and r0["head_sha"].startswith(SHA):
                if r0["status"] == "completed":
                    print("   run #%s -> %s | %s" % (r0["run_number"], r0["conclusion"], r0["html_url"]))
                    return r0["conclusion"]
                print("   [%02d] %s (等待中…)" % (i, r0["status"]))
            else:
                print("   [%02d] 最新 run 的 sha 还不是 %s（%s）" % (i, SHA, (r0 or {}).get("head_sha", "-")[:7]))
        except Exception as e:
            print("   [%02d] 轮询异常: %s" % (i, e))
        time.sleep(15)
    return "timeout"


def count(hay, needle):
    return hay.lower().count(needle.lower())


def main():
    concl = wait_ci()
    time.sleep(10)

    print("\n== 2) 线上内容核验 ==")
    ok = True

    st, home = fetch("/")
    c = count(home, "ryze")
    print("   /                          状态=%s  ryze=%d %s" % (st, c, "OK" if c == 0 else "FAIL"))
    ok &= st == "200" and c == 0

    st, rss = fetch("/rss.xml")
    c = count(rss, "ryze")
    has_new = "我的新网站" in rss
    print("   /rss.xml                   状态=%s  ryze=%d  含新文章=%s %s"
          % (st, c, has_new, "OK" if (c == 0 and has_new) else "FAIL"))
    ok &= st == "200" and c == 0 and has_new

    st, art = fetch("/blog/my-new-site/")
    a = count(art, "王小波")
    demo = count(art, "This page demonstrates")
    ph = count(art, "placehold")
    print("   /blog/my-new-site/         状态=%s  含'王小波'=%d  演示文本=%d  占位图=%d %s"
          % (st, a, demo, ph, "OK" if (st == "200" and a >= 1 and demo == 0 and ph == 0) else "FAIL"))
    ok &= st == "200" and a >= 1 and demo == 0 and ph == 0

    st, _ = fetch("/blog/aureus-cli-automation/")
    print("   /blog/aureus-cli-automation/ 状态=%s %s" % (st, "OK(已下线)" if st == "404" else "FAIL(仍可访问)"))
    ok &= st == "404"

    st, det = fetch("/portfolio/angkor-wat/")
    c = count(det, "ryze")
    print("   /portfolio/angkor-wat/      状态=%s  页脚署名 ryze=%d %s"
          % (st, c, "OK(仅署名)" if c == 2 else "CHECK"))
    ok &= st == "200" and c == 2

    st, bl = fetch("/blog/")
    n = count(bl, "my-new-site")
    print("   /blog/                      状态=%s  文章链接=%d 篇 %s" % (st, n, "OK" if n >= 1 else "FAIL"))
    ok &= st == "200" and n >= 1

    print("\n== 3) 结论 ==")
    print("   CI: %s | 核验: %s" % (concl, "全部通过 ✓" if ok else "存在问题 ✗"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
