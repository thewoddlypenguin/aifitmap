#!/usr/bin/env python3
"""Generate route-ready page shells for AI Fit Map from /data JSON files.

Usage: python scripts/generate_shells.py
Idempotent — regenerates all shells from the data layer.
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

# ── Read data ──
def load(name):
    with open(DATA / name, encoding="utf-8") as f:
        return json.load(f)

categories = load("categories.json")
tools = load("tools.json")
guides = load("guides.json")
comparisons = load("comparisons.json")

SITE_URL = "https://aifitmap.com"

# ── Shell template ──
def shell(title, description, canonical_path, css_path, page_js, extra_head=""):
    """Build a page shell. css_path/page_js are root-relative (e.g. /css/style.css)."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <link rel="canonical" href="{SITE_URL}{canonical_path}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css" />
  {extra_head}
</head>
<body>

  <header>
    <nav class="nav" aria-label="Main navigation">
      <div class="container">
        <div class="nav__inner">
          <a href="/" class="nav__logo" aria-label="AI Fit Map home">
            <div class="nav__logo-mark" aria-hidden="true"><div class="nav__logo-dot"></div></div>
            <span class="nav__logo-text">AI Fit Map</span>
          </a>
          <ul class="nav__links" role="list">
            <li><a href="/">Home</a></li>
            <li><a href="/tools/">AI Tools</a></li>
            <li><a href="/guides/">Guides</a></li>
            <li><a href="/about/">About</a></li>
            <li><a href="/contact/">Contact</a></li>
          </ul>
          <div class="nav__actions">
            <a href="/#quiz" class="btn btn-teal" data-action="start-quiz">GET STARTED</a>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <main class="main-content">
    {page_js}
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a href="/" class="nav__logo" aria-label="AI Fit Map home" style="display:inline-flex; margin-bottom:12px;">
            <div class="nav__logo-mark" aria-hidden="true"><div class="nav__logo-dot"></div></div>
            <span class="nav__logo-text" style="color:#fff;">AI Fit Map</span>
          </a>
          <p class="footer__tagline">Helping everyday people find the right AI tools — matched to how they think, work, and live. No jargon. Just the right fit.</p>
        </div>
        <div>
          <h3 class="footer__col-title">AI Tools</h3>
          <ul class="footer__links" role="list">
            <li><a href="/tools/writing-editing/">Writing &amp; Editing</a></li>
            <li><a href="/tools/image-design/">Image &amp; Design</a></li>
            <li><a href="/tools/productivity-work/">Productivity &amp; Work</a></li>
            <li><a href="/tools/learning-research/">Learning &amp; Research</a></li>
            <li><a href="/tools/audio-voice/">Audio &amp; Voice</a></li>
            <li><a href="/tools/">View All</a></li>
          </ul>
        </div>
        <div>
          <h3 class="footer__col-title">Company</h3>
          <ul class="footer__links" role="list">
            <li><a href="/about/">About Us</a></li>
            <li><a href="/methodology/">Our Approach</a></li>
            <li><a href="/guides/">Guides &amp; Reviews</a></li>
            <li><a href="/contact/">Partner With Us</a></li>
            <li><a href="/disclosure/">Disclosure</a></li>
            <li><a href="/contact/">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 class="footer__col-title">Support</h3>
          <ul class="footer__links" role="list">
            <li><a href="/#how-it-works">How It Works</a></li>
            <li><a href="/tools/">Find a Tool</a></li>
            <li><a href="/guides/">Guides</a></li>
            <li><a href="/contact/">Help Center</a></li>
            <li><a href="/contact/">Submit a Tool</a></li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">© 2024 AI Fit Map. All rights reserved.</p>
        <nav class="footer__bottom-links" aria-label="Legal links">
          <a href="/privacy/">Privacy Policy</a>
          <a href="/terms/">Terms of Use</a>
          <a href="/disclosure/">Affiliate Disclosure</a>
          <a href="/contact/">Cookie Settings</a>
        </nav>
      </div>
    </div>
  </footer>

  <script src="/js/analytics.js"></script>
  <script src="/js/data-loader.js"></script>
  <script src="/js/routing-helpers.js"></script>
  <script src="/js/seo.js"></script>
  <script src="/js/quiz-config.js"></script>
  <script src="/js/quiz-engine.js"></script>
  <script src="/js/pages/category-page.js"></script>
  <script src="/js/pages/tool-page.js"></script>
  <script src="/js/pages/guide-page.js"></script>
  <script src="/js/pages/compare-page.js"></script>
  <script src="/js/main.js"></script>
