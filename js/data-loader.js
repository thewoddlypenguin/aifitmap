var DataLoader = (function () {
  'use strict';

  // Internal cache
  var _cache = {};

  // ── Generic fetch ──
  function _load(name) {
    if (_cache[name]) return Promise.resolve(_cache[name]);
    return fetch('/data/' + name + '.json')
      .then(function (r) { if (!r.ok) throw new Error('Failed to load ' + name); return r.json(); })
      .then(function (data) { _cache[name] = data; return data; });
  }

  // ── Public API ──
  return {
    /** Load categories.json */
    loadCategories: function () { return _load('categories'); },
    /** Load tools.json */
    loadTools: function () { return _load('tools'); },
    /** Load guides.json */
    loadGuides: function () { return _load('guides'); },
    /** Load comparisons.json */
    loadComparisons: function () { return _load('comparisons'); },
    /** Load site.json */
    loadSite: function () { return _load('site'); },
    /** Load all core data in parallel */
    loadAll: function () {
      return Promise.all([
        _load('categories'),
        _load('tools'),
        _load('guides'),
        _load('comparisons'),
        _load('site')
      ]).then(function (results) {
        return {
          categories:  results[0],
          tools:       results[1],
          guides:      results[2],
          comparisons: results[3],
          site:        results[4]
        };
      });
    },

    // ── Resolvers ──
    /** Find a tool by its slug */
    resolveTool: function (slug) {
      return _load('tools').then(function (tools) {
        var match = tools.filter(function (t) { return t.slug === slug; });
        return match.length ? match[0] : null;
      });
    },
    /** Find a category by its slug */
    resolveCategory: function (slug) {
      return _load('categories').then(function (cats) {
        return cats.filter(function (c) { return c.slug === slug; })[0] || null;
      });
    },
    /** Find a guide by its slug */
    resolveGuide: function (slug) {
      return _load('guides').then(function (guides) {
        return guides.filter(function (g) { return g.slug === slug; })[0] || null;
      });
    },
    /** Find a comparison by its slug */
    resolveComparison: function (slug) {
      return _load('comparisons').then(function (comps) {
        return comps.filter(function (c) { return c.slug === slug; })[0] || null;
      });
    },
    /** Get tools belonging to a category slug */
    getToolsByCategory: function (catSlug) {
      return _load('tools').then(function (tools) {
        return tools.filter(function (t) { return t.categories.indexOf(catSlug) !== -1; });
      });
    },
    /** Get guides belonging to a category slug */
    getGuidesByCategory: function (catSlug) {
      return _load('guides').then(function (guides) {
        return guides.filter(function (g) { return g.categorySlug === catSlug; });
      });
    },

    /** Clear all cached data */
    clearCache: function () { _cache = {}; }
  };
})();
