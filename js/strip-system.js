/* Gold strips under the hero and under the "What you get" band.

   1. Seamless loop: a strip slides left by half of its track and then jumps back, which only looks continuous if each half
      of the track is at least as wide as the screen. The script adds extra copies of the list until it is, and keeps this
      right when the window is resized or the fonts finish loading. (Without it, a short list leaves a blank gap at the end of each loop.)
   2. Steady speed: the loop time is set from the track's width, so every strip scrolls at the same speed however many copies it has.
   3. Hover: the scroll eases down to a crawl while the pointer is over a strip and eases back up when it leaves.
      (A CSS hover can only pause or restart an animation, so the speed is changed through the Web Animations API.)
   4. Drag: a strip can be grabbed with a mouse or a finger and moved sideways to read the rest. On letting go it glides on at the speed
      of the flick and slows smoothly back to its normal drift. (The hover slow-down is for a real mouse only.)

   With reduced motion nothing scrolls (the words wrap across the bar instead), so none of this runs. */

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

        // Hover slows the strip, but only for a real mouse. Touch screens have no "pointer left" moment, so after a tap or a drag the strip
        // would count as hovered for ever and stay slow.
        strip.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") setTarget(SLOW); });
        strip.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse" && !dragging) setTarget(1); });

        // Drag: grab the strip with a mouse or a finger and move it sideways, to read the rest at your own pace.
        // While dragging the animation is paused and its clock is moved by the drag (the track moves half of its own width per loop,
        // so a drag of N pixels is N / halfWidth of a loop); the clock wraps round, so the strip never runs out in either direction.
        // On letting go the strip keeps moving at the speed of the flick and slows smoothly (an exponential curve, like a phone's own
        // scrolling) until only its normal drift is left. Up and down swipes still scroll the page (touch-action: pan-y in the CSS).
        const TAU = 450;           // ms: how long the glide takes to lose most of its speed (the speed falls to 1/e of itself in this time)
        const MAX_FLICK = 3;       // px per ms: the fastest glide allowed
        const STOP_BELOW = 0.015;  // px per ms: the glide is over below this speed

        let dragging = false;
        let dragId = null;
        let dragStartX = 0;
        let dragStartTime = 0;
        let samples = [];          // recent pointer positions, to measure the flick
        let glide = null;          // the animation frame of a glide in progress

        const loopMs = (anim) => anim.effect.getComputedTiming().duration;
        const wrap = (time, loop) => ((time % loop) + loop) % loop;
        const halfWidth = () => track.getBoundingClientRect().width / 2;

        function stopGlide() {
            if (glide !== null) cancelAnimationFrame(glide);
            glide = null;
        }

        function startGlide(velocity) {
            stopGlide();
            let v = Math.max(-MAX_FLICK, Math.min(MAX_FLICK, velocity));   // px per ms, positive = towards the right
            if (Math.abs(v) < STOP_BELOW) return;

            let last = performance.now();

            function frame(now) {
                const anim = animation();
                const dt = Math.min(now - last, 50);   // a long pause (a background tab) must not throw the strip across the screen
                last = now;
                if (!anim || dragging) { glide = null; return; }

                v *= Math.exp(-dt / TAU);
                const loop = loopMs(anim);
                anim.currentTime = wrap(anim.currentTime - ((v * dt) / halfWidth()) * loop, loop);

                glide = Math.abs(v) < STOP_BELOW ? null : requestAnimationFrame(frame);
            }

            glide = requestAnimationFrame(frame);
        }

        // the speed of the last moments of the drag; a pointer that stopped before letting go gives zero
        function flickVelocity(now) {
            const recent = samples.filter((p) => now - p.t <= 100);
            if (recent.length < 2) return 0;
            const first = recent[0];
            const last = recent[recent.length - 1];
            if (now - last.t > 70 || last.t === first.t) return 0;
            return (last.x - first.x) / (last.t - first.t);
        }

        strip.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            const anim = animation();
            if (!anim) return;

            stopGlide();
            dragging = true;
            dragId = event.pointerId;
            dragStartX = event.clientX;
            dragStartTime = wrap(anim.currentTime, loopMs(anim));
            samples = [{ t: event.timeStamp, x: event.clientX }];
            anim.pause();
            strip.classList.add("is-dragging");
            try { strip.setPointerCapture(event.pointerId); } catch (error) { /* a pointer that is already gone */ }
        });

        strip.addEventListener("pointermove", (event) => {
            if (!dragging || event.pointerId !== dragId) return;
            const anim = animation();
            if (!anim) return;

            const loop = loopMs(anim);
            anim.currentTime = wrap(dragStartTime - ((event.clientX - dragStartX) / halfWidth()) * loop, loop);

            samples.push({ t: event.timeStamp, x: event.clientX });
            if (samples.length > 12) samples.shift();
        });

        function endDrag(event) {
            if (!dragging || (event && event.pointerId !== dragId)) return;
            dragging = false;
            strip.classList.remove("is-dragging");

            const anim = animation();
            if (anim) anim.play();

            // only a real mouse that is still over the strip keeps the slow hover speed; after a touch the strip returns to full speed
            const mouseStillOver = event && event.pointerType === "mouse" && strip.matches(":hover");
            setTarget(mouseStillOver ? SLOW : 1);

            if (event && event.type === "pointerup") startGlide(flickVelocity(event.timeStamp));
        }

        strip.addEventListener("pointerup", endDrag);
        strip.addEventListener("pointercancel", endDrag);
        strip.addEventListener("lostpointercapture", endDrag);
        strip.addEventListener("dragstart", (event) => event.preventDefault());
    }
})();
