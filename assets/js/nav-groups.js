/*
 * Click-to-expand for nav sections that are not pages.
 *
 * A section marked `nav_link: false` renders as a <span> rather than an <a>
 * (see _includes/components/nav/links.html), so there is nothing to click
 * into. Clicking the label instead toggles the section open or closed.
 *
 * It forwards the click to the row's own expander button rather than
 * toggling the class directly, so just-the-docs' handler stays the single
 * owner of that state and keeps `aria-pressed` in step.
 */
(function () {
  'use strict';

  document.addEventListener('click', function (e) {
    var label = e.target.closest && e.target.closest('.nav-list-label');
    if (!label) return;

    var item = label.closest('.nav-list-item');
    var expander = item && item.querySelector(':scope > .nav-list-expander');
    if (!expander) return;

    // The forwarded click re-enters this listener with the button as its
    // target, which matches no label, so there is no loop.
    expander.click();
  });
})();
