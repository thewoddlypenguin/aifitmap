var ComparePage = (function () {
  'use strict';

  function init(slug) {
    DataLoader.resolveComparison(slug).then(function (comp) {
      if (!comp) {
        document.body.innerHTML = '<h1 style="text-align:center;padding:80px 0;">Comparison not found</h1>';
        return;
      }
      SEO.setAll({
        title: comp.seoTitle,
        description: comp.seoDescription,
        canonical: window.location.href
      });
      if (comp.faq && comp.faq.length) {
        SEO.injectJsonLd(SEO.generateFAQPage(comp.faq));
      }
      render(comp);

      if (typeof Analytics !== 'undefined') {
        Analytics.track('comparison_view', { comparisonSlug: comp.slug });
      }
    });
  }

  function render(comp) {
    var main = document.querySelector('.main-content') || document.body;
    main.innerHTML = [
      '<div class="compare-hero">',
        '<p class="compare-links"><a href="/tool/' + comp.toolA + '/">' + comp.toolA + '</a> vs <a href="/tool/' + comp.toolB + '/">' + comp.toolB + '</a></p>',
        '<h1>' + comp.toolA + ' vs ' + comp.toolB + '</h1>',
        '<p>' + comp.summary + '</p>',
      '</div>',
      '<div class="compare-table-wrap">',
        '<table class="compare-table">',
          '<thead><tr><th>Feature</th><th><a href="/tool/' + comp.toolA + '/">' + comp.toolA + '</a></th><th><a href="/tool/' + comp.toolB + '/">' + comp.toolB + '</a></th></tr></thead>',
          '<tbody>' +
            (comp.tableData || []).map(function (row) {
              return '<tr><td>' + row.feature + '</td><td>' + row.toolAValue + '</td><td>' + row.toolBValue + '</td></tr>';
            }).join('') +
          '</tbody>',
        '</table>',
      '</div>',
      '<div class="ad-slot" data-slot-id="ad_incontent_mid" role="complementary" aria-label="Advertisement">',
        '<div class="ad-slot__placeholder"><span class="ad-slot__tag">Advertisement</span><span class="ad-slot__code">ad_incontent_mid</span></div>',
      '</div>',
      '<div class="compare-winners">',
        '<h2>Winner by Use Case</h2>',
        (comp.winnerByUseCase || []).map(function (w) {
          return '<div class="compare-winner"><strong>' + w.useCase + ':</strong> ' + w.winner + ' — ' + w.note + '</div>';
        }).join(''),
      '</div>',
      comp.faq && comp.faq.length ? [
        '<div class="compare-faq">',
          '<h2>FAQs</h2>',
          comp.faq.map(function (item) {
            return '<div class="faq-item"><h3>' + item.q + '</h3><p>' + item.a + '</p></div>';
          }).join(''),
        '</div>',
      ].join('') : '',
    ].join('');

    if (typeof Routing !== 'undefined') Routing.wireAdSlots(main);
  }

  return { init: init };
})();
