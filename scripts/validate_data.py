"""Validate cross-references across the data layer."""
import json
import re
import sys

ROOT = "."

def load(name):
    with open(f"{ROOT}/data/{name}.json", encoding="utf-8") as f:
        return json.load(f)

ok = True

# 1. Data files parse + item counts
for f in ["categories", "tools", "guides", "comparisons", "site"]:
    try:
        d = load(f)
        kind = len(d) if isinstance(d, list) else "object"
        print(f"[OK] {f}.json -> {kind}")
    except Exception as e:
        ok = False
        print(f"[FAIL] {f}.json -> {e}")

# 2. Every category slug referenced by tools exists
cats = {c["slug"] for c in load("categories")}
tools = load("tools")
bad = [(t["slug"], c) for t in tools for c in t["categories"] if c not in cats]
print("[OK] all tool->category refs valid" if not bad else f"[FAIL] bad refs: {bad}")
ok = ok and not bad

# 3. Quiz config slugs all exist in tools.json
qc = open("js/quiz-config.js", encoding="utf-8").read()
slugs = re.findall(r"slug: '([^']+)'", qc)
data_slugs = {t["slug"] for t in tools}
missing = [s for s in slugs if s not in data_slugs]
print(f"[OK] quiz slugs ({len(slugs)}) all in data layer" if not missing else f"[FAIL] missing: {missing}")
ok = ok and not missing

# 4. Shell dirs exist for every tool/category/guide/comparison
import os
for t in tools:
    p = f"tool/{t['slug']}/index.html"
    if not os.path.exists(p):
        ok = False
        print(f"[FAIL] missing shell: {p}")
for c in cats:
    p = f"tools/{c}/index.html"
    if not os.path.exists(p):
        ok = False
        print(f"[FAIL] missing shell: {p}")
for g in load("guides"):
    p = f"guides/{g['slug']}/index.html"
    if not os.path.exists(p):
        ok = False
        print(f"[FAIL] missing shell: {p}")
for comp in load("comparisons"):
    p = f"compare/{comp['slug']}/index.html"
    if not os.path.exists(p):
        ok = False
        print(f"[FAIL] missing shell: {p}")
print("[OK] all shells exist" if ok else "[FAIL] missing shells")

sys.exit(0 if ok else 1)
