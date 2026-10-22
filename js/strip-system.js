/* Gold strips under the hero and under the "What you get" band.

   1. Seamless loop: a strip slides left by half of its track and then jumps back, which only looks continuous if each half
      of the track is at least as wide as the screen. The script adds extra copies of the list until it is, and keeps this
      right when the window is resized or the fonts finish loading. (Without it, a short list leaves a blank gap at the end of each loop.)
   2. Steady speed: the loop time is set from the track's width, so every strip scrolls at the same speed however many copies it has.
   3. Hover: the scroll eases down to a crawl while the pointer is over a strip and eases back up when it leaves.
      (A CSS hover can only pause or restart an animation, so the speed is changed through the Web Animations API.)

   With reduced motion nothing scrolls, so none of this runs. */

(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const SPEED_PX_PER_S = 40;   // how fast the strips scroll
    const strips = Array.from(document.querySelectorAll(".strip"));

    strips.forEach(initStrip);

    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => strips.forEach(fillStrip), 150);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => strips.forEach(fillStrip));
    }

    function fillStrip(strip) {
        const track = strip.querySelector(".strip__track");
        const first = track && track.querySelector(".strip__list");
        if (!first) return;

        // remove the copies added earlier, then measure one list
        track.querySelectorAll("[data-strip-clone]").forEach((node) => node.remove());
        const listWidth = first.getBoundingClientRect().width;
        if (!listWidth) return;

        // each half of the track must be at least as wide as the screen; the track is two identical halves
        const perHalf = Math.max(1, Math.ceil(window.innerWidth / listWidth));
        const needed = perHalf * 2;
        const existing = track.querySelectorAll(".strip__list").length;

        for (let i = existing; i < needed; i += 1) {
            const copy = first.cloneNode(true);
            copy.setAttribute("aria-hidden", "true");
            copy.setAttribute("data-strip-clone", "");
            track.appendChild(copy);
        }

        // constant speed: the track moves half of its own width per loop
        track.style.animationDuration = (listWidth * perHalf) / SPEED_PX_PER_S + "s";
    }

    function initStrip(strip) {
        const track = strip.querySelector(".strip__track");
        if (!track || typeof track.getAnimations !== "function") return;

        fillStrip(strip);

        const SLOW = 0.12;   // 12% of normal speed while hovering
        const EASE = 0.08;   // how quickly the speed changes (per frame)

        let target = 1;
        let frame = null;

        function animation() {
            return track.getAnimations()[0];
        }

        function tick() {
            const anim = animation();
            if (!anim) { frame = null; return; }

            const next = anim.playbackRate + (target - anim.playbackRate) * EASE;
            anim.playbackRate = Math.abs(next - target) < 0.005 ? target : next;

            frame = anim.playbackRate === target ? null : requestAnimationFrame(tick);
        }

        function setTarget(value) {
            target = value;
            if (frame === null) frame = requestAnimationFrame(tick);
        }

        strip.addEventListener("mouseenter", () => setTarget(SLOW));
        strip.addEventListener("mouseleave", () => setTarget(1));
    }
})();
