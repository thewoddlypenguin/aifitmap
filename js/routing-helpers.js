/**
 * AI FIT MAP — Routing Helpers
 * ────────────────────────────────────────────────────────────
 * Small utilities shared by page renderers:
 *   - Relative URL building (works from nested page dirs)
 *   - HTML escaping
 *   - Formatting helpers
 * No framework, no build step — plain IIFE like the rest.
 * ────────────────────────────────────────────────────────────
 */

var Routing = (function () {
  'use strict';

  /* ── URL helpers ─────────────────────────────────────── */
  /**
   * Build a site-root-relative URL.
   * When pages live in nested folders (e.g. /tool/chatgpt/),
   * links back to /css/style.css need the right number of ../.
   * We derive the prefix from the current pathname depth.
   */
  function _rootPrefix() {
    var path = window.location.pathname.replace(/\/+$/, '');
    var parts = path.split('/').filter(Boolean);
    // A page at /tools/writing-editing/ has depth 2 → prefix '../..'
    // A page at /tool/chatgpt/ has depth 2 → prefix '../..'
    // Homepage depth 0 → prefix ''
    // Skip the trailing segment that IS the page (index.html-ish dirs)
    return parts.map(function () { return '..'; }).join('/');
  }

  /**
   * Return a root-relative URL for a site path.
   * e.g. url('/css/style.css') → '../../css/style.css' from /tool/chatgpt/
   */
  function url(sitePath) {
    var prefix = _rootPrefix();
    var clean = String(sitePath).replace(/^\/+/, '');
    return prefix ? prefix + '/' + clean : clean;
  }

  /* ── HTML escaping ───────────────────────────────────── */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  /* ── Formatting ──────────────────────────────────────── */
  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function starRating(rating) {
    var r = Number(rating) || 0;
    var full = Math.round(r);
    var stars = '';
    for (var i = 0; i < 5; i++) {
      stars += i < full ? '★' : '☆';
    }
    return stars;
  }

  /* ── Ad slot placeholders ────────────────────────────── */
  /**
   * Renders a placeholder ad slot div. No real ad network is
   * wired yet — this is the monetization architecture shell.
   * Each slot carries data-slot-id for future ad-slot analytics.
   */
  function adSlot(slotId, options) {
    options = options || {};
    var label = options.label || 'Advertisement';
    return [
      '<div class="ad-slot" data-slot-id="' + esc(slotId) + '" role="complementary" aria-label="' + esc(label) + '">',
        '<div class="ad-slot__placeholder">',
          '<span class="ad-slot__tag">' + esc(label) + '</span>',
          '<span class="ad-slot__code">' + esc(slotId) + '</span>',
        '</div>',
      '</div>',
    ].join('');
  }

  /**
   * Wire analytics to all ad slots currently in the DOM:
   *   ad_slot_view  — when the slot scrolls into view
   *   ad_slot_click — when the placeholder is clicked
   * Uses the global Analytics module when present.
   */
  function wireAdSlots(rootEl) {
    rootEl = rootEl || document;
    var slots = rootEl.querySelectorAll('[data-slot-id]');
    if (!slots.length) return;

    slots.forEach(function (slot) {
      var slotId = slot.getAttribute('data-slot-id');
      var track = function (name) {
        if (typeof Analytics !== 'undefined') {
          Analytics.track(name, { slotId: slotId });
        }
      };

      slot.addEventListener('click', function () { track('ad_slot_click'); });

      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              track('ad_slot_view');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 });
        obs.observe(slot);
      } else {
        track('ad_slot_view');
      }
    });
  }

  /* ── Public API ──────────────────────────────────────── */
  return {
    url: url,
    esc: esc,
    formatDate: formatDate,
    starRating: starRating,
    adSlot: adSlot,
    wireAdSlots: wireAdSlots,
  };
})();
