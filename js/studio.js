/* Ugaverse Studios homepage: the hero slideshow (background photo, headline and dots change together)
   and the click-to-play 360° film. Without JavaScript the first slide and the first line simply stay up. */

(function () {
    const hero = document.querySelector("[data-studio-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".studio-hero__slide"));
        const lines = Array.from(hero.querySelectorAll(".studio-hero__line"));
        const dots = Array.from(hero.querySelectorAll(".studio-hero__dot"));
        const now = hero.querySelector("[data-hero-now]");
        const pause = hero.querySelector(".studio-hero__pause");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const DELAY = 6500;

        let index = 0;
        let timer = null;
        let paused = reduced;   // reduced motion: no autoplay, the dots still work

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                const on = i === index;
                slide.classList.toggle("is-active", on);
                const img = slide.querySelector("img");
                if (on && img) img.loading = "eager";
            });
            lines.forEach((line, i) => line.classList.toggle("is-active", i === index));
            dots.forEach((dot, i) => {
                dot.classList.toggle("is-active", i === index);
                dot.setAttribute("aria-current", i === index ? "true" : "false");
            });
            const slide = slides[index];
            if (now && slide.dataset.label) {
                now.innerHTML = "";
                now.append("Now showing: ");
                const link = document.createElement("a");
                link.href = slide.dataset.href || "#work";
                link.textContent = slide.dataset.label + " →";
                now.append(link);
            }
            // warm up the next photo so the fade never shows a blank frame
            const upcoming = slides[(index + 1) % slides.length].querySelector("img");
            if (upcoming) upcoming.loading = "eager";
        }

        function stop() {
            clearInterval(timer);
            timer = null;
        }

        function start() {
            stop();
            if (paused || document.hidden) return;
            timer = setInterval(() => show(index + 1), DELAY);
        }

        dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));

        if (pause) {
            pause.setAttribute("aria-pressed", paused ? "true" : "false");
            pause.addEventListener("click", () => {
                paused = !paused;
                pause.setAttribute("aria-pressed", paused ? "true" : "false");
                pause.setAttribute("aria-label", paused ? "Play the slideshow" : "Pause the slideshow");
                start();
            });
        }

        document.addEventListener("visibilitychange", start);

        show(0);
        start();
    }

    // 360° film: show the poster, load the YouTube player only when it is clicked
    document.querySelectorAll("[data-film]").forEach((button) => {
        button.addEventListener("click", () => {
            const frame = document.createElement("iframe");
            frame.src = "https://www.youtube-nocookie.com/embed/" + button.dataset.film + "?start=" + (button.dataset.start || 0) + "&autoplay=1&rel=0";
            frame.title = button.dataset.title || "360° film";
            frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            frame.allowFullscreen = true;
            button.replaceWith(frame);
            frame.focus();
        });
    });
})();
