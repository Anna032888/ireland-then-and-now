/**
 * The "in this section" marker.
 *
 * Every long-form page opens with a rail down its side listing that page's
 * sections. This keeps the green dot on the one you are actually reading: the
 * dot slides to the entry as its heading crosses the reading line, follows you
 * back up when you scroll up, and the entry itself goes green and bold.
 *
 * It also makes clicking an entry land where it says it will. The jump is the
 * browser's, but the page grows underneath it as the photographs further down
 * load, so it stops short of what it aimed at; see `watchLanding`.
 *
 * It is a plain script rather than part of the React bundle on purpose. The
 * static export is the copy that gets published, and it ships no framework —
 * `scripts/export-static.tsx` copies this file into the export verbatim, the
 * same way it copies `styles.css`, so the two builds cannot drift apart.
 *
 * With scripting off nothing is lost but the sliding: the first section is
 * marked current in the markup the server sends, and every entry is still an
 * anchor that jumps to its heading.
 */
(function () {
	"use strict";

	var RAIL = "[data-side-menu]";
	var LINK = ".side-menu__link";
	var MARKER = ".side-menu__marker";
	/** Set on <html> once the dot has been placed, which is what reveals it. */
	var READY = "data-side-menu-spy";

	var frame = 0;
	var shown = null;

	function rail() {
		return document.querySelector(RAIL);
	}

	/**
	 * The rail's entries and the headings they point at, read fresh every pass.
	 * The app swaps both when you move from one section page to the next, so
	 * holding on to them here would leave the dot following the last page.
	 */
	function pairs() {
		var list = rail();
		if (!list) return [];
		var found = [];
		var links = list.querySelectorAll(LINK);
		for (var i = 0; i < links.length; i++) {
			var id = (links[i].getAttribute("href") || "").slice(1);
			var heading = id ? document.getElementById(id) : null;
			if (heading) found.push({ link: links[i], heading: heading });
		}
		return found;
	}

	/**
	 * Where "the section you are reading" is decided: a line across the page,
	 * a little over a quarter of the way down the room the sticky header leaves.
	 * A heading becomes current as it crosses the line downwards and stops being
	 * current as it crosses back upwards, which is what makes the dot travel
	 * both ways. The line sits well below the height a clicked heading lands at
	 * (see `scroll-margin-top` in site.css), so the entry you clicked is always
	 * the one reported as current.
	 */
	function readingLine() {
		var header = document.querySelector(".site-header");
		var top = header ? header.getBoundingClientRect().bottom : 0;
		if (!(top > 0)) top = 0;
		return top + Math.max(28, (window.innerHeight - top) * 0.28);
	}

	/** Put the dot on an entry and mark that entry current. */
	function apply(link) {
		var all = pairs();
		var marker = document.querySelector(MARKER);
		if (!marker || !all.length) return;

		for (var i = 0; i < all.length; i++) {
			if (all[i].link === link) all[i].link.setAttribute("aria-current", "true");
			else all[i].link.removeAttribute("aria-current");
		}

		// The dot column is the first thing in the row — the entry's own 5px dot,
		// which the 11px marker centres over and hides.
		marker.style.setProperty("--ie-spy-x", link.offsetLeft + 2.5 + "px");
		marker.style.setProperty("--ie-spy-y", link.offsetTop + link.offsetHeight / 2 + "px");
		document.documentElement.setAttribute(READY, "");

		shown = link;
	}

	function update(force) {
		frame = 0;
		var all = pairs();
		if (!all.length) {
			shown = null;
			return;
		}

		var pick = all[0];
		// At the foot of the page the last section is the one you are reading,
		// even when it is too short for its heading to reach the line.
		if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) {
			pick = all[all.length - 1];
		} else {
			var line = readingLine();
			for (var i = 0; i < all.length; i++) {
				if (all[i].heading.getBoundingClientRect().top <= line) pick = all[i];
			}
		}

		if (!force && shown === pick.link) return;
		apply(pick.link);
	}

	/** How far below the top of the viewport a heading is meant to sit. */
	function gap(heading) {
		var margin = parseFloat(getComputedStyle(heading).scrollMarginTop);
		return margin > 0 ? margin : 0;
	}

	/**
	 * Watch a heading the browser has just jumped to, and aim again if it landed
	 * short.
	 *
	 * The jump itself stays the browser's job — this only watches where it ends
	 * up. On a long page it ends up wrong: the photographs further down carry
	 * `loading="lazy"` and have no height until they load, so the page grows
	 * underneath the animation and the heading finishes well below the line it
	 * was aimed at. Each time the scroll comes to rest and the heading is still
	 * off, scroll the difference. Stop the moment the reader takes over, or
	 * after a few seconds, so this can never fight a real scroll.
	 */
	var watching = null;

	function watchLanding(heading) {
		var lastY = -1;
		var still = 0;
		var tries = 0;
		var timer;

		// One at a time: clicking a second entry while the first is still being
		// aimed at would leave the two corrections pulling against each other.
		if (watching) watching();

		function stop() {
			clearInterval(timer);
			window.removeEventListener("wheel", stop);
			window.removeEventListener("touchstart", stop);
			window.removeEventListener("keydown", stop);
			if (watching === stop) watching = null;
		}

		watching = stop;

		function check() {
			tries++;
			var y = window.pageYOffset;
			still = y === lastY ? still + 1 : 0;
			lastY = y;

			// Still travelling, or out of patience.
			if (still < 2 || tries > 30) {
				if (tries > 30) stop();
				return;
			}

			var off = heading.getBoundingClientRect().top - gap(heading);
			if (Math.abs(off) < 16) return stop();
			window.scrollTo({ top: window.pageYOffset + off, behavior: "smooth" });
			still = 0;
		}

		window.addEventListener("wheel", stop, { passive: true });
		window.addEventListener("touchstart", stop, { passive: true });
		window.addEventListener("keydown", stop);
		timer = setInterval(check, 120);
	}

	function schedule() {
		if (frame) return;
		frame = requestAnimationFrame(function () {
			update(false);
		});
	}

	/** A re-measure: the rail may have re-wrapped, or the page changed height. */
	function remeasure() {
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(function () {
			update(true);
		});
	}

	window.addEventListener("scroll", schedule, { passive: true });
	window.addEventListener("resize", remeasure);
	window.addEventListener("hashchange", schedule);
	// Web fonts land after first paint and move every row in the rail.
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
	if (window.ResizeObserver) new ResizeObserver(remeasure).observe(document.body);

	// An entry clicked in the rail, or a link from anywhere else that arrives on
	// a heading, gets the landing watched. The browser's own jump is left alone:
	// it still writes the #hash and still glides.
	document.addEventListener("click", function (event) {
		if (event.defaultPrevented || event.button) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		var link = event.target && event.target.closest ? event.target.closest(LINK) : null;
		var menu = rail();
		if (!link || !menu || !menu.contains(link)) return;
		var id = (link.getAttribute("href") || "").slice(1);
		var heading = id ? document.getElementById(id) : null;
		if (heading) watchLanding(heading);
	});

	var arrived = false;

	function start() {
		if (!pairs().length) return false;
		update(false);
		if (!arrived && location.hash.length > 1) {
			arrived = true;
			var heading = document.getElementById(location.hash.slice(1));
			if (heading) watchLanding(heading);
		}
		return true;
	}

	if (!start()) {
		// In the app this script runs before React has mounted, so the rail is
		// not in the document yet. In the export it is already there and the
		// call above finds it. Wait for it rather than give up — but do not watch
		// the whole document forever on the pages that have no rail at all.
		var watcher = new MutationObserver(function () {
			if (start()) watcher.disconnect();
		});
		watcher.observe(document.documentElement, { childList: true, subtree: true });
		setTimeout(function () {
			watcher.disconnect();
		}, 15000);
	}
})();
