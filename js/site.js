const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLabel = navToggle?.querySelector(".sr-only");

function setNavigation(open) {
    if (!navToggle || !siteNav) return;

    navToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);

    if (navLabel) {
        navLabel.textContent = open ? "Close navigation" : "Open navigation";
    }
}

navToggle?.addEventListener("click", () => {
    setNavigation(navToggle.getAttribute("aria-expanded") !== "true");
});

siteNav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        setNavigation(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setNavigation(false);
        navToggle?.focus();
    }
});

const desktopNavigation = window.matchMedia("(min-width: 64rem)");

function handleNavigationViewport(event) {
    if (event.matches) {
        setNavigation(false);
    }
}

desktopNavigation.addEventListener?.("change", handleNavigationViewport);

function initHeroSlideshows() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".hero-media-slideshow").forEach((heroSlideshow) => {
        const heroSlides = heroSlideshow.querySelectorAll("img");

        if (heroSlides.length > 1 && !heroSlideshow.dataset.initialized) {
            heroSlideshow.dataset.initialized = "true";
            let heroSlideIndex = 0;

            setInterval(() => {
                heroSlides[heroSlideIndex].classList.remove("is-active");
                heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
                heroSlides[heroSlideIndex].classList.add("is-active");
            }, 5000);
        }
    });
}

initHeroSlideshows();

const sectionThreeSlideshow = document.querySelector(".section-three__slideshow");

if (sectionThreeSlideshow && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const sectionThreeSlides = sectionThreeSlideshow.querySelectorAll("img");

    if (sectionThreeSlides.length > 1) {
        let sectionThreeSlideIndex = 0;

        setInterval(() => {
            sectionThreeSlides[sectionThreeSlideIndex].classList.remove("is-active");
            sectionThreeSlideIndex = (sectionThreeSlideIndex + 1) % sectionThreeSlides.length;
            sectionThreeSlides[sectionThreeSlideIndex].classList.add("is-active");
        }, 1000);
    }
}

const immersiveMediaSlideshow = document.querySelector(".immersive-media-section__slideshow");

if (immersiveMediaSlideshow && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const immersiveMediaSlides = immersiveMediaSlideshow.querySelectorAll("img");

    if (immersiveMediaSlides.length > 1) {
        let immersiveMediaSlideIndex = 0;

        setInterval(() => {
            immersiveMediaSlides[immersiveMediaSlideIndex].classList.remove("is-active");
            immersiveMediaSlideIndex = (immersiveMediaSlideIndex + 1) % immersiveMediaSlides.length;
            immersiveMediaSlides[immersiveMediaSlideIndex].classList.add("is-active");
        }, 1000);
    }
}

document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
});

const visitFab = document.getElementById("featured-visit-fab");
const visitRegions = ["featured", "process-cards", "airbnb"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

if (visitFab && visitRegions.length) {
    const activeRegions = new Set();

    const visitObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                activeRegions.add(entry.target);
            } else {
                activeRegions.delete(entry.target);
            }
        });

        const visible = activeRegions.size > 0;
        visitFab.classList.toggle("is-visible", visible);
        visitFab.setAttribute("aria-hidden", String(!visible));
        visitFab.tabIndex = visible ? 0 : -1;
    }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });

    visitRegions.forEach((region) => visitObserver.observe(region));
}

const stepsCarousel = document.querySelector(".steps-section__cards");
const stepsCarouselMobile = window.matchMedia("(max-width: 41.999rem), (min-width: 41.5rem) and (max-width: 42rem)");
const stepsReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const stepsPrevArrow = document.querySelector(".steps-carousel__arrow--prev");
const stepsNextArrow = document.querySelector(".steps-carousel__arrow--next");

if (stepsCarousel) {
    const stepsCards = Array.from(stepsCarousel.children);
    let stepsPressed = false;
    let stepsLastInteraction = 0;
    let stepsLastAdvance = Date.now();
    let stepsAutoScrollUntil = 0;

    const markStepsActivity = () => {
        stepsLastInteraction = Date.now();
    };

    const stepsGoTo = (index) => {
        const step = stepsCards[1].offsetLeft - stepsCards[0].offsetLeft;
        const target = ((index % stepsCards.length) + stepsCards.length) % stepsCards.length;

        stepsAutoScrollUntil = Date.now() + 1000;
        stepsLastAdvance = Date.now();
        markStepsActivity();
        stepsCarousel.scrollTo({ left: target * step, behavior: stepsReducedMotion.matches ? "auto" : "smooth" });
    };

    const stepsCurrentIndex = () => {
        const step = stepsCards[1].offsetLeft - stepsCards[0].offsetLeft;
        return Math.round(stepsCarousel.scrollLeft / step);
    };

    stepsPrevArrow?.addEventListener("click", () => stepsGoTo(stepsCurrentIndex() - 1));
    stepsNextArrow?.addEventListener("click", () => stepsGoTo(stepsCurrentIndex() + 1));

    if (!stepsReducedMotion.matches) {
        stepsCarousel.addEventListener("touchstart", () => { stepsPressed = true; }, { passive: true });
        stepsCarousel.addEventListener("pointerdown", () => { stepsPressed = true; });
        ["touchend", "touchcancel", "pointerup", "pointercancel"].forEach((type) => {
            stepsCarousel.addEventListener(type, () => {
                stepsPressed = false;
                markStepsActivity();
            }, { passive: true });
        });
        stepsCarousel.addEventListener("wheel", markStepsActivity, { passive: true });
        stepsCarousel.addEventListener("scroll", () => {
            if (Date.now() > stepsAutoScrollUntil) {
                markStepsActivity();
            }
        }, { passive: true });

        setInterval(() => {
            if (!stepsCarouselMobile.matches || stepsPressed || Date.now() - stepsLastInteraction < 5000 || Date.now() - stepsLastAdvance < 4000) return;

            const step = stepsCards[1].offsetLeft - stepsCards[0].offsetLeft;
            const current = Math.round(stepsCarousel.scrollLeft / step);
            const next = (current + 1) % stepsCards.length;

            stepsAutoScrollUntil = Date.now() + 1000;
            stepsLastAdvance = Date.now();
            stepsCarousel.scrollTo({ left: next * step, behavior: "smooth" });
        }, 250);
    }
}
