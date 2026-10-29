/* The "Who it helps" section: the heading whose word keeps changing, the photo slideshow beside it, and the "Why is heritage important?" pop-up
   (its text types itself out when it opens). */
(function () {
    "use strict";

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var inViewObserver = function (element, threshold, onChange) {
        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) { onChange(entries[0].isIntersecting); }, { threshold: threshold }).observe(element);
        } else {
            onChange(true);
        }
    };

    /* the changing word: each word fades up into place as the one before it lifts away. Without JavaScript, or with reduced motion, the words
       just show as a list. */
    var heading = document.querySelector("[data-words]");
    if (heading && !reduced) {
        var words = Array.prototype.slice.call(heading.querySelectorAll("span"));
        var current = 0;
        var wordTimer = 0;
        var wordsInView = false;
        var STEP_MS = 2000;   /* a new word every two seconds */

        var show = function (index) {
            words[current].classList.remove("is-active");
            words[current].classList.add("is-leaving");
            words[current].setAttribute("aria-hidden", "true");
            var leaving = words[current];
            setTimeout(function () { leaving.classList.remove("is-leaving"); }, 650);
            current = index;
            words[current].classList.add("is-active");
            words[current].removeAttribute("aria-hidden");
        };

        var wordRun = function () {
            clearInterval(wordTimer);
            if (wordsInView && !document.hidden && words.length > 1) {
                wordTimer = setInterval(function () { show((current + 1) % words.length); }, STEP_MS);
            }
        };

        words.forEach(function (word, i) {
            if (i !== 0) word.setAttribute("aria-hidden", "true");
        });
        words[0].classList.add("is-active");
        heading.classList.add("is-live");
        inViewObserver(heading, 0.4, function (visible) { wordsInView = visible; wordRun(); });
        document.addEventListener("visibilitychange", wordRun);
    }

    /* the photo slideshow beside the words: each photo fades into the next, only while it is on screen */
    var slides = document.querySelector("[data-who-slides]");
    if (slides) {
        var photos = Array.prototype.slice.call(slides.querySelectorAll("img"));
        var shown = 0;
        var slideTimer = 0;
        var slideInView = false;
        var go = function (step) {
            photos[shown].classList.remove("is-active");
            shown = (shown + step + photos.length) % photos.length;
            photos[shown].classList.add("is-active");
        };
        var advance = function () { go(1); };
        var slideRun = function () {
            clearInterval(slideTimer);
            if (!reduced && slideInView && !document.hidden && photos.length > 1) slideTimer = setInterval(advance, 4000);
        };
        /* the arrows: step to the next or previous photo, and give it a fresh full turn before the show moves on again */
        Array.prototype.forEach.call(slides.querySelectorAll("[data-slide-step]"), function (button) {
            button.addEventListener("click", function () {
                go(Number(button.getAttribute("data-slide-step")));
                slideRun();
            });
        });
        inViewObserver(slides, 0.3, function (visible) { slideInView = visible; slideRun(); });
        document.addEventListener("visibilitychange", slideRun);
    }

    /* the "Why is heritage important?" pop-up */
    var dialog = document.querySelector("[data-heritage]");
    var opener = document.querySelector("[data-heritage-open]");
    if (dialog && opener && typeof dialog.showModal === "function") {
        var lines = Array.prototype.slice.call(dialog.querySelectorAll("p")).map(function (p) {
            var text = p.textContent;
            /* screen readers get the whole sentence at once; the typed copy is hidden from them. The untyped part keeps its place (hidden but
               still taking up room), so the pop-up does not grow as the words appear. */
            p.innerHTML = "<span class=\"sr-only\"></span><span aria-hidden=\"true\"><span data-typed></span><span data-untyped></span></span>";
            p.firstChild.textContent = text;
            var typed = p.querySelector("[data-typed]");
            var untyped = p.querySelector("[data-untyped]");
            untyped.style.visibility = "hidden";
            untyped.textContent = text;
            return { text: text, typed: typed, untyped: untyped };
        });

        var CHARS_PER_SECOND = 70;
        var frame = 0;

        var setProgress = function (count) {
            var left = count;
            lines.forEach(function (line) {
                var k = Math.max(0, Math.min(line.text.length, left));
                line.typed.textContent = line.text.slice(0, k);
                line.untyped.textContent = line.text.slice(k);
                left -= line.text.length;
            });
        };

        var total = lines.reduce(function (sum, line) { return sum + line.text.length; }, 0);

        var type = function () {
            cancelAnimationFrame(frame);
            if (reduced) { setProgress(total); return; }
            setProgress(0);
            var start = null;
            var tick = function (now) {
                if (start === null) start = now;
                var count = Math.floor((now - start) / 1000 * CHARS_PER_SECOND);
                setProgress(count);
                if (count < total) frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
        };

        opener.addEventListener("click", function () {
            dialog.showModal();
            type();
        });
        dialog.addEventListener("close", function () { cancelAnimationFrame(frame); });
        /* a click on the text finishes it straight away */
        dialog.addEventListener("click", function (event) {
            if (event.target === dialog) { dialog.close(); return; }   /* a click on the dimmed area around the panel */
            if (event.target.closest("p")) { cancelAnimationFrame(frame); setProgress(total); }
        });
        dialog.querySelector("[data-heritage-close]").addEventListener("click", function () { dialog.close(); });
    } else if (opener) {
        opener.hidden = true;
    }

    /* the two pictures beside the contact row swap back and forth (like the Daddy's House pictures on the home page) */
    var visual = document.querySelector("[data-visual-slideshow]");
    if (visual && !reduced) {
        var visuals = visual.querySelectorAll("img");
        var visualIndex = 0;
        if (visuals.length > 1) {
            setInterval(function () {
                visuals[visualIndex].classList.remove("is-active");
                visualIndex = (visualIndex + 1) % visuals.length;
                visuals[visualIndex].classList.add("is-active");
            }, 1000);
        }
    }
})();
