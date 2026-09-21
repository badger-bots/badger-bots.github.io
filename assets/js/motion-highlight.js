/*
 * Sliding hover highlight — a vanilla port of Archive's MotionHighlight
 * (../archive/frontend/src/ui/MotionHighlight.tsx).
 *
 * A single rounded element springs from item to item as the pointer moves
 * between them, instead of each item snapping its own background on and off.
 *
 * Why one element rather than a class per row:
 *  - It avoids the flicker of two elements briefly coexisting during a swap.
 *  - It avoids the highlight painting *over* a neighbouring item's text, since
 *    each item would otherwise be its own stacking context.
 *
 * The element sits behind the items (z-index -1 inside an isolated wrapper).
 * On first hover it lands on the target and fades in; after that it springs
 * between items; on leaving the group it fades out in place.
 */
(function () {
  'use strict';

  // Matches the HIGHLIGHT_SPRING transition in MotionHighlight.tsx.
  var STIFFNESS = 350;
  var DAMPING = 35;
  var MASS = 1;

  // Below this, the spring is close enough to rest that stepping it further
  // would not change a rendered pixel.
  var REST_DELTA = 0.1;
  var REST_SPEED = 0.1;

  function createHighlight(group, itemSelector, resolveTarget, opts) {
    var el = document.createElement('div');
    el.className = 'ui-motion-highlight';
    el.setAttribute('aria-hidden', 'true');
    group.insertBefore(el, group.firstChild);

    // Current and target geometry. `cur` is what is painted; `target` is where
    // the spring is pulling towards.
    var cur = { top: 0, left: 0, width: 0, height: 0 };
    var target = { top: 0, left: 0, width: 0, height: 0 };
    var vel = { top: 0, left: 0, width: 0, height: 0 };
    var keys = ['top', 'left', 'width', 'height'];

    var visible = false;
    var frame = null;
    var lastTime = 0;

    function paint() {
      el.style.transform = 'translate(' + cur.left + 'px, ' + cur.top + 'px)';
      el.style.width = cur.width + 'px';
      el.style.height = cur.height + 'px';
    }

    function step(now) {
      // Clamp dt so a backgrounded tab doesn't integrate one enormous step
      // and fling the highlight past its target.
      var dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      var moving = false;
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var delta = cur[k] - target[k];
        var force = -STIFFNESS * delta - DAMPING * vel[k];
        vel[k] += (force / MASS) * dt;
        cur[k] += vel[k] * dt;

        if (Math.abs(cur[k] - target[k]) > REST_DELTA || Math.abs(vel[k]) > REST_SPEED) {
          moving = true;
        } else {
          cur[k] = target[k];
          vel[k] = 0;
        }
      }

      paint();
      frame = moving ? requestAnimationFrame(step) : null;
    }

    function start() {
      if (frame === null) {
        lastTime = performance.now();
        frame = requestAnimationFrame(step);
      }
    }

    // Where `left: 0; top: 0` actually puts the highlight, as an offset from
    // the group's border box. This is NOT a constant: an absolutely
    // positioned child resolves against its containing block, and engines
    // differ on whether that is the group's border box or its padding box —
    // Chrome measures from the border box even though the group is padded.
    // Rather than assume, measure it once (transform cleared so only the
    // static position shows) and cache it; the resize handler clears the
    // cache, which also covers padding changing at a breakpoint.
    var cachedOrigin = null;

    function originOffset() {
      if (cachedOrigin) return cachedOrigin;
      var saved = el.style.transform;
      el.style.transform = 'none';
      var er = el.getBoundingClientRect();
      var gr = group.getBoundingClientRect();
      cachedOrigin = { x: er.left - gr.left, y: er.top - gr.top };
      el.style.transform = saved;
      return cachedOrigin;
    }

    function moveTo(item) {
      if (!item) {
        el.style.opacity = '0';
        visible = false;
        return;
      }

      // Bounds relative to the group, via rects so this works through nested,
      // positioned or overflow-clipped ancestors (the nav's collapsible
      // sub-lists are both). When the group itself scrolls, children lay out
      // against its unscrolled origin, so the scroll offset is added back.
      var gr = group.getBoundingClientRect();
      var r = item.getBoundingClientRect();
      var origin = originOffset();
      target.top = r.top - gr.top - origin.y + group.scrollTop;
      target.left = r.left - gr.left - origin.x + group.scrollLeft;
      target.width = r.width;
      target.height = r.height;

      if (visible) {
        start();
      } else {
        // First hover: land on the target at once. Springing in from the old
        // spot would glide the highlight across the whole list.
        for (var i = 0; i < keys.length; i++) {
          cur[keys[i]] = target[keys[i]];
          vel[keys[i]] = 0;
        }
        paint();
      }

      el.style.opacity = '1';
      visible = true;
    }

    // The item the highlight currently sits on, so a reflow can re-measure it
    // without having to re-derive it from the pointer.
    var activeItem = null;

    group.addEventListener('mouseover', function (e) {
      var item = resolveTarget(e.target.closest(itemSelector));
      if (item) {
        activeItem = item;
        moveTo(item);
      }
    });

    group.addEventListener('mouseleave', function () {
      activeItem = null;
      moveTo(null);
    });

    // Expanding or collapsing a section reflows the rows around the pointer.
    // Re-measure the row the highlight is on so it doesn't strand itself at
    // the old offset.
    group.addEventListener('click', function () {
      requestAnimationFrame(function () {
        if (visible && activeItem && activeItem.isConnected) moveTo(activeItem);
      });
    });

    // The highlight is positioned in pixels, so it has to be re-measured when
    // the layout reflows underneath it.
    window.addEventListener('resize', function () {
      cachedOrigin = null;
      activeItem = null;
      moveTo(null);
    });

    // Groups whose contents are re-rendered wholesale (the search results)
    // lose the highlight element along with everything else. Put it back and
    // reset, so the next hover starts cleanly on the new rows.
    if (opts && opts.watch && window.MutationObserver) {
      new MutationObserver(function () {
        if (el.parentNode !== group) {
          group.insertBefore(el, group.firstChild);
          activeItem = null;
          visible = false;
          el.style.opacity = '0';
        }
      }).observe(group, { childList: true });
    }
  }

  function init() {
    // --- Left panel -------------------------------------------------------
    // The group is the nav itself. The site title is deliberately excluded:
    // it sits in the top bar, a gap away from the panel, so a highlight
    // springing up to it from a nav row would cross empty space.
    var nav = document.getElementById('site-nav');
    if (nav) {
      nav.classList.add('ui-motion-highlight-group');
      createHighlight(nav, '.nav-list-link, .nav-list-expander', function (el) {
        if (!el) return null;
        // The expander chevron is a sibling of the link, absolutely
        // positioned over the row's edge. Hovering it should highlight the
        // whole row, so it resolves to its own item's link.
        if (el.classList.contains('nav-list-expander')) {
          var item = el.closest('.nav-list-item');
          return item ? item.querySelector(':scope > .nav-list-link') : null;
        }
        return el;
      });
    }

    // --- Search results ---------------------------------------------------
    // just-the-docs.js clears #search-results with `innerHTML = ''` on every
    // keystroke, which takes the highlight element with it. `onDetached`
    // re-inserts it, so the group survives each re-render.
    var results = document.getElementById('search-results');
    if (results) {
      results.classList.add('ui-motion-highlight-group');
      createHighlight(results, '.search-result', function (el) { return el; }, { watch: true });
    }
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
