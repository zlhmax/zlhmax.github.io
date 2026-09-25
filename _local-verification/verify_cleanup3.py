#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""第三轮：校验页脚空导航容器已消失（博客页）且作品页导航仍在。"""
import json
import time
import urllib.error
import urllib.request

REPO = "zlhmax/zlhmax.github.io"
SHA = "370677d"
BASE = "https://zlhmax.github.io"
UA = {"User-Agent": "hermes-verify"}
BOX = 'border border-border p-6 mt-10'


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
                print("   [%02d] 该 sha 的 run 尚未出现" % i)
        except Exception as e:
            print("   [%02d] 轮询异常: %s" % (i, e))
        time.sleep(15)
    return "timeout"


def main():
    concl = wait_ci()
    time.sleep(10)
    ok = concl == "success"
    print("\n== 线上核验 ==")

    st, blog = fetch("/blog/my-new-site/")
    nb = blog.count(BOX)
    print("   /blog/my-new-site/   状态=%s 空导航容器=%d 次 (期望 0) %s"
          % (st, nb, "OK" if nb == 0 else "FAIL"))
    ok &= st == "200" and nb == 0

    st, pf = fetch("/portfolio/angkor-wat/")
    np_ = pf.count(BOX)
    nn = pf.count("previous") + pf.count(">next<") + pf.count("next</span>")
    print("   /portfolio/angkor-wat/ 状态=%s 导航容器=%d 次 (期望 1) 上下篇=%d %s"
          % (st, np_, nn, "OK" if (np_ == 1 and nn >= 1) else "FAIL"))
    ok &= st == "200" and np_ == 1 and nn >= 1

    st, det = fetch("/portfolio/angkor-wat/")
    print("   /portfolio/angkor-wat/ 页脚署名 ryze=%d (期望 2) %s"
          % (det.lower().count("ryze"), "OK" if det.lower().count("ryze") == 2 else "FAIL"))
    ok &= det.lower().count("ryze") == 2

    print("\n== 结论 ==\n   CI: %s | 核验: %s" % (concl, "全部通过 ✓" if ok else "存在问题 ✗"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
