/* "What is a digital home": a slideshow of the Daddy's House screens inside the phone.
   Each screen has its own caption word on the bottom banner. It advances by itself while the phone OR the row of cards is on screen (on some screen sizes the cards sit well below the phone, and they must keep changing while they are what you are looking at), the card under it for the current screen is highlighted,
   and picking a card jumps to that screen (then the slideshow carries on). */

(function () {
    const stage = document.querySelector("[data-dh]");
    if (!stage) return;

    const items = Array.from(document.querySelectorAll("[data-dh-item]"));
    const screens = Array.from(stage.querySelectorAll(".dh__screen"));
    const words = Array.from(stage.querySelectorAll(".dh__word"));
    const blurs = Array.from(stage.querySelectorAll(".dh__blur"));
    if (!items.length || items.length !== screens.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let timer = null;
    let visible = false;
    let stageVisible = false;
    let cardsVisible = false;

    // the caption word slides and fades: the old one leaves in the direction of travel, the new one arrives from the other side
    function slideWord(from, to, dir) {
        if (from === to) return;

        words.forEach((word, i) => {
            if (i !== from && i !== to) word.className = "dh__word";
        });

        const leaving = words[from];
        const arriving = words[to];

        leaving.className = "dh__word " + (dir > 0 ? "out-left" : "out-right");
        leaving.setAttribute("aria-hidden", "true");

        arriving.className = "dh__word " + (dir > 0 ? "from-right" : "from-left");
        void arriving.offsetWidth; // start from the offset position before animating
        arriving.className = "dh__word is-active";
        arriving.removeAttribute("aria-hidden");
    }

    function show(next, dir) {
        const previous = index;
        if (dir === undefined) dir = next >= previous ? 1 : -1;
        index = next;

        items.forEach((item, i) => {
            const on = i === index;
            item.classList.toggle("is-active", on);
            item.setAttribute("aria-pressed", String(on));
        });

        slideWord(previous, index, dir);

        blurs.forEach((blur, i) => {
            blur.classList.toggle("is-active", i === index);

            if (i === index) blur.loading = "eager";
        });

        screens.forEach((screen, i) => {
            const on = i === index;
            screen.classList.toggle("is-active", on);

            if (on) {
                screen.removeAttribute("aria-hidden");
                screen.loading = "eager";
            } else {
                screen.setAttribute("aria-hidden", "true");
            }
        });
    }

    function stop() {
        clearInterval(timer);
        timer = null;
    }

    function start() {
        stop();
        if (reduced || !visible) return;
        timer = setInterval(() => show((index + 1) % screens.length, 1), 3500);
    }

    const prev = stage.querySelector("[data-dh-prev]");
    const next = stage.querySelector("[data-dh-next]");

    if (prev) prev.addEventListener("click", () => { show((index - 1 + screens.length) % screens.length, -1); start(); });
    if (next) next.addEventListener("click", () => { show((index + 1) % screens.length, 1); start(); });

    items.forEach((item, i) => {
        const pick = () => { show(i); start(); };
        item.addEventListener("click", pick);
        item.addEventListener("focus", pick);
    });

    function update() {
        const now = stageVisible || cardsVisible;
        if (now === visible) return;
        visible = now;
        if (visible) start(); else stop();
    }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
            stageVisible = entries[0].isIntersecting;
            update();
        }, { threshold: 0.35 }).observe(stage);

        const cards = items[0].closest(".dh__list") || items[0].parentElement;
        new IntersectionObserver((entries) => {
            cardsVisible = entries[0].isIntersecting;
            update();
        }, { threshold: 0.4 }).observe(cards);
    }
})();
