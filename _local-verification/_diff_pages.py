import urllib.request, re, difflib, ssl, io

ctx = ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25, context=ctx) as r:
        return r.read().decode("utf-8","replace")

for route in ["/", "/blog/aureus-cli-automation/"]:
    a = get("http://localhost:4321"+route)
    b = get("https://ryze.pages.dev"+route)
    print("="*70)
    print("ROUTE", route, "| local", len(a), "| live", len(b))
    sa = re.sub(r"\s+"," ", a).strip()
    sb = re.sub(r"\s+"," ", b).strip()
    print("normalized equal:", sa == sb)
    if sa != sb:
        sm = difflib.SequenceMatcher(None, sa, sb)
        for tag,i1,i2,j1,j2 in sm.get_opcodes():
            if tag != "equal":
                print(f"  [{tag}] local={sa[max(0,i1-70):i2+70]!r}")
                print(f"          live ={sb[max(0,j1-70):j2+70]!r}")
