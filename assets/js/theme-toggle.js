/*
 * Light / Ayu Dark toggle.
 *
 * The palette is one attribute deep — <html data-theme="dark"> selects the Ayu
 * block in _sass/color_schemes/badgerbots.scss — so switching is a single
 * setAttribute. The choice is remembered in localStorage; with nothing stored
 * the OS preference decides.
 *
 * The attribute is applied by the inline snippet in _includes/head_custom.html,
 * which runs before first paint. This file only wires up the button.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'badgerbots-theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      var label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  function init() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    apply(currentTheme());

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        // Private browsing or blocked site data — the toggle still works for
        // this page view, it just won't be remembered.
      }
    });

    // Follow the OS while the visitor has not made an explicit choice.
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        var stored = null;
        try {
          stored = localStorage.getItem(STORAGE_KEY);
        } catch (err) {
          /* unreadable storage — treat as no stored preference */
        }
        if (!stored) apply(e.matches ? 'dark' : 'light');
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
