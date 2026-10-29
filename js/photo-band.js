/* The photo band in the About section.

   - It scrolls on its own, slows to a crawl while a mouse is over it, and eases back up when the mouse leaves
     (the same feel as the gold strips).
   - Touch and mouse drag move it with the finger; on release it carries on with the swipe's momentum
     and then eases smoothly back to its normal speed.
   - On devices with a mouse, the side arrows give it a quick burst of speed that fades away again.
   - Tapping or clicking a photo opens it larger in a dialog, with previous / next buttons and the arrow keys.

   The band is moved by this script (not by CSS) so that all of the above share one position.
   Without JavaScript the CSS animation on the track still scrolls it. */

(function () {
    const band = document.querySelector(".photo-band");
    if (!band) return;

    const track = band.querySelector(".photo-band__track");

    // A page may list its photos just once. Then the script numbers them and adds the second, hidden set that makes the loop seamless
    // (the home page lists both sets by hand, so it does not need this).
    if (!track.querySelector("[data-band-clone]")) {
        const listed = Array.from(track.querySelectorAll(".photo-band__item"));
        listed.forEach((item, index) => {
            item.dataset.bandIndex = index;
            item.setAttribute("aria-label", "Open photo " + (index + 1) + " of " + listed.length);
        });
        listed.forEach((item) => {
            const copy = item.cloneNode(true);
            copy.setAttribute("data-band-clone", "");
            copy.setAttribute("aria-hidden", "true");
            copy.setAttribute("tabindex", "-1");
            copy.removeAttribute("aria-label");
            const copyImage = copy.querySelector("img");
            copyImage.alt = "";
            copyImage.removeAttribute("data-full");
            copyImage.removeAttribute("data-caption");
            copyImage.removeAttribute("data-project");
            track.appendChild(copy);
        });
    }

    const items = Array.from(track.querySelectorAll(".photo-band__item"));
    const lightbox = document.querySelector(".photo-lightbox");
    if (!items.length || !lightbox) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const BASE_SPEED = reduceMotion ? 0 : 30;   // px per second when left alone
    const SLOW = 0.5;                           // share of the normal speed while the mouse is over the band
    const SPEED_EASE = 6;                       // how quickly the speed settles (higher = quicker)
    const MOMENTUM_DECAY = 2.5;                 // how quickly a swipe or arrow burst fades (higher = quicker)
    const MAX_BOOST = 2500;                     // fastest a swipe can carry the band, px per second
    const ARROW_BOOST = 900;                    // speed an arrow click adds, px per second
    const DRAG_THRESHOLD = 6;                   // px of movement before a press becomes a drag

    let pos = 0;                // how far the band has moved left, in px
    let period = 0;             // width of one full set of photos: the point where the loop repeats
    let factor = 1;             // current share of the normal speed
    let target = 1;             // the share it is easing towards
    let boost = 0;              // extra speed from a swipe or arrow, px per second (negative = backwards)
    let dragging = false;
    let paused = false;         // true while the lightbox is open or a photo has keyboard focus
    let frame = null;
    let last = 0;

    band.classList.add("photo-band--js");

    function measure() {
        period = track.scrollWidth / 2;
    }

    function render() {
        if (period > 0) pos = ((pos % period) + period) % period;
        track.style.transform = "translate3d(" + -pos + "px, 0, 0)";
    }

    function tick(now) {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        if (!dragging) {
            const goal = paused ? 0 : target;
            factor += (goal - factor) * (1 - Math.exp(-dt * SPEED_EASE));
            boost *= Math.exp(-dt * MOMENTUM_DECAY);
            if (Math.abs(boost) < 0.5) boost = 0;
            pos += (BASE_SPEED * factor + boost) * dt;
        }

        render();
        frame = requestAnimationFrame(tick);
    }

    function start() {
        if (frame !== null) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
    }

    function stop() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
    }

    // only run while the band is on screen
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) start(); else stop();
    }).observe(band);

    // the photos have no width until they load, so measure again as they arrive and when the window resizes
    measure();
    track.querySelectorAll("img").forEach((img) => {
        if (!img.complete) img.addEventListener("load", measure, { once: true });
    });
    window.addEventListener("resize", measure);
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(track);

    // hover: slow down for a mouse (a touch has no hover)
    band.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") target = SLOW;
    });
    band.addEventListener("pointerleave", (event) => {
        if (event.pointerType === "mouse") target = 1;
    });

    // drag and swipe
    let pressId = null;
    let startX = 0;
    let lastX = 0;
    let lastMove = 0;
    let velocity = 0;
    let wasDragged = false;
    let pressItem = null;       // the photo under the pointer when it went down

    band.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || event.target.closest(".photo-band__arrow")) return;
        pressId = event.pointerId;
        startX = lastX = event.clientX;
        lastMove = performance.now();
        velocity = 0;
        wasDragged = false;
        pressItem = event.target.closest(".photo-band__item");
    });

    band.addEventListener("pointermove", (event) => {
        if (event.pointerId !== pressId) return;

        if (!dragging) {
            if (Math.abs(event.clientX - startX) < DRAG_THRESHOLD) return;
            dragging = true;
            wasDragged = true;
            band.setPointerCapture(pressId);
            band.classList.add("is-dragging");
            boost = 0;
        }

        const now = performance.now();
        const delta = lastX - event.clientX;          // finger moving left moves the band left
        const dt = Math.max(now - lastMove, 1);
        velocity = velocity * 0.6 + (delta / dt * 1000) * 0.4;
        pos += delta;
        lastX = event.clientX;
        lastMove = now;
    });

    function release(event) {
        if (event.pointerId !== pressId) return;
        pressId = null;

        // a tap or click opens the photo that was pressed. (The browser's own click event is not used for this:
        // the band keeps moving, so the click can land on the track instead of the photo and be lost.)
        if (!dragging) {
            if (event.type === "pointerup" && pressItem) openItem(pressItem);
            pressItem = null;
            return;
        }

        dragging = false;
        band.classList.remove("is-dragging");

        // carry on with the swipe, then settle back to the normal speed
        const stale = performance.now() - lastMove > 80;
        boost = stale ? 0 : Math.max(-MAX_BOOST, Math.min(MAX_BOOST, velocity));
        factor = 0;
    }

    band.addEventListener("pointerup", release);
    band.addEventListener("pointercancel", release);
    band.addEventListener("dragstart", (event) => event.preventDefault());

    // a drag that ends over a photo must not also open it
    band.addEventListener("click", (event) => {
        if (wasDragged) {
            event.stopPropagation();
            event.preventDefault();
            wasDragged = false;
        }
    }, true);

    // arrows (shown only where there is a mouse)
    band.querySelectorAll("[data-band-step]").forEach((button) => {
        button.addEventListener("click", () => {
            const direction = Number(button.dataset.bandStep);
            boost = Math.max(-MAX_BOOST, Math.min(MAX_BOOST, boost + direction * ARROW_BOOST));
        });
    });

    // keyboard: a focused photo is brought into view and the band holds still
    track.addEventListener("focusin", (event) => {
        const item = event.target.closest(".photo-band__item");
        // only for keyboard focus: closing the viewer after a click hands focus back to a photo, and the band must not jump then
        if (!item || !item.matches(":focus-visible")) return;
        paused = true;
        boost = 0;
        pos = item.offsetLeft - (band.clientWidth - item.offsetWidth) / 2;
        render();
    });
    track.addEventListener("focusout", () => {
        if (!lightbox.open) paused = false;
    });

    // lightbox
    const lightboxImg = lightbox.querySelector(".photo-lightbox__img");
    const lightboxCaption = lightbox.querySelector(".photo-lightbox__caption");
    const lightboxCaptionText = lightbox.querySelector(".photo-lightbox__caption-text");
    const lightboxCaptionLink = lightbox.querySelector(".photo-lightbox__caption-link");
    const lightboxCount = lightbox.querySelector(".photo-lightbox__count");
    const originals = items.filter((item) => !item.hasAttribute("data-band-clone"));
    let current = 0;

    function show(index) {
        current = (index + originals.length) % originals.length;
        const img = originals[current].querySelector("img");
        lightboxImg.src = img.dataset.full || img.currentSrc || img.src;
        lightboxImg.alt = img.alt;
        // the caption comes from data-caption on the photo; with none, the caption line stays hidden
        const caption = img.dataset.caption || "";
        // data-project on the photo adds a "View this project" link after the caption; with none, there is no link
        const project = img.dataset.project || "";
        lightboxCaptionText.textContent = caption;
        lightboxCaptionLink.hidden = !project;
        if (project) lightboxCaptionLink.href = project;
        lightboxCaption.hidden = !caption;
        lightboxCount.textContent = current + 1 + " of " + originals.length;
    }

    let openedAt = 0;

    function openItem(item) {
        show(Number(item.dataset.bandIndex));
        paused = true;
        openedAt = performance.now();
        lightbox.showModal();
    }

    // Enter or Space on a focused photo (a mouse or touch click has a detail above 0 and is handled on pointerup)
    track.addEventListener("click", (event) => {
        const item = event.target.closest(".photo-band__item");
        if (item && event.detail === 0) openItem(item);
    });

    lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(current - 1));
    lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => show(current + 1));
    lightbox.querySelector("[data-lightbox-close]").addEventListener("click", () => lightbox.close());

    // a click on the dark area around the photo closes it. (Not in the first moments after opening: the viewer opens on the release of a tap, and the
    // click the browser then sends to that same spot lands on the dark area when the photo was near the edge of the screen. It must not close the viewer.)
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox && performance.now() - openedAt > 500) lightbox.close();
    });

    lightbox.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") show(current - 1);
        if (event.key === "ArrowRight") show(current + 1);
    });

    lightbox.addEventListener("close", () => {
        paused = false;
        factor = 0;
    });

    // swiping the enlarged photo moves between photos
    let swipeStart = null;
    lightboxImg.addEventListener("pointerdown", (event) => { swipeStart = event.clientX; });
    lightboxImg.addEventListener("pointerup", (event) => {
        if (swipeStart === null) return;
        const moved = event.clientX - swipeStart;
        swipeStart = null;
        if (Math.abs(moved) > 40) show(current + (moved < 0 ? 1 : -1));
    });

    render();
    start();
})();
