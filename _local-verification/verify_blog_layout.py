#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""首页 Blog 布局测试：3 篇文章 + 区块副标题 + 页脚署名（用户已自行删除）。"""
import json
import time
import urllib.error
import urllib.request

REPO = "zlhmax/zlhmax.github.io"
SHA = "767be13"
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
            runs = [x for x in (d.get("workflow_runs") or []) if x["head_sha"].startswith(SHA)]
            if runs:
                r0 = runs[0]
                if r0["status"] == "completed":
                    print("   run #%s -> %s | %s" % (r0["run_number"], r0["conclusion"], r0["html_url"]))
                    return r0["conclusion"]
                print("   [%02d] %s" % (i, r0["status"]))
            else:
                print("   [%02d] 尚未出现该 sha 的 run" % i)
        except Exception as e:
            print("   [%02d] 轮询异常: %s" % (i, e))
        time.sleep(15)
    return "timeout"


def n(h, k):
    return h.count(k)


def main():
    concl = wait_ci()
    time.sleep(10)
    ok = concl == "success"
    print("\n== 首页 Blog 布局核验 ==")

    st, home = fetch("/")
    t1, t2, t3 = n(home, "慢一点，把东西收好"), n(home, "把内容放回自己的地盘"), n(home, "我的新网站")
    sub_b, sub_p = n(home, "thoughts, my insights"), n(home, "places I&#39;ve been to and seen") + n(home, "places I've been to and seen")
    ryze, astro = n(home, "Ryze"), n(home, "powered by")
    print("   /  状态=%s" % st)
    print("      首页三篇文章卡片: 《慢一点》%d 《把内容》%d 《我的新网站》%d  %s"
          % (t1, t2, t3, "OK(满 3 条)" if min(t1, t2, t3) >= 1 else "FAIL"))
    print("      Blog 区块副标题=%d  Portfolio 区块副标题=%d  %s"
          % (sub_b, sub_p, "OK" if (sub_b >= 1 and sub_p >= 1) else "FAIL"))
    print("      页脚 'powered by'=%d  'Ryze'=%d  %s" % (astro, ryze, "OK(署名已按你意图移除)" if ryze == 0 else "CHECK"))
    ok &= st == "200" and min(t1, t2, t3) >= 1 and sub_b >= 1 and sub_p >= 1 and ryze == 0

    for slug in ("slow-down-tidy-up", "own-your-content", "my-new-site"):
        st, _ = fetch("/blog/%s/" % slug)
        print("   /blog/%-20s 状态=%s %s" % (slug + "/", st, "OK" if st == "200" else "FAIL"))
        ok &= st == "200"

    st, bl = fetch("/blog/")
    c = sum(n(bl, s) for s in ("slow-down-tidy-up", "own-your-content", "my-new-site"))
    print("   /blog/ 列表数据命中 3 篇文章: %d 次 %s" % (c, "OK" if c >= 3 else "FAIL"))
    ok &= st == "200" and c >= 3

    st, rss = fetch("/rss.xml")
    items = n(rss, "<item>")
    print("   /rss.xml 状态=%s item=%d %s" % (st, items, "OK" if items == 3 else "FAIL"))
    ok &= st == "200" and items == 3

    print("\n== 结论 ==\n   CI: %s | 核验: %s" % (concl, "全部通过 ✓" if ok else "有问题 ✗"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
