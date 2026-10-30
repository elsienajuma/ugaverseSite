// Buganda Palace tour page.
//   - The game (a separate Vercel project) is NOT loaded with the page. Pressing "Play the tour" opens a popup window and creates the
//     iframe inside it, because the game is a 21-24 MB download and the press is a deliberate tap (helps sound and the iPhone motion
//     permission). Closing the popup removes the game again; the page behind it is locked while the popup is open, so the game
//     never fights the page for scrolling.
//   - The popup is sized like the Daddy's House fullscreen tour: a centred window on a dark overlay that keeps the page behind it still.
//     The popup closes ONLY with its own X button (and the phone Back button / swipe-back): not on a tap outside the game, and not on Esc.
//   - The phone Back button (Android) and the swipe-back gesture (iPhone) close the popup instead of leaving the page.
//   - While a portrait or instrument close-up is open in the game (the game tells us with a message), the popup's X is hidden so it
//     cannot be mistaken for the close-up's own way out. It is always shown again when the close-up closes, when the game reloads, and
//     when the popup opens or closes, so it can never stay hidden by mistake.
//   - Share buttons, and a note for in-app browsers (Instagram, Facebook, TikTok...) that tend to block sensors.
(function () {
    const GAME_URL = "https://buganda-palace-tour.vercel.app";
    const GAME_ORIGIN = new URL(GAME_URL).origin;
    const GAME_TITLE = "TOUR: The Buganda Palace of Mengo";

    const root = document.documentElement;
    const modal = document.querySelector("[data-tour-modal]");
    const poster = document.querySelector("[data-tour-poster]");
    if (!modal || !poster) return;

    const win = modal.querySelector("[data-tour-window]");
    const loading = modal.querySelector("[data-tour-loading]");
    const backdrop = modal.querySelector("[data-tour-backdrop]");
    const closeButton = modal.querySelector("[data-tour-close]");
    const playButton = poster.querySelector("[data-tour-play]");

    let frame = null;
    let isOpen = false;
    let scrollBefore = null;

    // A page reloaded while the popup was open keeps our history marker; clear it so Back behaves normally.
    if (history.state && history.state.htourOpen) history.replaceState(null, "");

    // Same sizing as the Daddy's House tour: portrait screens get a 3:4 window, landscape between 4:3 and 3:2, and short landscape screens (phones on
    // their side) 16:10 so the width is not wasted. A 16px margin on phones (32px from 640px wide), and never bigger than the visible screen.
    function sizeWindow() {
        const vv = window.visualViewport;
        const width = root.clientWidth;
        const height = vv ? vv.height * vv.scale : window.innerHeight;
        const margin = width >= 640 ? 32 : 16;   // phones keep a slim 16px; tablets and up get a roomier 32px
        const maxW = Math.max(0, width - 2 * margin);
        const maxH = Math.max(0, height - 2 * margin);
        // landscape follows the screen's own shape, between 4:3 and 3:2, so the window is never shorter than 4:3 would make it
        const ratio = height > width ? 3 / 4 : (height <= 500 ? 16 / 10 : Math.min(3 / 2, Math.max(4 / 3, maxW / maxH)));   // width / height
        // phones held upright use the whole visible height (inside the margin) so the xylophone has room; everything else keeps its ratio
        if (height > width && width < 640) {
            modal.style.setProperty("--fs-w", Math.floor(maxW) + "px");
            modal.style.setProperty("--fs-h", Math.floor(maxH) + "px");
            return;
        }
        const w = Math.min(maxW, maxH * ratio);
        modal.style.setProperty("--fs-w", Math.floor(w) + "px");
        modal.style.setProperty("--fs-h", Math.floor(w / ratio) + "px");
    }

    function openTour() {
        if (isOpen) return;
        isOpen = true;
        scrollBefore = { x: window.scrollX, y: window.scrollY };
        sizeWindow();

        frame = document.createElement("iframe");
        frame.className = "htour-frame";
        frame.src = GAME_URL;
        frame.title = GAME_TITLE;
        frame.setAttribute("allow", "accelerometer; gyroscope; magnetometer; fullscreen");
        frame.setAttribute("allowfullscreen", "");
        frame.style.cssText = "width:100%; border:0";
        // the game has just (re)loaded, so no close-up can be open
        frame.addEventListener("load", () => { loading.hidden = true; setCloseUp(false); });
        win.appendChild(frame);
        setCloseUp(false);

        loading.hidden = false;
        modal.hidden = false;
        root.classList.add("is-tour-fullscreen");

        // one history entry for the popup, so Back (or the iPhone swipe) closes it instead of leaving the page
        history.pushState({ htourOpen: true }, "");
        frame.focus({ preventScroll: true });   // so the arrow keys go to the game, not to the page
    }

    // Hides or shows the X (a class, so it keeps its place and focus order; see the CSS).
    function setCloseUp(open) {
        modal.classList.toggle("is-closeup", open);
    }

    // The game tells us when a close-up opens or closes. Only messages from our own game frame are used.
    window.addEventListener("message", (event) => {
        if (!frame || event.source !== frame.contentWindow || event.origin !== GAME_ORIGIN) return;
        if (!event.data || event.data.enju !== "closeup") return;
        setCloseUp(event.data.open === true);
    });

    // Everything that closes the popup (the X) goes through the browser history, so there is one path.
    function requestClose() {
        if (!isOpen) return;
        if (history.state && history.state.htourOpen) history.back();   // popstate then calls closeTour()
        else closeTour();
    }

    function closeTour() {
        if (!isOpen) return;
        isOpen = false;
        setCloseUp(false);
        frame.remove();
        frame = null;
        modal.hidden = true;
        root.classList.remove("is-tour-fullscreen");
        playButton.focus({ preventScroll: true });

        // keep the page exactly where it was while the browser settles focus
        if (scrollBefore) {
            const back = scrollBefore;
            scrollBefore = null;
            const until = performance.now() + 600;
            const hold = () => { if (performance.now() < until && (window.scrollX !== back.x || window.scrollY !== back.y)) window.scrollTo(back.x, back.y); };
            root.style.scrollBehavior = "auto";
            window.addEventListener("scroll", hold);
            hold();
            setTimeout(() => { window.removeEventListener("scroll", hold); root.style.scrollBehavior = ""; }, 600);
        }
    }

    window.addEventListener("popstate", () => {
        if (!isOpen) return;
        closeTour();
    });

    poster.addEventListener("click", openTour);
    closeButton.addEventListener("click", requestClose);
    // a tap, drag or wheel on the backdrop does nothing: it must not close the tour or scroll the page behind it
    backdrop.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    backdrop.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });

    const refit = () => { if (isOpen) sizeWindow(); };
    window.addEventListener("resize", refit);
    window.addEventListener("orientationchange", refit);
    window.visualViewport?.addEventListener("resize", refit);

    // Esc does not close the popup: Esc belongs to the game (it releases the mouse). Only the X closes it.
    document.addEventListener("focusin", (event) => { if (isOpen && !modal.contains(event.target)) closeButton.focus(); });

    // ---- Slideshow captions: the bar under the slideshow shows the description of the photo that is showing ----
    const slideshow = document.querySelector(".hero-media-slideshow");
    const slideCaption = document.querySelector("[data-slide-caption]");
    if (slideshow && slideCaption) {
        const slides = Array.from(slideshow.querySelectorAll("img"));
        const showCaption = () => {
            const active = slides.find((slide) => slide.classList.contains("is-active"));
            if (active && active.dataset.caption) slideCaption.textContent = active.dataset.caption;
        };
        // the homepage slideshow script (site.js) moves the "is-active" class from slide to slide; follow it
        new MutationObserver(showCaption).observe(slideshow, { attributes: true, attributeFilter: ["class"], subtree: true });
        showCaption();
    }

    // ---- The search bar on the slideshow types three names in turn: it types one, holds it, erases it, and types the next.
    // It only runs while the hero is on screen. With reduced motion (or no script) the first name just stays there. ----
    const searchText = document.querySelector("[data-search-phrases]");
    const heroSection = document.getElementById("top");
    if (searchText && heroSection && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const phrases = searchText.dataset.searchPhrases.split("|").filter(Boolean);
        const TYPE_MS = 65, ERASE_MS = 28, HOLD_MS = 2200, GAP_MS = 500;   // the same pace as the homepage's search bar
        let phrase = 0, count = 0, erasing = false, visible = true, timer = null;
        searchText.textContent = "";

        const step = () => {
            timer = null;
            if (!visible) return;   // carries on from the same place when the hero comes back into view
            const full = phrases[phrase];
            let delay;
            if (!erasing) {
                count += 1;
                delay = count === full.length ? HOLD_MS : TYPE_MS + Math.random() * 45;
                if (count === full.length) erasing = true;
            } else {
                count -= 1;
                delay = count === 0 ? GAP_MS : ERASE_MS;
                if (count === 0) { erasing = false; phrase = (phrase + 1) % phrases.length; }
            }
            searchText.textContent = full.slice(0, count);
            timer = setTimeout(step, delay);
        };
        const schedule = (ms) => { if (timer === null) timer = setTimeout(step, ms); };

        if ("IntersectionObserver" in window) {
            new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) schedule(300); }, { threshold: 0.2 }).observe(heroSection);
        }
        schedule(1100);
    }

    // ---- The story: the section stays pinned while the page scrolls past it. The scroll position picks the current picture: the stack of
    // pictures slides so that picture fills its window, and the five statements (one column) move up with
    // the scroll, so the current one is solid and the ones before and after show only a little at the top and bottom.
    // One scrolling action moves exactly one picture, however hard it is: a mouse-wheel flick, a trackpad swipe, a finger swipe and the
    // arrow / page / space keys each step one picture, and the page then settles on it. At the first picture (going up) and at the last
    // (going down) the page scrolls on normally, so nobody is trapped. Without the script the pictures and their text sit in a column. ----
    const story = document.querySelector("[data-story]");
    const pin = story && story.querySelector("[data-story-pin]");
    const storyItems = story ? Array.from(story.querySelectorAll("[data-story-cards] > li")) : [];
    // On phones and tablets (narrow screens, and any touch screen) the story is NOT pinned or animated: the five pictures and their statements simply
    // sit one under another, and the page scrolls like any other. Only a wide screen with a mouse gets the pinned, one-picture-at-a-time version.
    const stackedStory = window.matchMedia("(max-width: 63.999rem), (pointer: coarse)").matches;
    if (pin && storyItems.length > 1 && !stackedStory) {
        story.closest("section").classList.add("is-story-pinned");
        const total = storyItems.length;
        const counter = story.querySelector("[data-story-count]");
        const numbers = Array.from(story.querySelectorAll("[data-story-numbers] span"));
        const captionsBox = story.querySelector("[data-story-captions]");
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        // A touch screen (phone, tablet) scrolls the page natively and nothing here steers it: no touch interception, no jumping or snapping
        // of the page (iPhone Safari freezes and glitches when a script moves the page while a finger or its momentum is still scrolling).
        // The scroll position only chooses the picture, and the pictures fade into each other.
        const native = window.matchMedia("(pointer: coarse)").matches;
        if (native) story.classList.add("htour-story--native");
        const pad = (n) => String(n).padStart(2, "0");

        // the statements: each picture's text is copied into one column under the stack (the original stays in its list item, hidden)
        const strip = document.createElement("div");
        strip.className = "htour-story__strip";
        if (captionsBox) captionsBox.appendChild(strip);
        const captions = storyItems.map((item) => {
            const text = item.querySelector(".htour-scard__text");
            const caption = document.createElement("div");
            caption.className = "htour-story__caption";
            caption.dataset.chapter = text ? text.dataset.chapter : "";
            if (text) caption.innerHTML = text.innerHTML;
            strip.appendChild(caption);
            return caption;
        });
        const cards = storyItems.map((item) => item.querySelector(".htour-scard"));

        let current = -1;
        let frame = null;
        let settleTimer = null;
        let stepping = false;       // the page is being scrolled to a picture by one of our steps
        let stepTarget = 0;
        let stepIndex = 0;          // the picture a step in progress is heading for
        let stepTimer = null;
        let gestureLock = false;    // a scrolling action has been used: the rest of it (a trackpad's glide, a held key) is ignored
        let lockTimer = null;
        let holdIndex = 0;          // ...and which picture that is (0, or the last)
        let holdY = null;           // while the gesture that carried the page into the section carries on, the page is held on the first (or last) picture
        let sentence = { pitch: 0 };

        // where the pinned part sits: the page scrolls through "travel" pixels while the section is pinned
        function geometry() {
            const stickyTop = parseFloat(getComputedStyle(pin).top) || 0;
            const top = story.getBoundingClientRect().top + window.scrollY;
            const travel = Math.max(1, story.offsetHeight - pin.offsetHeight);
            return { stickyTop, top, travel };
        }

        // the page position at which picture i fills its window
        function snapY(i) {
            const { stickyTop, top, travel } = geometry();
            return top - stickyTop + travel * (i / (total - 1));
        }

        // true while the page is scrolled to somewhere between the first picture and the last
        function inRange() {
            const y = window.scrollY;
            return y >= snapY(0) - 2 && y <= snapY(total - 1) + 2;
        }

        function progressNow() {
            const { stickyTop, top, travel } = geometry();
            return Math.max(0, Math.min(1, (window.scrollY + stickyTop - top) / travel));
        }

        // the sizes the statements need to slide: every statement gets the height of the tallest one (so they are evenly spaced), the window
        // shows one statement plus the little peek, and the column moves by one statement plus the gap for each picture
        function measure() {
            if (!captionsBox || !captions.length) return;
            strip.style.removeProperty("--slot");
            const slot = Math.max(...captions.map((caption) => caption.offsetHeight));
            strip.style.setProperty("--slot", slot + "px");
            const gap = parseFloat(getComputedStyle(strip).rowGap) || 0;
            const peek = parseFloat(getComputedStyle(captionsBox).paddingTop) || 0;
            sentence = { pitch: slot + gap };
            captionsBox.style.height = (slot + 2 * peek) + "px";
        }

        // p is the position in pictures, with a fraction while the page is between two of them (0 = first, 4 = last)
        function layoutSentence(p) {
            strip.style.transform = "translate3d(0," + (-p * sentence.pitch).toFixed(1) + "px,0)";
            captions.forEach((caption, k) => caption.style.setProperty("--near", Math.max(0, 1 - Math.abs(k - p)).toFixed(3)));
        }

        function setCurrent(index) {
            if (index === current) return;
            current = index;
            story.style.setProperty("--i", index);
            cards.forEach((card, i) => card && card.classList.toggle("is-current", i === index));
            storyItems.forEach((item, i) => item.classList.toggle("is-current", i === index));
            captions.forEach((caption, i) => caption.classList.toggle("is-current", i === index));
            numbers.forEach((number, i) => number.classList.toggle("is-current", i === index));
            if (counter) counter.textContent = pad(index + 1) + " / " + pad(total);
            // the last picture turns the whole section dark
            story.classList.toggle("htour-story--dark", index === total - 1);
        }

        function update() {
            frame = null;
            const held = holdY !== null && gestureLock;
            const p = held ? holdIndex : progressNow() * (total - 1);
            const progress = p / (total - 1);
            story.style.setProperty("--progress", progress.toFixed(3));
            setCurrent(Math.round(p));
            layoutSentence(p);
        }

        // ---- one step = one picture ----
        function lock(ms) {
            gestureLock = true;
            clearTimeout(lockTimer);
            // the lock ends a moment after the last sign of the gesture, and never while a step is still moving
            lockTimer = setTimeout(() => { if (stepping) lock(100); else { gestureLock = false; holdY = null; } }, ms);
        }

        function stepTo(index) {
            holdY = null;
            stepIndex = index;
            stepping = true;
            stepTarget = snapY(index);
            window.scrollTo({ top: stepTarget, behavior: reduceMotion.matches ? "auto" : "smooth" });
            clearTimeout(stepTimer);
            stepTimer = setTimeout(() => { stepping = false; }, 1100);
        }

        // wheel and trackpad
        if (!native) window.addEventListener("wheel", (event) => {
            if (event.ctrlKey || event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
            checkArrival(event.deltaY > 0);
            if (gestureLock || stepping) {
                if (gestureLock || inRange()) { event.preventDefault(); lock(160); }
                return;
            }
            if (!inRange()) return;
            const target = current + (event.deltaY > 0 ? 1 : -1);
            if (target < 0 || target > total - 1) return;   // past the first or last picture: the page scrolls on
            event.preventDefault();
            lock(160);
            stepTo(target);
        }, { passive: false });

        // a finger: decided by the direction of the first movement, so the page scrolls on normally past the ends
        let touch = null;
        if (!native) {
        pin.addEventListener("touchstart", (event) => {
            const point = event.touches[0];
            // a new finger is a new gesture: whatever the last one was still holding or ignoring is over
            gestureLock = false;
            holdY = null;
            clearTimeout(lockTimer);
            touch = event.touches.length === 1 ? { x: point.clientX, y: point.clientY, dy: 0, handled: null, dir: 0, base: 0 } : null;
        }, { passive: true });
        pin.addEventListener("touchmove", (event) => {
            if (!touch) return;
            const point = event.touches[0];
            touch.dy = point.clientY - touch.y;
            const dx = point.clientX - touch.x;
            if (touch.handled === null && (Math.abs(touch.dy) > 6 || Math.abs(dx) > 6)) {
                touch.dir = touch.dy < 0 ? 1 : -1;
                // a swipe made while the page is still gliding to a picture carries on from that picture (never lost, never left to scroll the page
                // by hand and snap back): one swipe is always one picture
                touch.base = stepping ? stepIndex : current;
                const target = touch.base + touch.dir;
                touch.handled = Math.abs(touch.dy) > Math.abs(dx) && inRange() && target >= 0 && target <= total - 1;
            }
            if (touch.handled) event.preventDefault();
        }, { passive: false });
        pin.addEventListener("touchend", () => {
            if (touch && touch.handled && Math.abs(touch.dy) >= 24) {
                lock(250);
                stepTo(touch.base + touch.dir);
            }
            touch = null;
        });
        pin.addEventListener("touchcancel", () => { touch = null; });
        }

        // the keyboard
        if (!native) window.addEventListener("keydown", (event) => {
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.target.closest && event.target.closest("input, textarea, select, button, a, [contenteditable]")) return;
            let dir = 0;
            if (event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey)) dir = 1;
            else if (event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey)) dir = -1;
            else return;
            const target = current + dir;
            if (!inRange() || target < 0 || target > total - 1) return;
            event.preventDefault();
            if (stepping || gestureLock) return;
            lock(250);
            stepTo(target);
        });

        // a tap on the statement peeking in above or below brings it in
        if (!native) captions.forEach((caption, k) => caption.addEventListener("click", () => {
            if (k !== current && !stepping) { lock(300); stepTo(k); }
        }));

        // ---- scrolling by any other means (the scroll bar, a glide that carries the page into the section, a link) ----
        // The page remembers when the viewer last used the wheel, a finger or the keyboard. A glide that carries the page into the section
        // only counts if it follows one of those: a link or button that scrolls the page to a later section must pass straight through.
        let lastInput = -10000;
        ["wheel", "touchstart", "touchmove", "touchend", "keydown"].forEach((type) => {
            window.addEventListener(type, () => { lastInput = performance.now(); }, { passive: true, capture: true });
        });
        let wasInside = inRange();
        let lastY = window.scrollY;

        // Arriving in the section with some force (a wheel flick, a swipe, a key): the rest of that gesture is used up on getting here. The
        // page lands on the first picture (or the last, when arriving from below) and is held there until the gesture ends, so the scroll
        // that brought the viewer here does not also move the picture on. The next scroll after that works as usual.
        function checkArrival(down) {
            const inside = inRange();
            let arrived = false;
            if (inside && !wasInside && !stepping && !gestureLock && performance.now() - lastInput < 2500) {
                arrived = true;
                holdIndex = (down === undefined ? window.scrollY > lastY : down) ? 0 : total - 1;
                holdY = snapY(holdIndex);
                lock(300);
                window.scrollTo({ top: holdY, behavior: "instant" });
            }
            wasInside = inside;
            lastY = window.scrollY;
            return arrived;
        }

        function onScroll() {
            if (frame === null) frame = requestAnimationFrame(update);
            if (native) {
                // touch screens: the page is only ever moved by the script AFTER everything has stopped (no finger down, no momentum left),
                // and then only with a gentle glide to the nearest picture
                clearTimeout(settleTimer);
                settleTimer = setTimeout(nativeSettle, 170);
                return;
            }
            if (stepping && Math.abs(window.scrollY - stepTarget) < 2) { stepping = false; clearTimeout(stepTimer); }
            checkArrival();
            // a finger or a glide that is still pushing the page after it arrived is pushed back to where it landed
            if (holdY !== null && gestureLock && Math.abs(window.scrollY - holdY) > 1) {
                lock(300);
                window.scrollTo({ top: holdY, behavior: "instant" });
            }
            // and when the scrolling stops anywhere inside, settle on the nearest picture so none is left half way
            clearTimeout(settleTimer);
            settleTimer = setTimeout(settle, 170);
        }

        // Touch screens. A glide is allowed only once the scrolling has fully stopped. It never carries a viewer more than one picture from where the
        // gesture began (a hard flick that overshoots comes back to the next picture), and arriving from above or below lands on the first or the last
        // picture. Outside the first-to-last range nothing is touched, so the page can always be scrolled out of the section.
        let touching = false;
        let startIndex = null;      // the picture the current gesture began on: -1 above the section, total below it
        function pictureAtRest() {
            const y = window.scrollY;
            if (y < snapY(0) - 2) return -1;
            if (y > snapY(total - 1) + 2) return total;
            return Math.round(progressNow() * (total - 1));
        }
        function nativeSettle() {
            settleTimer = null;
            if (touching) return;
            if (!inRange()) { startIndex = null; return; }
            let index = Math.round(progressNow() * (total - 1));
            if (startIndex !== null) {
                const low = startIndex < 0 ? 0 : Math.max(0, startIndex - 1);
                const high = startIndex >= total ? total - 1 : Math.min(total - 1, startIndex + 1);
                index = startIndex < 0 ? 0 : startIndex >= total ? total - 1 : Math.max(low, Math.min(high, index));
            }
            startIndex = null;
            const target = snapY(index);
            if (Math.abs(window.scrollY - target) > 2) {
                window.scrollTo({ top: target, behavior: reduceMotion.matches ? "auto" : "smooth" });
            }
        }
        if (native) {
            window.addEventListener("touchstart", () => {
                touching = true;
                if (startIndex === null) startIndex = pictureAtRest();
            }, { passive: true });
            const lifted = () => {
                touching = false;
                clearTimeout(settleTimer);
                settleTimer = setTimeout(nativeSettle, 170);
            };
            window.addEventListener("touchend", lifted, { passive: true });
            window.addEventListener("touchcancel", lifted, { passive: true });
        }

        function settle() {
            settleTimer = null;
            if (stepping) return;
            const progress = progressNow();
            if (progress <= 0.001 || progress >= 0.999) return;
            const target = snapY(Math.round(progress * (total - 1)));
            if (Math.abs(window.scrollY - target) > 2) {
                window.scrollTo({ top: target, behavior: reduceMotion.matches ? "auto" : "smooth" });
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", () => { measure(); if (frame === null) frame = requestAnimationFrame(update); });
        // the pictures sit in a clipped window, so the browser may not start loading the next ones until they slide into view:
        // load them all as soon as the section is near the screen, so no picture arrives late
        if ("IntersectionObserver" in window) {
            new IntersectionObserver((entries, observer) => {
                if (!entries[0].isIntersecting) return;
                story.querySelectorAll(".htour-scard img").forEach((image) => { image.loading = "eager"; });
                observer.disconnect();
            }, { rootMargin: "1500px 0px" }).observe(story);
        }

        story.classList.add("htour-story--live");
        measure();
        update();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); update(); });
    }

    // ---- The stacked story (phones, tablets, touch screens): the background fades from light into the dark blue, starting at the last item. The script only
    // measures where that happens (not while scrolling) and sets CSS variables; it never moves the page. ----
    if (story && stackedStory) {
        const section = story.closest("section");
        const lastItem = storyItems[storyItems.length - 1];
        const lastPicture = lastItem && lastItem.querySelector("img, .htour-scard__slot");
        let darkFrom = 0;
        let darkTo = 1;

        const measureFade = () => {
            if (!section || !lastItem) return;
            const base = section.getBoundingClientRect().top;
            const itemTop = lastItem.getBoundingClientRect().top - base;
            const pictureTop = lastPicture ? lastPicture.getBoundingClientRect().top - base : itemTop;
            const pictureHeight = lastPicture ? lastPicture.getBoundingClientRect().height : 0;
            darkFrom = Math.max(0, itemTop);
            darkTo = Math.max(darkFrom + 1, pictureTop + pictureHeight * 0.75);
            section.style.setProperty("--dark-from", darkFrom.toFixed(0) + "px");
            section.style.setProperty("--dark-to", darkTo.toFixed(0) + "px");
        };

        window.addEventListener("resize", measureFade);
        window.addEventListener("load", measureFade);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureFade);
        if ("ResizeObserver" in window && section) new ResizeObserver(measureFade).observe(section);
        measureFade();
    }

    // ---- In-app browsers (Instagram, Facebook, TikTok...) often block motion sensors, sound or fullscreen ----
    const inApp = /Instagram|FBAN|FBAV|FB_IAB|Messenger|TikTok|musical_ly|Snapchat|\bLine\//i.test(navigator.userAgent);
    document.querySelectorAll("[data-inapp-note]").forEach((note) => { note.hidden = !inApp; });

    // ---- "Leave a review": the embedded Google Form ----
    // On desktop the form sits in the right column behind a cover; pressing the cover or "Leave a review" loads it there, and it scrolls inside its own box.
    // On phones and tablets "Leave a review" opens the form in a full-screen pop-up. The form is only loaded when asked for.
    // With no form address set, "Leave a review" stays a plain "email us" link.
    const reviewLink = document.querySelector("[data-review-link]");
    const reviewBox = document.querySelector("[data-review-box]");
    const reviewFormUrl = reviewBox ? reviewBox.dataset.formUrl : "";
    if (reviewLink && reviewBox && reviewFormUrl) {
        const reviewCover = reviewBox.querySelector("[data-review-cover]");
        const reviewFrame = reviewBox.querySelector("[data-review-form]");
        const reviewDialog = document.querySelector("[data-review-dialog]");
        const reviewDialogFrame = document.querySelector("[data-review-dialog-form]");
        const wideScreen = window.matchMedia("(min-width: 64rem)");

        const openInPlace = () => {
            if (!reviewFrame.getAttribute("src")) reviewFrame.setAttribute("src", reviewFormUrl);
            reviewCover.hidden = true;
            reviewFrame.focus({ preventScroll: true });
        };

        const openPopup = () => {
            if (!reviewDialog || typeof reviewDialog.showModal !== "function") {
                window.open(reviewFormUrl.replace("?embedded=true", ""), "_blank", "noopener");
                return;
            }
            if (!reviewDialogFrame.getAttribute("src")) reviewDialogFrame.setAttribute("src", reviewFormUrl);
            reviewDialog.showModal();
        };

        reviewLink.addEventListener("click", (event) => {
            event.preventDefault();
            if (wideScreen.matches) openInPlace(); else openPopup();
        });
        reviewCover.addEventListener("click", openInPlace);

        if (reviewDialog) {
            reviewDialog.querySelector("[data-review-close]").addEventListener("click", () => reviewDialog.close());
            reviewDialog.addEventListener("click", (event) => { if (event.target === reviewDialog) reviewDialog.close(); });
        }
    }

    // ---- Share ----
    const pageUrl = window.location.href.split("#")[0];
    const pageText = GAME_TITLE + ": an Enju Heritage tour";
    const status = document.querySelector("[data-share-status]");
    const nativeShare = document.querySelector("[data-share-native]");
    const copyLink = document.querySelector("[data-share-copy]");

    const whatsapp = document.querySelector("[data-share-whatsapp]");
    if (whatsapp) whatsapp.href = "https://wa.me/?text=" + encodeURIComponent(pageText + " " + pageUrl);
    const facebook = document.querySelector("[data-share-facebook]");
    if (facebook) facebook.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl);

    function say(text) { if (status) status.textContent = text; }

    function copyPageLink() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pageUrl).then(() => say("Page link copied."), () => say("Couldn't copy automatically. You can copy the address from your browser instead."));
        } else {
            say("Copying isn't available in this browser. You can copy the address from your browser instead.");
        }
    }

    if (nativeShare) {
        if (!navigator.share) {
            // no share sheet here (some browsers, and any page opened over plain http instead of https): the button copies the link instead
            nativeShare.addEventListener("click", copyPageLink);
        } else {
            nativeShare.addEventListener("click", () => {
                say("");
                navigator.share({ title: GAME_TITLE, text: pageText, url: pageUrl }).catch((error) => {
                    // closing the share sheet is not an error
                    if (error && error.name !== "AbortError") copyPageLink();
                });
            });
        }
    }
    copyLink?.addEventListener("click", copyPageLink);
})();
