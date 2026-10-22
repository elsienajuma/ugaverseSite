/* Hero search bar: types the phrase, waits, erases it and starts again, but only while the hero is on screen.
   Without JavaScript, or with reduced motion, the finished phrase shows and nothing moves. */

(function () {
    const text = document.querySelector("[data-search-text]");
    const hero = document.getElementById("hero");
    if (!text || !hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const full = text.dataset.searchText;
    if (!full) return;

    const TYPE_MS = 65;      // pause between letters
    const ERASE_MS = 28;     // pause between letters while erasing
    const HOLD_MS = 2200;    // how long the finished phrase stays
    const GAP_MS = 500;      // empty bar before typing starts again

    let visible = true;
    let timer = null;
    let count = 0;
    let erasing = false;

    text.textContent = "";

    function step() {
        timer = null;
        if (!visible) return; // resumes from the same place when the hero comes back into view

        let delay;

        if (!erasing) {
            count += 1;
            delay = count === full.length ? HOLD_MS : TYPE_MS + Math.random() * 45;
            if (count === full.length) erasing = true;
        } else {
            count -= 1;
            delay = count === 0 ? GAP_MS : ERASE_MS;
            if (count === 0) erasing = false;
        }

        text.textContent = full.slice(0, count);
        timer = setTimeout(step, delay);
    }

    function schedule(ms) {
        if (timer === null) timer = setTimeout(step, ms);
    }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            if (visible) schedule(300);
        }, { threshold: 0.2 }).observe(hero);
    }

    schedule(1100);
})();
