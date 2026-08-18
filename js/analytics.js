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
   *
   * @param {string} eventName
   * @param {object} payload
   */
  function track(eventName, payload) {
    var enriched = Object.assign(
      {},
      { event: eventName, timestamp: new Date().toISOString() },
      { device_type: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop' },
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
