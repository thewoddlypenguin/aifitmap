var ToolPage = (function () {
  'use strict';

  function init(slug) {
    DataLoader.resolveTool(slug).then(function (tool) {
      if (!tool) {
        document.body.innerHTML = '<h1 style="text-align:center;padding:80px 0;">Tool not found</h1>';
        return;
      }
      SEO.setAll({
        title: tool.seoTitle,
        description: tool.seoDescription,
        canonical: window.location.href
      });
      SEO.injectJsonLd(SEO.generateSoftwareApp(tool));
      if (tool.faq && tool.faq.length) {
        SEO.injectJsonLd(SEO.generateFAQPage(tool.faq));
      }
      render(tool);

      if (typeof Analytics !== 'undefined') {
        Analytics.track('tool_view', { toolSlug: tool.slug });
      }
    });
  }

  function render(tool) {
    var main = document.querySelector('.main-content') || document.body;

    // Category breadcrumbs (parent category links — mandatory internal linking)
    var catLinks = (tool.categories || []).map(function (catSlug) {
      return '<a href="/tools/' + catSlug + '/">' + catSlug.replace(/-/g, ' ') + '</a>';
    }).join(' · ');

    main.innerHTML = [
      '<div class="tool-hero">',
        '<div class="tool-hero__info">',
          '<p class="tool-breadcrumbs">' + catLinks + '</p>',
          '<h1>' + tool.name + '</h1>',
          '<p class="tool-provider">by ' + tool.provider + '</p>',
          '<p class="tool-tagline">' + tool.tagline + '</p>',
          '<div class="tool-rating">',
            '<span class="tool-rating__overall">★ ' + tool.ratingOverall + '</span>',
            '<span class="tool-rating__detail">Ease: ' + tool.ratingEaseOfUse + ' | Quality: ' + tool.ratingOutputQuality + ' | Value: ' + tool.ratingValue + ' | Trust: ' + tool.ratingTrust + ' | Speed: ' + tool.ratingSpeed + '</span>',
          '</div>',
          tool.sponsored ? '<div class="tool-sponsored-badge">' + (tool.sponsoredLabel || 'Sponsored') + '</div>' : '',
        '</div>',
        '<div class="tool-hero__actions">',
          '<a href="' + tool.officialUrl + '" class="btn btn-primary outbound-link" data-tool-slug="' + tool.slug + '" target="_blank" rel="noopener nofollow sponsored">Visit Official Site →</a>',
          '<a href="' + (tool.affiliateUrl || tool.officialUrl) + '" class="btn btn-outline outbound-link" data-tool-slug="' + tool.slug + '" target="_blank" rel="noopener nofollow">' + (tool.ctaLabel || 'Try for Free') + '</a>',
        '</div>',
      '</div>',
      '<div class="tool-body">',
        '<section class="tool-description">',
          '<h2>Overview</h2>',
          '<p>' + tool.descriptionLong + '</p>',
        '</section>',
        '<div class="ad-slot" data-slot-id="ad_incontent_mid" role="complementary" aria-label="Advertisement">',
          '<div class="ad-slot__placeholder"><span class="ad-slot__tag">Advertisement</span><span class="ad-slot__code">ad_incontent_mid</span></div>',
        '</div>',
        '<section class="tool-details">',
          '<div class="tool-col">',
            '<h3>Best For</h3>',
            '<ul>' + (tool.bestFor || []).map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>',
          '</div>',
          '<div class="tool-col">',
            '<h3>Not Ideal For</h3>',
            '<ul>' + (tool.notIdealFor || []).map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>',
          '</div>',
        '</section>',
        '<section class="tool-pros-cons">',
          '<div class="tool-col tool-pros">',
            '<h3>Pros</h3>',
            '<ul>' + (tool.pros || []).map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>',
          '</div>',
          '<div class="tool-col tool-cons">',
            '<h3>Cons</h3>',
            '<ul>' + (tool.cons || []).map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>',
          '</div>',
        '</section>',
        '<section class="tool-features">',
          '<h2>Features</h2>',
          '<ul>' + (tool.features || []).map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>',
        '</section>',
        '<section class="tool-integrations">',
          '<h2>Integrations</h2>',
          '<ul>' + (tool.integrations || []).map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>',
        '</section>',
        tool.faq && tool.faq.length ? [
          '<section class="tool-faq">',
            '<h2>Frequently Asked Questions</h2>',
            tool.faq.map(function (item) {
              return '<div class="faq-item"><h3>' + item.q + '</h3><p>' + item.a + '</p></div>';
            }).join(''),
          '</section>',
        ].join('') : '',
        '<div class="tool-related">',
          '<h2>Related Tools</h2>',
          '<div class="tool-related__list" id="tool-related-list"><!-- filled async --></div>',
        '</div>',
        '<div class="tool-guides">',
          '<h2>Related Guides</h2>',
          '<div class="tool-guides__list" id="tool-guides-list"><!-- filled async --></div>',
        '</div>',
        '<div class="tool-comparisons">',
          '<h2>Compare</h2>',
          '<div class="tool-comparisons__list" id="tool-comparisons-list"><!-- filled async --></div>',
        '</div>',
      '</div>',
    ].join('');

    // Related tools (up to 3) — mandatory internal links
    if (tool.relatedToolSlugs && tool.relatedToolSlugs.length) {
      Promise.all(tool.relatedToolSlugs.slice(0, 3).map(DataLoader.resolveTool)).then(function (tools) {
        var list = document.getElementById('tool-related-list');
        if (!list) return;
        list.innerHTML = tools.filter(Boolean).map(function (t) {
          return [
            '<a class="tool-related-card" href="/tool/' + t.slug + '/">',
              '<strong>' + t.name + '</strong>',
              '<span>' + t.tagline + '</span>',
            '</a>',
          ].join('');
        }).join('');
      });
    }

    // Related guides (up to 2)
    DataLoader.loadGuides().then(function (guides) {
      var list = document.getElementById('tool-guides-list');
      if (!list) return;
      var related = guides.filter(function (g) {
        return (g.relatedToolSlugs || []).indexOf(tool.slug) !== -1;
      }).slice(0, 2);
      list.innerHTML = related.length
        ? related.map(function (g) {
            return '<a class="tool-guide-link" href="/guides/' + g.slug + '/">' + g.title + '</a>';
          }).join('')
        : '<p>No related guides yet.</p>';
    });

    // Comparisons involving this tool
    DataLoader.loadComparisons().then(function (comparisons) {
      var list = document.getElementById('tool-comparisons-list');
      if (!list) return;
      var relevant = comparisons.filter(function (c) {
        return c.toolA === tool.slug || c.toolB === tool.slug;
      });
      list.innerHTML = relevant.length
        ? relevant.map(function (c) {
            var other = c.toolA === tool.slug ? c.toolB : c.toolA;
            return '<a class="tool-compare-link" href="/compare/' + c.slug + '/">' + tool.name + ' vs ' + other + ' →</a>';
          }).join('')
        : '<p>No comparisons yet.</p>';
    });

    // Wire outbound clicks → tool_click_outbound / sponsored_click
    main.querySelectorAll('.outbound-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (typeof Analytics === 'undefined') return;
        if (tool.sponsored) {
          Analytics.track('sponsored_click', {
            toolSlug: tool.slug,
            sponsorId: tool.slug,
          });
        }
        Analytics.track('tool_click_outbound', {
          toolSlug: tool.slug,
          targetUrl: link.getAttribute('href'),
        });
      });
    });

    if (typeof Routing !== 'undefined') Routing.wireAdSlots(main);
  }

  return { init: init };
})();
