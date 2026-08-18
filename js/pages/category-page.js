var CategoryPage = (function () {
  'use strict';

  /* ── /tools/ index — list all categories ── */
  function initIndex() {
    DataLoader.loadCategories().then(function (cats) {
      SEO.setAll({
        title: 'AI Tools by Category — AI Fit Map',
        description: 'Browse AI tools by category: writing, image design, productivity, learning, research, audio, planning, and more.',
        canonical: window.location.href
      });
      renderIndex(cats);
      if (typeof Analytics !== 'undefined') {
        Analytics.track('category_view', { categorySlug: 'all' });
      }
    });
  }

  function renderIndex(cats) {
    var main = document.querySelector('.main-content') || document.body;
    main.innerHTML = [
      '<div class="cat-hero">',
        '<h1>AI Tools by Category</h1>',
        '<p>Pick a category to see the best AI tools for that job.</p>',
      '</div>',
      '<div class="cat-grid">',
        cats.map(function (c) {
          return [
            '<a class="cat-card" href="/tools/' + c.slug + '/">',
              '<span class="cat-card__icon">' + (c.icon || '🤖') + '</span>',
              '<h2 class="cat-card__name">' + c.name + '</h2>',
              '<p class="cat-card__desc">' + (c.shortDescription || '') + '</p>',
            '</a>',
          ].join('');
        }).join(''),
      '</div>',
    ].join('');
  }

  function init(slug) {
    DataLoader.resolveCategory(slug).then(function (cat) {
      if (!cat) {
        document.body.innerHTML = '<h1 style="text-align:center;padding:80px 0;">Category not found</h1>';
        return;
      }
      SEO.setAll({
        title: cat.seoTitle,
        description: cat.seoDescription,
        canonical: window.location.href
      });

      DataLoader.getToolsByCategory(slug).then(function (tools) {
        // ItemList JSON-LD from tool data
        var ld = SEO.generateItemList(tools.map(function (t) {
          return { name: t.name, officialUrl: 'https://aifitmap.com/tool/' + t.slug + '/' };
        }));
        SEO.injectJsonLd(ld);

        render(cat, tools);
        if (typeof Analytics !== 'undefined') {
          Analytics.track('category_view', { categorySlug: slug });
        }
      });

      // Guides section (async fill)
      DataLoader.getGuidesByCategory(slug).then(function (guides) {
        renderGuides(guides);
      });

      // Comparisons for this category (match tools on either side)
      DataLoader.loadComparisons().then(function (comparisons) {
        renderComparisons(comparisons, slug);
      });
    });
  }

  function render(cat, tools) {
    var main = document.querySelector('.main-content') || document.body;

    var toolCards = tools.map(function (t) {
      var sponsored = t.sponsored
        ? '<span class="cat-tool-card__sponsored">' + (t.sponsoredLabel || 'Sponsored') + '</span>'
        : '';
      return [
        '<div class="cat-tool-card" data-slug="' + t.slug + '">',
          sponsored,
          '<h2>' + t.name + '</h2>',
          '<p>' + t.tagline + '</p>',
          '<span class="cat-tool-rating">★ ' + t.ratingOverall + '</span>',
          '<a href="/tool/' + t.slug + '/" class="btn btn-primary">View Tool →</a>',
        '</div>',
      ].join('');
    });

    // Insert ad_inlist_1 after the 3rd tool card (monetization slot)
    if (toolCards.length > 3) {
      toolCards.splice(3, 0, Routing.adSlot('ad_inlist_1'));
    }

    main.innerHTML = [
      '<div class="cat-hero">',
        '<h1>' + cat.name + '</h1>',
        '<p>' + cat.shortDescription + '</p>',
      '</div>',
      '<div class="cat-tools">',
        toolCards.join('') || '<p>No tools found in this category yet.</p>',
      '</div>',
      '<div class="cat-guides">',
        '<h2>Guides in this category</h2>',
        '<div class="cat-guides__list"><!-- filled by renderGuides --></div>',
      '</div>',
      '<div class="cat-comparisons">',
        '<h2>Top comparisons</h2>',
        '<div class="cat-comparisons__list"><!-- filled by renderComparisons --></div>',
      '</div>',
    ].join('');

    if (typeof Routing !== 'undefined') Routing.wireAdSlots(main);
  }

  function renderGuides(guides) {
    var list = document.querySelector('.cat-guides__list');
    if (!list) return;
    list.innerHTML = guides.length
      ? guides.map(function (g) {
          return '<div class="cat-guide-link"><a href="/guides/' + g.slug + '/">' + g.title + '</a></div>';
        }).join('')
      : '<p>No guides in this category yet.</p>';
  }

  function renderComparisons(comparisons, slug) {
    var list = document.querySelector('.cat-comparisons__list');
    if (!list) return;
    var relevant = comparisons.filter(function (c) {
      return c.toolA === slug || c.toolB === slug ||
             c.categories && c.categories.indexOf(slug) !== -1;
    }).slice(0, 3);
    list.innerHTML = relevant.length
      ? relevant.map(function (c) {
          return '<div class="cat-compare-link"><a href="/compare/' + c.slug + '/">' + c.toolA + ' vs ' + c.toolB + '</a></div>';
        }).join('')
      : '<p>No comparisons yet.</p>';
  }

  return { init: init, initIndex: initIndex };
})();
