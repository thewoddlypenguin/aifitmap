/**
 * AI FIT MAP — Analytics Utility (Phase 2)
 * ─────────────────────────────────────────
 * Lightweight event tracking layer.
 * No external provider is wired in Phase 2.
 * Events are logged to console and queued in Analytics.queue[].
 *
 * To connect a real provider (GA4, Segment, Mixpanel, etc.):
 *   1. Implement Analytics.providers.push(fn) where fn(event, payload) => void
 *   2. The queue is flushed on provider registration.
 *
 * UTM parameters are captured automatically from the URL.
 */

var Analytics = (function () {
  'use strict';

  /* ── Internal State ──────────────────────────────────── */
  var _queue = [];
  var _providers = [];
  var _utmCache = null;

  /* ── UTM Capture ─────────────────────────────────────── */
  function _getUTMs() {
    if (_utmCache) return _utmCache;
    var params = new URLSearchParams(window.location.search);
    _utmCache = {
      utm_source:   params.get('utm_source')   || '',
      utm_medium:   params.get('utm_medium')   || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term:     params.get('utm_term')     || '',
      utm_content:  params.get('utm_content')  || '',
    };
    return _utmCache;
  }

  /* ── Page Context (derived from URL path) ────────────── */
  var _pageContext = null;

  /**
   * Derive { pageType, pageSlug, categorySlug, toolSlug } from the
   * current pathname. Slots in:
   *   /tools/{cat}/          → category
   *   /tool/{slug}/          → tool
   *   /guides/{slug}/        → guide
   *   /compare/{slug}/       → comparison
   *   everything else        → 'page' (home, about, disclosure…)
   */
  function _getPageContext() {
    if (_pageContext) return _pageContext;
    var path = window.location.pathname.replace(/\/+$/, '');
    var parts = path.split('/').filter(Boolean);
    var ctx = { pageType: 'page', pageSlug: '', categorySlug: '', toolSlug: '' };

    if (parts[0] === 'tools' && parts[1]) {
      ctx.pageType = 'category';
      ctx.categorySlug = parts[1];
      ctx.pageSlug = parts[1];
    } else if (parts[0] === 'tool' && parts[1]) {
      ctx.pageType = 'tool';
      ctx.toolSlug = parts[1];
      ctx.pageSlug = parts[1];
    } else if (parts[0] === 'guides' && parts[1]) {
      ctx.pageType = 'guide';
      ctx.pageSlug = parts[1];
    } else if (parts[0] === 'compare' && parts[1]) {
      ctx.pageType = 'comparison';
      ctx.pageSlug = parts[1];
    } else if (parts[0] === 'about' || parts[0] === 'contact' ||
               parts[0] === 'disclosure' || parts[0] === 'methodology' ||
               parts[0] === 'privacy' || parts[0] === 'terms') {
      ctx.pageType = parts[0];
      ctx.pageSlug = parts[0];
    }
    _pageContext = ctx;
    return ctx;
  }

  /* ── Core Track ──────────────────────────────────────── */
  /**
   * Track a user event.
   *
   * Standard events:
   *   quiz_started          { category_id, timestamp, ...utms }
   *   quiz_step_viewed      { step, question_id, timestamp }
   *   question_answered     { step, question_id, option_ids[], timestamp }
   *   quiz_completed        { answers{}, category_id, timestamp }
   *   results_viewed        { top_tool_ids[], category_id, timestamp }
   *   tool_cta_clicked      { tool_id, tool_name, position, timestamp }
   *   sponsored_cta_clicked { tool_id, tool_name, sponsor_id, timestamp }
   *   retake_quiz_clicked   { timestamp, device_type }
   *   quiz_result_click     { tool_id, tool_name, tool_slug, position, timestamp }
   *
   * Content events (Phase 3 — content expansion):
   *   category_view     { categorySlug, ...ctx }
   *   tool_view         { toolSlug, ...ctx }
   *   guide_view        { guideSlug, ...ctx }
   *   comparison_view   { comparisonSlug, ...ctx }
   *   tool_click_outbound { toolSlug, targetUrl }
   *   sponsored_click   { toolSlug, sponsorId }
   *   ad_slot_view      { slotId }
   *   ad_slot_click     { slotId }
   *
   * Every payload is auto-enriched with:
   *   pageType, pageSlug, categorySlug, toolSlug,
   *   device_type, timestamp, utm_* fields.
   *
   * @param {string} eventName
   * @param {object} payload
   */
  function track(eventName, payload) {
    var ctx = _getPageContext();
    var enriched = Object.assign(
      {},
      { event: eventName, timestamp: new Date().toISOString() },
      { device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop' },
      ctx,
      _getUTMs(),
      payload
    );

    // Console output for Phase 2 debugging
    console.groupCollapsed(
      '%c[Analytics] %c' + eventName,
      'color:#6BA07A;font-weight:700;',
      'color:#2A2623;font-weight:500;'
    );
    console.log(enriched);
    console.groupEnd();

    // Queue for later provider dispatch
    _queue.push(enriched);

    // Dispatch to any registered providers
    _providers.forEach(function (fn) {
      try { fn(eventName, enriched); }
      catch (e) { console.warn('[Analytics] Provider error:', e); }
    });

    return enriched;
  }

  /* ── Provider Registration ───────────────────────────── */
  /**
   * Register an analytics provider function.
   * The provider receives (eventName, enrichedPayload).
   * All queued events are replayed immediately on registration.
   *
   * Example (Google Analytics 4):
   *   Analytics.addProvider(function(event, payload) {
   *     gtag('event', event, payload);
   *   });
   *
   * @param {Function} providerFn
   */
  function addProvider(providerFn) {
    if (typeof providerFn !== 'function') return;
    _providers.push(providerFn);
    // Flush queue to new provider
    _queue.forEach(function (event) {
      try { providerFn(event.event, event); }
      catch (e) { console.warn('[Analytics] Provider flush error:', e); }
    });
  }

  /* ── Convenience Helpers ─────────────────────────────── */
  function getQueue() { return _queue.slice(); }
  function clearQueue() { _queue = []; }

  /* ── Public API ──────────────────────────────────────── */
  return {
    track: track,
    addProvider: addProvider,
    getQueue: getQueue,
    clearQueue: clearQueue,
  };

})();
