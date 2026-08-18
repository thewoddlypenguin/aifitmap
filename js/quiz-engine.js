/**
 * AI FIT MAP — Quiz Engine (Phase 2)
 * ────────────────────────────────────────────────────────────
 * Manages the full quiz lifecycle:
 *   - Modal open/close with animations
 *   - Step-by-step question rendering
 *   - Front-end state persistence across steps
 *   - Back/Next navigation
 *   - Tag-based scoring algorithm
 *   - Results screen with mock tool matching
 *   - Analytics event emission throughout
 *
 * Public API (window.QuizEngine):
 *   QuizEngine.init()    — call once on DOMContentLoaded
 *   QuizEngine.open()    — open the quiz modal
 *   QuizEngine.close()   — close the modal
 *
 * Dependencies (must load before this file):
 *   analytics.js, quiz-config.js
 * ────────────────────────────────────────────────────────────
 */

var QuizEngine = (function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────────────────── */
  var state = {
    isOpen:      false,
    currentStep: 0,         // index into QUIZ_CONFIG.steps
    direction:   1,         // 1 = forward, -1 = backward
    answers:     {},        // { questionId: [optionId, ...] }
    category:    null,      // { id, label, icon, tags[] }
    results:     null,      // scored results array
    phase:       'quiz',    // 'quiz' | 'results'
    lastQuizStep: 0,        // last step index before completing (for "Adjust Preferences")
  };

  /* ─────────────────────────────────────────────────────────
     DOM REFERENCES (cached after modal is built)
  ───────────────────────────────────────────────────────── */
  var modal, overlay, container, body;
  var progressFill, stepLabel, backBtn, nextBtn;

  /* ─────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────── */
  function init() {
    _buildModal();
    _wireHomepage();

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.isOpen) close();
    });
  }

  /* ─────────────────────────────────────────────────────────
     BUILD MODAL DOM
  ───────────────────────────────────────────────────────── */
  function _buildModal() {
    var el = document.createElement('div');
    el.id = 'quiz-modal';
    el.className = 'quiz-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'AI Tool Finder Quiz');
    el.setAttribute('aria-hidden', 'true');

    el.innerHTML = [
      '<div class="quiz-modal__overlay" id="qm-overlay"></div>',
      '<div class="quiz-modal__container" id="qm-container" role="document">',
        '<div class="quiz-modal__header">',
          '<div class="quiz-modal__brand">',
            '<div class="quiz-modal__brand-dot"></div>',
            '<span>AI Fit Map</span>',
          '</div>',
          '<div class="quiz-modal__progress-wrap">',
            '<div class="quiz-modal__progress-bar">',
              '<div class="quiz-modal__progress-fill" id="qm-progress-fill"></div>',
            '</div>',
            '<span class="quiz-modal__step-label" id="qm-step-label">Step 2 of 6</span>',
          '</div>',
          '<button class="quiz-modal__close" id="qm-close" aria-label="Close quiz" type="button">✕</button>',
        '</div>',
        '<div class="quiz-modal__body" id="qm-body"></div>',
        '<div class="quiz-modal__footer">',
          '<button class="quiz-modal__back-btn" id="qm-back" type="button">← Back to Home</button>',
          '<span class="quiz-modal__footer-trust">Free · No sign-up required</span>',
          '<button class="quiz-modal__next-btn btn btn-primary" id="qm-next" type="button">Next →</button>',
        '</div>',
      '</div>',
    ].join('');

    document.body.appendChild(el);

    modal       = el;
    overlay     = el.querySelector('#qm-overlay');
    container   = el.querySelector('#qm-container');
    body        = el.querySelector('#qm-body');
    progressFill = el.querySelector('#qm-progress-fill');
    stepLabel   = el.querySelector('#qm-step-label');
    backBtn     = el.querySelector('#qm-back');
    nextBtn     = el.querySelector('#qm-next');

    overlay.addEventListener('click', close);
    el.querySelector('#qm-close').addEventListener('click', close);
    backBtn.addEventListener('click', _goBack);
    nextBtn.addEventListener('click', _goNext);
  }

  /* ─────────────────────────────────────────────────────────
     WIRE HOMEPAGE ELEMENTS
  ───────────────────────────────────────────────────────── */
  function _wireHomepage() {
    var heroChips = document.querySelectorAll('.quiz-option-chip');
    var startBtn  = document.getElementById('hero-start-btn');
    var validationEl = document.getElementById('hero-validation');

    // ── Chip selection ─────────────────────────────────────
    heroChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        // Deselect all
        heroChips.forEach(function (c) {
          c.classList.remove('selected');
          c.setAttribute('aria-pressed', 'false');
        });

        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');

        // Resolve category from config
        var catId = chip.dataset.value;
        var catDef = (CATEGORY_CONFIG || []).find(function (c) { return c.id === catId; });
        state.category = catDef ? catDef : {
          id:    catId,
          label: chip.querySelector('.quiz-option-chip__label').textContent.trim(),
          icon:  chip.querySelector('.quiz-option-chip__icon').textContent.trim(),
          tags:  [catId],
        };

        // Enable CTA
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.classList.remove('btn-disabled');
        }

        // Clear validation
        if (validationEl) validationEl.style.display = 'none';

        Analytics.track('quiz_option_selected', {
          step: 1,
          question_id: 'category',
          option_ids: [catId],
        });
      });

      // Keyboard accessibility
      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chip.click();
        }
      });
    });

    // ── Start-quiz triggers ────────────────────────────────
    var triggers = document.querySelectorAll('[data-action="start-quiz"]');
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        // Hero chips — enforce selection
        var isHeroTrigger = btn.id === 'hero-start-btn';
        if (isHeroTrigger && !state.category) {
          if (validationEl) {
            validationEl.style.display = 'flex';
            validationEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          var card = document.querySelector('.quiz-card');
          if (card) {
            card.classList.add('shake');
            setTimeout(function () { card.classList.remove('shake'); }, 600);
          }
          return;
        }

        open();
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────────────────── */
  function open() {
    if (state.isOpen) return;

    // Reset quiz state fresh each time
    state.isOpen      = true;
    state.phase       = 'quiz';
    state.currentStep = 0;
    state.answers     = {};
    state.results     = null;
    state.direction   = 1;

    document.body.style.overflow = 'hidden';
    modal.removeAttribute('aria-hidden');
    modal.classList.add('open');

    _renderStep();

    Analytics.track('quiz_started', {
      category_id:    state.category ? state.category.id : null,
      category_label: state.category ? state.category.label : null,
    });
  }

  function close() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    setTimeout(function () {
      state.isOpen = false;
    }, 320);
  }

  /* ─────────────────────────────────────────────────────────
     NAVIGATION
  ───────────────────────────────────────────────────────── */
  function _goNext() {
    if (state.phase === 'results') {
      close();
      return;
    }

    var step    = QUIZ_CONFIG.steps[state.currentStep];
    var answers = state.answers[step.id] || [];

    if (answers.length === 0) {
      _showStepValidation();
      return;
    }

    Analytics.track('question_answered', {
      step:        step.step,
      question_id: step.id,
      option_ids:  answers,
    });

    var isLast = state.currentStep >= QUIZ_CONFIG.steps.length - 1;

    if (isLast) {
      state.phase       = 'results';
      state.lastQuizStep = state.currentStep; // save for "Adjust Preferences"
      state.results     = _computeResults();
      _renderResults();

      Analytics.track('quiz_completed', {
        answers:     state.answers,
        category_id: state.category ? state.category.id : null,
      });

      Analytics.track('results_viewed', {
        top_tool_ids: state.results.slice(0, 3).map(function (r) { return r.tool.id; }),
        category_id:  state.category ? state.category.id : null,
      });
    } else {
      state.direction = 1;
      state.currentStep++;
      _renderStep();
    }
  }

  function _goBack() {
    if (state.phase === 'results') {
      // Go back to last quiz step
      state.phase       = 'quiz';
      state.currentStep = QUIZ_CONFIG.steps.length - 1;
      state.direction   = -1;
      _updateFooterForStep();
      _renderStep();
      return;
    }

    if (state.currentStep === 0) {
      close();
      return;
    }

    state.direction = -1;
    state.currentStep--;
    _renderStep();
  }

  /* ─────────────────────────────────────────────────────────
     STEP RENDERING
  ───────────────────────────────────────────────────────── */
  function _renderStep() {
    var step         = QUIZ_CONFIG.steps[state.currentStep];
    var totalModal   = QUIZ_CONFIG.steps.length;      // steps in modal
    var stepNumInFlow = state.currentStep + 2;         // step 1 is homepage
    var progress     = ((state.currentStep + 1) / totalModal) * 100;

    // Progress bar & label
    progressFill.style.width = progress + '%';
    stepLabel.textContent    = 'Step ' + stepNumInFlow + ' of ' + (totalModal + 1);

    _updateFooterForStep();

    // Saved answers for this step
    var existing = state.answers[step.id] || [];
    var isMulti  = step.type === 'multi';

    // Category breadcrumb
    var breadcrumb = '';
    if (state.category) {
      breadcrumb = [
        '<div class="qm-breadcrumb">',
          '<span class="qm-breadcrumb__icon">' + state.category.icon + '</span>',
          '<span>' + _esc(state.category.label) + '</span>',
          '<span class="qm-breadcrumb__sep">›</span>',
          '<span>Step ' + stepNumInFlow + ' of ' + (totalModal + 1) + '</span>',
        '</div>',
      ].join('');
    }

    // Options HTML
    var optionsHTML = step.options.map(function (opt) {
      var sel = existing.indexOf(opt.id) > -1;
      return [
        '<button class="qm-option' + (sel ? ' selected' : '') + '"',
        ' data-option-id="' + _esc(opt.id) + '"',
        ' aria-pressed="' + sel + '"',
        ' type="button">',
          '<div class="qm-option__icon" aria-hidden="true">' + opt.icon + '</div>',
          '<div class="qm-option__text">',
            '<span class="qm-option__label">' + _esc(opt.label) + '</span>',
            opt.sub ? '<span class="qm-option__sub">' + _esc(opt.sub) + '</span>' : '',
          '</div>',
          '<div class="qm-option__check' + (sel ? '' : ' hidden') + '" aria-hidden="true">✓</div>',
        '</button>',
      ].join('');
    }).join('');

    // Multi-select hint
    var multiHint = isMulti
      ? '<p class="qm-step__multi-hint">Pick up to ' + (step.maxSelect || 3) + '</p>'
      : '';

    var html = [
      '<div class="qm-step" data-step="' + state.currentStep + '">',
        breadcrumb,
        '<h2 class="qm-step__question">' + _esc(step.question) + '</h2>',
        step.hint ? '<p class="qm-step__hint">' + _esc(step.hint) + '</p>' : '',
        multiHint,
        '<div class="qm-options' + (isMulti ? ' qm-options--multi' : '') + '"',
          ' role="' + (isMulti ? 'group' : 'radiogroup') + '"',
          ' aria-label="' + _esc(step.question) + '">',
          optionsHTML,
        '</div>',
        '<div class="qm-validation" id="qm-step-validation" style="display:none;">',
          'Please select at least one option to continue.',
        '</div>',
      '</div>',
    ].join('');

    // Animate transition
    _transitionBody(html, function () {
      // Wire option clicks
      body.querySelectorAll('.qm-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          _handleOptionClick(btn, step);
        });
      });
    });

    Analytics.track('quiz_step_viewed', {
      step:        step.step,
      question_id: step.id,
    });
  }

  function _updateFooterForStep() {
    if (state.phase === 'results') {
      backBtn.textContent    = '← Retake Quiz';
      nextBtn.textContent    = 'Close';
      nextBtn.className      = 'quiz-modal__next-btn btn btn-secondary';
      return;
    }

    var isFirst = state.currentStep === 0;
    var isLast  = state.currentStep === QUIZ_CONFIG.steps.length - 1;

    backBtn.textContent = isFirst ? '← Back to Home' : '← Back';
    nextBtn.textContent = isLast  ? 'See My Results →' : 'Next →';
    nextBtn.className   = 'quiz-modal__next-btn btn btn-primary';
  }

  /* ─────────────────────────────────────────────────────────
     OPTION CLICK HANDLER
  ───────────────────────────────────────────────────────── */
  function _handleOptionClick(btn, step) {
    var optionId  = btn.dataset.optionId;
    var isMulti   = step.type === 'multi';
    var maxSelect = step.maxSelect || 1;

    if (!state.answers[step.id]) state.answers[step.id] = [];

    if (isMulti) {
      var idx = state.answers[step.id].indexOf(optionId);

      if (idx > -1) {
        // Deselect
        state.answers[step.id].splice(idx, 1);
        btn.classList.remove('selected');
        btn.setAttribute('aria-pressed', 'false');
        var ck = btn.querySelector('.qm-option__check');
        if (ck) ck.classList.add('hidden');

      } else if (state.answers[step.id].length < maxSelect) {
        // Select
        state.answers[step.id].push(optionId);
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
        var ck2 = btn.querySelector('.qm-option__check');
        if (ck2) ck2.classList.remove('hidden');

      } else {
        // Max reached — visual feedback
        body.querySelectorAll('.qm-option:not(.selected)').forEach(function (o) {
          o.classList.add('shake-subtle');
          setTimeout(function () { o.classList.remove('shake-subtle'); }, 400);
        });
        return;
      }

    } else {
      // Single select
      body.querySelectorAll('.qm-option').forEach(function (o) {
        o.classList.remove('selected');
        o.setAttribute('aria-pressed', 'false');
        var ck = o.querySelector('.qm-option__check');
        if (ck) ck.classList.add('hidden');
      });

      state.answers[step.id] = [optionId];
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
      var ck3 = btn.querySelector('.qm-option__check');
      if (ck3) ck3.classList.remove('hidden');
    }

    // Hide validation on selection
    var val = document.getElementById('qm-step-validation');
    if (val) val.style.display = 'none';
  }

  function _showStepValidation() {
    var val = document.getElementById('qm-step-validation');
    if (val) val.style.display = 'flex';

    var opts = body.querySelector('.qm-options');
    if (opts) {
      opts.classList.add('shake');
      setTimeout(function () { opts.classList.remove('shake'); }, 600);
    }
  }

  /* ─────────────────────────────────────────────────────────
     SCORING ENGINE
  ───────────────────────────────────────────────────────── */
  function _computeResults() {
    // 1. Collect all user tags (category + all selected option tags)
    var userTags = {};

    if (state.category && state.category.tags) {
      state.category.tags.forEach(function (t) { userTags[t] = 1; });
    }

    QUIZ_CONFIG.steps.forEach(function (step) {
      var selectedIds = state.answers[step.id] || [];
      selectedIds.forEach(function (optId) {
        var opt = step.options.find(function (o) { return o.id === optId; });
        if (opt && opt.tags) {
          opt.tags.forEach(function (tag) {
            userTags[tag] = (userTags[tag] || 0) + (opt.weight || 1);
          });
        }
      });
    });

    // 2. Score each tool
    var catId = state.category ? state.category.id : null;

    var scored = TOOL_CATALOG.map(function (tool) {
      var score = tool.baseScore || 50;

      tool.tags.forEach(function (tag) {
        if (userTags[tag] !== undefined) {
          score += 7 * userTags[tag];  // weighted by option weight
        }
      });

      // Category bonus
      if (catId && tool.matchReasonsByCategory && tool.matchReasonsByCategory[catId]) {
        score += 12;
      }

      // Cap at 99
      score = Math.min(99, Math.round(score));

      return {
        tool:    tool,
        score:   score,
        reasons: _getMatchReasons(tool, userTags, catId),
      };
    });

    // 3. Sort highest first
    scored.sort(function (a, b) { return b.score - a.score; });

    return scored;
  }

  var _tagReasonMap = {
    simple:            'Designed to be approachable — no prior AI experience needed',
    beginner_friendly: 'Great starting point with a gentle, guided interface',
    free_ok:           'Has a genuinely useful free tier — no credit card required',
    mobile:            'Works great on your phone or tablet, any time',
    efficient:         'Designed to save time on repetitive tasks',
    saves_time:        'Cuts hours of manual work per week for most users',
    quality_output:    'Known for producing high-quality, polished output',
    privacy:           'Strong privacy practices and responsible data handling',
    secure:            'Built with a privacy-first, safety-focused approach',
    integrations:      'Connects smoothly with other tools you already use',
    workflow:          'Fits naturally into your existing daily workflow',
    educational:       'Explains its reasoning — great for learning while you work',
    detailed:          'Provides thorough, in-depth responses when you need them',
    professional:      'Trusted by professionals for polished, reliable results',
    organizing:        'Keeps everything organized and easy to find later',
    sources:           'Backs answers with links to real, verifiable sources',
  };

  function _getMatchReasons(tool, userTags, catId) {
    var reasons = [];

    // 1. Category reason (always first)
    if (catId && tool.matchReasonsByCategory && tool.matchReasonsByCategory[catId]) {
      reasons.push(tool.matchReasonsByCategory[catId]);
    }

    // 2. Tag-based reasons from matchReasonsByTag if available
    var tagPriority = Object.keys(userTags).sort(function (a, b) {
      return (userTags[b] || 0) - (userTags[a] || 0);
    });

    tagPriority.forEach(function (tag) {
      if (reasons.length >= 3) return;
      var toolTagReason = tool.matchReasonsByTag && tool.matchReasonsByTag[tag];
      if (toolTagReason && tool.tags.indexOf(tag) > -1) {
        if (reasons.indexOf(toolTagReason) === -1) {
          reasons.push(toolTagReason);
        }
        return;
      }
      // Fall back to generic tag reason
      var generic = _tagReasonMap[tag];
      if (generic && tool.tags.indexOf(tag) > -1 && reasons.indexOf(generic) === -1) {
        reasons.push(generic);
      }
    });

    return reasons.slice(0, 3);
  }

  /* ─────────────────────────────────────────────────────────
     RESULTS RENDERING
  ───────────────────────────────────────────────────────── */
  function _renderResults() {
    progressFill.style.width = '100%';
    stepLabel.textContent    = 'Your results are ready ✨';
    _updateFooterForStep();  // sets "← Retake Quiz" / "Close"

    var organic   = state.results.filter(function (r) { return !r.tool.sponsored; }).slice(0, 3);
    var sponsored = state.results.find(function (r) { return r.tool.sponsored; }) || null;

    var catLabel = state.category ? state.category.label : 'your goals';

    /* ── Top result cards ── */
    var cardsHTML = organic.map(function (result, idx) {
      var score = result.score;
      var tier  = score >= 85 ? 'best' : score >= 70 ? 'great' : 'good';

      return [
        '<div class="qm-result-card" data-tool-id="' + _esc(result.tool.id) + '">',
          idx === 0 ? '<div class="qm-result-card__top-badge">⭐ Best Match</div>' : '',
          '<div class="qm-result-card__header">',
            '<div>',
              '<div class="qm-result-card__name">' + _esc(result.tool.name) + '</div>',
              '<div class="qm-result-card__provider">' + _esc(result.tool.provider) + '</div>',
              '<div class="qm-result-card__tagline">' + _esc(result.tool.tagline) + '</div>',
            '</div>',
            '<div class="qm-match-score qm-match-score--' + tier + '" aria-label="' + score + '% match">',
              '<span class="qm-match-score__num">' + score + '%</span>',
              '<span class="qm-match-score__label">match</span>',
            '</div>',
          '</div>',
          '<p class="qm-result-card__desc">' + _esc(result.tool.description) + '</p>',
          result.reasons.length ? [
            '<div class="qm-result-card__reasons">',
              '<div class="qm-result-card__reasons-label">Why this fits you:</div>',
              '<ul class="qm-result-card__reasons-list">',
                result.reasons.map(function (r) { return '<li>' + _esc(r) + '</li>'; }).join(''),
              '</ul>',
            '</div>',
          ].join('') : '',
          '<div class="qm-result-card__footer">',
            '<span class="qm-result-card__price">' +
              (result.tool.hasFree ? '🎁 ' : '') + _esc(result.tool.priceFrom) +
            '</span>',
            '<button class="btn btn-primary qm-tool-cta" type="button"',
              ' data-tool-id="' + _esc(result.tool.id) + '"',
              ' data-tool-name="' + _esc(result.tool.name) + '"',
              ' data-position="' + (idx + 1) + '">',
              _esc(result.tool.ctaLabel) + ' →',
            '</button>',
          '</div>',
        '</div>',
      ].join('');
    }).join('');

    /* ── Sponsored card ── */
    var sponsoredHTML = '';
    if (sponsored) {
      var sp = sponsored.tool;
      sponsoredHTML = [
        '<div class="qm-results__sponsored-section">',
          '<div class="qm-results__sponsored-label">Also worth checking out</div>',
          '<div class="qm-result-card qm-result-card--sponsored" data-tool-id="' + _esc(sp.id) + '">',
            '<div class="qm-sponsored-badge">⭐ ' + _esc(sp.sponsoredLabel || 'Featured Partner') + '</div>',
            '<div class="qm-result-card__header" style="margin-top:8px;">',
              '<div>',
                '<div class="qm-result-card__name">' + _esc(sp.name) + '</div>',
                '<div class="qm-result-card__provider">' + _esc(sp.provider) + '</div>',
                '<div class="qm-result-card__tagline">' + _esc(sp.tagline) + '</div>',
              '</div>',
            '</div>',
            '<p class="qm-result-card__desc">' + _esc(sp.description) + '</p>',
            '<div class="qm-result-card__footer">',
              '<span class="qm-result-card__price">' + _esc(sp.priceFrom) + '</span>',
              '<button class="btn btn-outline qm-sponsored-cta" type="button"',
                ' data-tool-id="' + _esc(sp.id) + '"',
                ' data-tool-name="' + _esc(sp.name) + '"',
                ' data-sponsor-id="' + _esc(sp.id) + '">',
                _esc(sp.ctaLabel) + ' →',
              '</button>',
            '</div>',
          '</div>',
        '</div>',
      ].join('');
    }

    /* ── Full results HTML ── */
    var html = [
      '<div class="qm-results" id="qm-results">',
        '<div class="qm-results__header">',
          '<span class="qm-results__emoji">🎯</span>',
          '<h2 class="qm-results__title">Your AI Tool Matches</h2>',
          '<p class="qm-results__sub">Based on your interest in <strong>' + _esc(catLabel) + '</strong> and your preferences, here are your top picks.</p>',
        '</div>',
        '<div class="qm-results__grid">' + cardsHTML + '</div>',
        sponsoredHTML,
        '<div class="qm-results__actions">',
          '<button class="btn btn-secondary" id="qm-retake" type="button">↩ Retake Quiz</button>',
          '<button class="btn btn-outline" id="qm-adjust" type="button">✎ Adjust Preferences</button>',
          '<button class="btn btn-outline" id="qm-browse" type="button">Browse All Tools</button>',
        '</div>',
      '</div>',
    ].join('');

    _transitionBody(html, function () {
      /* Wire tool CTAs → real tool pages */
      body.querySelectorAll('.qm-tool-cta').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tool = _findToolById(btn.dataset.toolId);
          Analytics.track('quiz_result_click', {
            tool_id:   btn.dataset.toolId,
            tool_name: btn.dataset.toolName,
            tool_slug: tool ? tool.slug : btn.dataset.toolId,
            position:  parseInt(btn.dataset.position, 10),
          });
          Analytics.track('tool_cta_clicked', {
            tool_id:   btn.dataset.toolId,
            tool_name: btn.dataset.toolName,
            position:  parseInt(btn.dataset.position, 10),
          });
          if (tool && tool.slug) {
            window.location.href = '/tool/' + tool.slug + '/';
          }
        });
      });

      /* Wire sponsored CTA → tool page */
      body.querySelectorAll('.qm-sponsored-cta').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tool = _findToolById(btn.dataset.toolId);
          Analytics.track('sponsored_cta_clicked', {
            tool_id:    btn.dataset.toolId,
            tool_name:  btn.dataset.toolName,
            sponsor_id: btn.dataset.sponsorId,
          });
          Analytics.track('quiz_result_click', {
            tool_id:   btn.dataset.toolId,
            tool_name: btn.dataset.toolName,
            tool_slug: tool ? tool.slug : btn.dataset.toolId,
            position:  4,
          });
          if (tool && tool.slug) {
            window.location.href = '/tool/' + tool.slug + '/';
          }
        });
      });

      /* Retake */
      var retakeBtn = body.querySelector('#qm-retake');
      if (retakeBtn) {
        retakeBtn.addEventListener('click', function () {
          Analytics.track('retake_quiz_clicked', {});
          state.currentStep = 0;
          state.phase       = 'quiz';
          state.answers     = {};
          state.results     = null;
          state.direction   = -1;
          state.lastQuizStep = 0;
          _renderStep();
        });
      }

      /* Adjust Preferences — go back to last step preserving answers */
      var adjustBtn = body.querySelector('#qm-adjust');
      if (adjustBtn) {
        adjustBtn.addEventListener('click', function () {
          state.phase       = 'quiz';
          state.results     = null;
          state.currentStep = state.lastQuizStep;
          state.direction   = -1;
          _renderStep();
        });
      }

      /* Browse all */
      var browseBtn = body.querySelector('#qm-browse');
      if (browseBtn) {
        browseBtn.addEventListener('click', function () {
          close();
          var exploreEl = document.getElementById('explore');
          if (exploreEl) {
            setTimeout(function () {
              exploreEl.scrollIntoView({ behavior: 'smooth' });
            }, 320);
          }
        });
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     BODY TRANSITION
  ───────────────────────────────────────────────────────── */
  function _transitionBody(html, afterRender) {
    var exitX = state.direction > 0 ? '-20px' : '20px';
    var enterX = state.direction > 0 ? '20px' : '-20px';

    body.style.transition = 'opacity 0.14s ease, transform 0.14s ease';
    body.style.opacity    = '0';
    body.style.transform  = 'translateX(' + exitX + ')';

    setTimeout(function () {
      body.innerHTML      = html;
      body.style.transform = 'translateX(' + enterX + ')';
      body.style.transition = 'none';

      // Force reflow
      body.getBoundingClientRect(); // eslint-disable-line

      body.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      body.style.opacity    = '1';
      body.style.transform  = 'translateX(0)';

      // Scroll body to top on each new step
      body.scrollTop = 0;

      if (typeof afterRender === 'function') afterRender();
    }, 160);
  }

  /* ─────────────────────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────────────────────── */
  function _esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  /* Look up a tool from the catalog (TOOL_CATALOG) by its id */
  function _findToolById(id) {
    if (typeof TOOL_CATALOG === 'undefined') return null;
    var matches = TOOL_CATALOG.filter(function (t) { return t.id === id; });
    return matches.length ? matches[0] : null;
  }

  /* ─────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────── */
  return {
    init:  init,
    open:  open,
    close: close,
  };

})();
