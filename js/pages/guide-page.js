var GuidePage = (function () {
  'use strict';

  /* ── /guides/ index — list all guides ── */
  function initIndex() {
    DataLoader.loadGuides().then(function (guides) {
      SEO.setAll({
        title: 'AI Guides & Tutorials — AI Fit Map',
        description: 'Learn how to choose, use, and compare AI tools with our beginner-friendly guides.',
        canonical: window.location.href
      });
      renderIndex(guides);
    });
  }

  function renderIndex(guides) {
    var main = document.querySelector('.main-content') || document.body;
    main.innerHTML = [
      '<div class="guide-hero">',
        '<h1>AI Guides & Tutorials</h1>',
        '<p>Practical, jargon-free guides to choosing and using AI tools.</p>',
      '</div>',
      '<div class="guide-list">',
        guides.map(function (g) {
          return [
            '<a class="guide-card" href="/guides/' + g.slug + '/">',
              '<h2 class="guide-card__title">' + g.title + '</h2>',
              '<p class="guide-card__summary">' + (g.summary || '') + '</p>',
              '<span class="guide-card__meta">Updated ' + (g.updatedAt || '') + '</span>',
            '</a>',
          ].join('');
        }).join(''),
      '</div>',
    ].join('');
  }

  function init(slug) {
    DataLoader.resolveGuide(slug).then(function (guide) {
      if (!guide) {
        document.body.innerHTML = '<h1 style="text-align:center;padding:80px 0;">Guide not found</h1>';
        return;
      }
      SEO.setAll({
        title: guide.seoTitle,
        description: guide.seoDescription,
        canonical: window.location.href
      });
      SEO.injectJsonLd(SEO.generateArticle(guide));
      render(guide);

      if (typeof Analytics !== 'undefined') {
        Analytics.track('guide_view', { guideSlug: guide.slug });
      }
    });
  }

  function render(guide) {
    var main = document.querySelector('.main-content') || document.body;
    main.innerHTML = [
      '<article class="guide-article">',
        '<header class="guide-header">',
          '<p class="guide-category"><a href="/tools/' + guide.categorySlug + '/">' + guide.categorySlug.replace(/-/g, ' ') + '</a></p>',
          '<h1>' + guide.title + '</h1>',
          '<p class="guide-meta">Updated ' + new Date(guide.updatedAt).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'}) + '</p>',
          '<p class="guide-summary">' + guide.summary + '</p>',
        '</header>',
        '<div class="guide-body">' + guide.bodyMarkdown.replace(/\n/g, '</p><p>') + '</div>',
        '<footer class="guide-footer">',
          '<h2>Related Tools</h2>',
          '<div class="guide-tools-list" id="guide-tools-list"><!-- filled async --></div>',
        '</footer>',
      '</article>',
    ].join('');

    // Related tool links — mandatory internal linking
    if (guide.relatedToolSlugs && guide.relatedToolSlugs.length) {
      Promise.all(guide.relatedToolSlugs.slice(0, 4).map(DataLoader.resolveTool)).then(function (tools) {
        var list = document.getElementById('guide-tools-list');
        if (!list) return;
        list.innerHTML = tools.filter(Boolean).map(function (t) {
          return [
            '<a class="guide-tool-link" href="/tool/' + t.slug + '/">',
              '<strong>' + t.name + '</strong>',
              '<span>' + t.tagline + '</span>',
            '</a>',
          ].join('');
        }).join('');
      });
    }
  }

  return { init: init, initIndex: initIndex };
})();
