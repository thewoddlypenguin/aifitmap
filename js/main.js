/* ============================================================
   AI FIT MAP — main.js
   Initializes UI-layer features (nav, sponsor bar, reveal).
   Quiz chip selection and modal lifecycle → quiz-engine.js
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initSponsorBar();
    initNavScroll();
    initMobileMenu();
    initScrollReveal();
    initNavActive();

    // Initialize the quiz engine (wires homepage chips + modal)
    if (typeof QuizEngine !== 'undefined') {
      QuizEngine.init();
    }
  });

  /* ── Sponsor Bar Dismiss ── */
  function initSponsorBar() {
    var bar     = document.querySelector('.sponsor-bar');
    var dismiss = document.querySelector('.sponsor-bar__dismiss');
    if (!dismiss || !bar) return;
    dismiss.addEventListener('click', function () {
      bar.style.transition   = 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease';
      bar.style.maxHeight    = bar.offsetHeight + 'px';
      bar.style.overflow     = 'hidden';
      requestAnimationFrame(function () {
        bar.style.maxHeight    = '0';
        bar.style.opacity      = '0';
        bar.style.paddingTop   = '0';
        bar.style.paddingBottom = '0';
      });
    });
  }

  /* ── Nav shadow on scroll ── */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Menu Toggle ── */
  function initMobileMenu() {
    var hamburger  = document.querySelector('.nav__hamburger');
    var mobileMenu = document.querySelector('.nav__mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      var spans = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        var spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });
  }

  /* ── Scroll Reveal (IntersectionObserver) ── */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ── Nav Active State on Scroll ── */
  function initNavActive() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    function onScroll() {
      var scrollY  = window.scrollY + 90;
      var activeId = '';
      sections.forEach(function (section) {
        if (section.offsetTop <= scrollY) activeId = section.id;
      });
      navLinks.forEach(function (link) {
        var href = link.getAttribute('href').slice(1);
        link.classList.toggle('active', href === activeId);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

})();
