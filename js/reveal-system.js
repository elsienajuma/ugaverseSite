/* Rise-and-fade reveal for elements marked with the "reveal" class.
   Elements in view at load animate in with a short stagger (set per element with --d); the rest animate as they scroll into view. */

(function () {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll(".reveal"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.setAttribute("data-reveal-ready", "");

    if (!items.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("is-in"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-in");
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    // wait one painted frame so the hidden starting state is drawn before the transition begins
    requestAnimationFrame(() => requestAnimationFrame(() => items.forEach((item) => observer.observe(item))));
})();
