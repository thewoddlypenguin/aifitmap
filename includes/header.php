<?php
// Derive current path for active-link detection
$_currentPath = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';

function _nav_active(string $path): string {
  global $_currentPath;
  $check = rtrim($path, '/') ?: '/';
  return ($check === $_currentPath) ? ' class="active"' : '';
}
?>

  <!-- ══════════════════════════════════════════════════
       SPONSOR BAR
  ══════════════════════════════════════════════════ -->
  <div class="sponsor-bar" role="banner">
    <div class="sponsor-bar__inner">
      <span class="sponsor-bar__badge">Featured Partner</span>
      <span>
        <strong>Notion AI</strong> — the all-in-one workspace with AI built right in.
        <a href="#partners">Learn more →</a>
      </span>
    </div>
    <button class="sponsor-bar__dismiss" aria-label="Dismiss announcement">✕</button>
  </div>

  <!-- ══════════════════════════════════════════════════
       NAVIGATION
  ══════════════════════════════════════════════════ -->
  <header>
    <nav class="nav" aria-label="Main navigation">
      <div class="container">
        <div class="nav__inner">

          <a href="/" class="nav__logo" aria-label="AI Fit Map home">
            <div class="nav__logo-mark" aria-hidden="true">
              <div class="nav__logo-dot"></div>
            </div>
            <span class="nav__logo-text">AI Fit Map</span>
          </a>

          <ul class="nav__links" role="list">
            <li><a href="/"<?php echo _nav_active('/'); ?>>Home</a></li>
            <li><a href="/tools/"<?php echo _nav_active('/tools'); ?>>AI Tools</a></li>
            <li><a href="/guides/"<?php echo _nav_active('/guides'); ?>>Guides</a></li>
            <li><a href="/about/"<?php echo _nav_active('/about'); ?>>About</a></li>
            <li><a href="/contact/"<?php echo _nav_active('/contact'); ?>>Contact</a></li>
          </ul>

          <div class="nav__actions">
            <a href="/#quiz" class="btn btn-teal" data-action="start-quiz">GET STARTED</a>
            <button class="nav__hamburger" aria-label="Open menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>

        </div>
        <nav class="nav__mobile-menu" aria-label="Mobile navigation">
          <a href="/">Home</a>
          <a href="/tools/">AI Tools</a>
          <a href="/guides/">Guides</a>
          <a href="/about/">About</a>
          <a href="/contact/">Contact</a>
          <a href="/#quiz" class="btn btn-teal btn-full" data-action="start-quiz">GET STARTED</a>
        </nav>
      </div>
    </nav>
  </header>
