var SEO = (function () {
  'use strict';

  function _setMeta(name, content) {
    // Update existing or create
    var el = document.querySelector('meta[name="' + name + '"], meta[property="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      if (name.indexOf('og:') === 0 || name.indexOf('twitter:') === 0) {
        el.setAttribute('property', name);
      } else {
        el.setAttribute('name', name);
      }
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function _setTitle(title) {
    document.title = title;
    // OG title
    _setMeta('og:title', title);
    _setMeta('twitter:title', title);
  }

  function _setDescription(desc) {
    _setMeta('description', desc);
    _setMeta('og:description', desc);
    _setMeta('twitter:description', desc);
  }

  function _setCanonical(url) {
    var el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', url);
  }

  function _setOgImage(url) {
    _setMeta('og:image', url);
    _setMeta('twitter:image', url);
    _setMeta('twitter:card', 'summary_large_image');
  }

  function _injectJsonLd(jsonObj) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonObj);
    document.head.appendChild(script);
  }

  return {
    /** Set page title + OG title */
    setTitle: _setTitle,
    /** Set meta description + OG description */
    setDescription: _setDescription,
    /** Set canonical URL */
    setCanonical: _setCanonical,
    /** Set OG/Twitter image */
    setOgImage: _setOgImage,
    /** Set all standard meta: title, description, canonical, ogImage */
    setAll: function (opts) {
      if (opts.title)       _setTitle(opts.title);
      if (opts.description) _setDescription(opts.description);
      if (opts.canonical)   _setCanonical(opts.canonical);
      if (opts.ogImage)     _setOgImage(opts.ogImage);
    },

    /** Inject a JSON-LD script block into <head> */
    injectJsonLd: _injectJsonLd,

    // ── JSON-LD generators ──
    /** Generate SoftwareApplication schema for a tool page */
    generateSoftwareApp: function (tool) {
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.name,
        "applicationCategory": "AI Application",
        "operatingSystem": "Web",
        "description": tool.seoDescription || tool.descriptionShort,
        "url": tool.officialUrl,
        "offers": {
          "@type": "Offer",
          "price": tool.startingPrice || "0",
          "priceCurrency": "USD"
        }
      };
    },
    /** Generate ItemList schema for a category/tool listing page */
    generateItemList: function (items) {
      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": items.map(function (item, i) {
          return {
            "@type": "ListItem",
            "position": i + 1,
            "name": item.name || item.title,
            "url": item.officialUrl || item.slug
          };
        })
      };
    },
    /** Generate Article schema for a guide */
    generateArticle: function (guide) {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": guide.title,
        "description": guide.summary,
        "dateModified": guide.updatedAt,
        "author": { "@type": "Organization", "name": "AI Fit Map" }
      };
    },
    /** Generate FAQPage schema from Q&A array */
    generateFAQPage: function (faqArray) {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqArray.map(function (item) {
          return {
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
          };
        })
      };
    }
  };
})();
