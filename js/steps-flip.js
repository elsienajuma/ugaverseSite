/* "How it works": on desktop the cards flip one by one to reveal the photo behind each, and only one card ever moves at a time:
   a card always turns fully back before the next one starts to turn.
   Hovering a card turns it open at once and keeps it open, while any other open card turns back at the same moment (the hover does not
   wait for the other card, unlike the automatic cycle). When the pointer leaves, it turns back and the cycle carries on with the NEXT card
   (it does not restart). The cycle only runs while the section is on screen.
   Phones show the photo on the front of each card, and visitors who prefer reduced motion get no flipping at all. */

(function () {
    const cards = Array.from(document.querySelectorAll(".steps-card"));
    const section = document.getElementById("process-cards");
    if (!cards.length || !section) return;

    const desktop = window.matchMedia("(min-width: 64rem)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const TURN_MS = 700;    // a little longer than the 600ms CSS turn, so a card has fully finished turning
    const SHOW_MS = 2600;   // how long each photo stays showing in the automatic cycle
    const REST_MS = 1200;   // pause with every card facing front before the cycle starts over
    const RESUME_MS = 500;  // pause after a hovered card has turned back, before the cycle carries on

    let current = -1;       // the card showing its photo (opened by the cycle or by hover), or -1
    let cursor = 0;         // the card the cycle opens next
    let busyUntil = 0;      // time at which the last turn-back has finished
    let timer = null;
    let visible = false;
    let hovered = -1;       // the card under the pointer, or -1

    const active = () => visible && desktop.matches && !reduced.matches;

    function schedule(fn, ms) {
        clearTimeout(timer);
        timer = setTimeout(() => { timer = null; if (active()) fn(); }, ms);
    }

    function turnBack(i) {
        if (i < 0) return;
        cards[i].classList.remove("is-flipped");
        busyUntil = Math.max(busyUntil, performance.now() + TURN_MS);
        if (current === i) current = -1;
    }

    // open a card, but only once any card that is still turning back has finished
    function open(i, then) {
        const wait = Math.max(0, busyUntil - performance.now());
        schedule(() => {
            cards[i].classList.add("is-flipped");
            current = i;
            if (then) then();
        }, wait);
    }

    function cycleStep() {
        if (hovered !== -1) return;

        if (cursor >= cards.length) {
            cursor = 0;
            schedule(cycleStep, REST_MS);
            return;
        }

        const i = cursor;
        open(i, () => {
            schedule(() => {
                turnBack(i);
                cursor = i + 1;
                schedule(cycleStep, TURN_MS);
            }, SHOW_MS);
        });
    }

    function clearAll() {
        clearTimeout(timer);
        timer = null;
        current = -1;
        busyUntil = 0;
        hovered = -1;
        cursor = 0;
        cards.forEach((card) => card.classList.remove("is-flipped"));
    }

    function start() {
        if (timer === null && current === -1 && hovered === -1 && active()) schedule(cycleStep, 700);
    }

    cards.forEach((card, i) => {
        card.addEventListener("mouseenter", () => {
            if (!active()) return;
            hovered = i;
            clearTimeout(timer);
            timer = null;
            if (current !== -1 && current !== i) turnBack(current);
            cursor = i + 1;
            // open straight away, even if another card is still turning back
            cards[i].classList.add("is-flipped");
            current = i;
        });

        card.addEventListener("mouseleave", () => {
            if (!active() || hovered !== i) return;
            hovered = -1;
            clearTimeout(timer);
            timer = null;
            turnBack(i);
            schedule(cycleStep, TURN_MS + RESUME_MS);
        });
    });

    desktop.addEventListener("change", () => { if (desktop.matches) start(); else clearAll(); });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            visible = entries[0].isIntersecting;
            if (visible) start(); else clearAll();
        }, { threshold: 0.4 }).observe(section);
    }
})();