</body>
</html>
"""


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  ✓ {path.relative_to(ROOT)}")


# ── Utility pages (static content, no JS renderer) ──
# Note: /about/ is hand-authored with full content — not generated.
UTILITY_PAGES = [
    {
        "dir": "contact",
        "title": "Contact AI Fit Map – AI Fit Map",
        "description": "Questions, feedback, or partnership inquiries — get in touch with the AI Fit Map team.",
    },
    {
        "dir": "disclosure",
        "title": "Affiliate & Sponsored Disclosure – AI Fit Map",
        "description": "How AI Fit Map makes money: affiliate links and sponsored placements, clearly labeled. Our recommendations are never paid for.",
    },
    {
        "dir": "methodology",
        "title": "Our Review Methodology – AI Fit Map",
        "description": "How AI Fit Map reviews, rates, and recommends AI tools: our scoring system, testing process, and editorial standards.",
    },
    {
        "dir": "privacy",
        "title": "Privacy Policy – AI Fit Map",
        "description": "How AI Fit Map collects, uses, and protects your personal information.",
    },
    {
        "dir": "terms",
        "title": "Terms of Use – AI Fit Map",
        "description": "The terms and conditions that govern your use of the AI Fit Map website.",
    },
]


def main():
    # ── Category hub pages ──
    print("Categories:")
    for cat in categories:
        html = shell(
            title=f"{cat['name']} AI Tools — AI Fit Map",
            description=cat["seoDescription"],
            canonical_path=f"/tools/{cat['slug']}/",
            css_path="/css/category.css",
            page_js=f"<!-- Category hub rendered by CategoryPage.init('{cat['slug']}') -->",
            extra_head='  <link rel="stylesheet" href="/css/category.css" />',
        )
        write(ROOT / "tools" / cat["slug"] / "index.html", html)

    # ── Tool detail pages ──
    print("Tools:")
    for tool in tools:
        html = shell(
            title=tool["seoTitle"],
            description=tool["seoDescription"],
            canonical_path=f"/tool/{tool['slug']}/",
            css_path="/css/tool.css",
            page_js=f"<!-- Tool page rendered by ToolPage.init('{tool['slug']}') -->",
            extra_head='  <link rel="stylesheet" href="/css/tool.css" />',
        )
        write(ROOT / "tool" / tool["slug"] / "index.html", html)

    # ── Guide pages ──
    print("Guides:")
    for guide in guides:
        html = shell(
            title=guide["seoTitle"],
            description=guide["seoDescription"],
            canonical_path=f"/guides/{guide['slug']}/",
            css_path="/css/guide.css",
            page_js=f"<!-- Guide article rendered by GuidePage.init('{guide['slug']}') -->",
            extra_head='  <link rel="stylesheet" href="/css/guide.css" />',
        )
        write(ROOT / "guides" / guide["slug"] / "index.html", html)

    # ── Comparison pages ──
    print("Comparisons:")
    for comp in comparisons:
        html = shell(
            title=comp["seoTitle"],
            description=comp["seoDescription"],
            canonical_path=f"/compare/{comp['slug']}/",
            css_path="/css/compare.css",
            page_js=f"<!-- Comparison rendered by ComparePage.init('{comp['slug']}') -->",
            extra_head='  <link rel="stylesheet" href="/css/compare.css" />',
        )
        write(ROOT / "compare" / comp["slug"] / "index.html", html)

    # ── Utility pages ──
    print("Utility pages:")
    for page in UTILITY_PAGES:
        html = shell(
            title=page["title"],
            description=page["description"],
            canonical_path=f"/{page['dir']}/",
            css_path="/css/style.css",
            page_js="<!-- Static page: content lives in HTML -->",
            extra_head="",
        )
        write(ROOT / page["dir"] / "index.html", html)

    # ── sitemap.xml (generated from data layer) ──
    print("Sitemap:")
    urls = [
        ("", "home"),
        ("/tools/", "category index"),
        ("/guides/", "guide index"),
    ]
    for cat in categories:
        urls.append((f"/tools/{cat['slug']}/", "category"))
    for tool in tools:
        urls.append((f"/tool/{tool['slug']}/", "tool"))
    for guide in guides:
        urls.append((f"/guides/{guide['slug']}/", "guide"))
    for comp in comparisons:
        urls.append((f"/compare/{comp['slug']}/", "comparison"))
    for page in UTILITY_PAGES:
        urls.append((f"/{page['dir']}/", "utility"))
    urls.append(("/about/", "utility"))

    sitemap_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for path, _ in urls:
        sitemap_lines.append(
            f'  <url><loc>{SITE_URL}{path}</loc></url>'
        )
    sitemap_lines.append('</urlset>')
    write(ROOT / "sitemap.xml", "\n".join(sitemap_lines) + "\n")

    print("\nDone. All shells generated.")


if __name__ == "__main__":
    main()
