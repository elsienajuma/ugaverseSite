const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLabel = navToggle?.querySelector(".sr-only");
const demoGallery = document.getElementById("demo-gallery");

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

async function renderDemoGallery() {
    if (!demoGallery) return;

    try {
        const response = await fetch("data/destinations.json");
        const data = await response.json();
        const industries = [
            {
                industry: "Hospitality",
                subtitle: "Hotels, resorts, conference venues",
                description: "Temporary placeholder copy for a hospitality brand that wants to show its atmosphere before arrival.",
                sampleProject: "Sample project coming soon"
            },
            {
                industry: "Real Estate and Construction",
                subtitle: "Developments, show homes, new projects",
                description: "Temporary placeholder copy for a property or construction team that wants a polished digital walkthrough.",
                sampleProject: "Sample project coming soon"
            },
            {
                industry: "Tourism and Culture",
                subtitle: "Museums, cultural centres, attractions",
                description: "Temporary placeholder copy for a destination that needs storytelling, context and location details in one place.",
                sampleProject: "Ndere Cultural Centre",
                image: "images/destinations/ndere/IMG_2530.jpg",
                destinationId: "ndere"
            },
            {
                industry: "Education",
                subtitle: "Campus spaces, learning centres, institutions",
                description: "Temporary placeholder copy for an education brand that wants visitors to understand the campus experience quickly.",
                sampleProject: "Sample project coming soon"
            }
        ];

        demoGallery.innerHTML = industries.map((item) => {
            if (!item.destinationId) {
                return `
            <article class="project-card project-card--coming-soon">
                <div class="project-card__body">
                    <p class="project-card__meta">${item.industry}</p>
                    <h3>${item.industry}</h3>
                    <p class="project-card__subtitle">${item.subtitle}</p>
                    <p>${item.description}</p>
                    <div class="project-card__sample">${item.sampleProject}</div>
                </div>
            </article>`;
            }

            return `
            <article class="project-card">
                <a class="project-card__link" href="destination.html?id=${item.destinationId}" aria-label="Explore ${item.sampleProject}">
                    <img src="${item.image}" alt="${item.sampleProject}" width="640" height="480" loading="lazy">
                    <div class="project-card__body">
                        <p class="project-card__meta">${item.industry}</p>
                        <h3>${item.industry}</h3>
                        <p class="project-card__subtitle">${item.subtitle}</p>
                        <p>${item.description}</p>
                        <div class="project-card__sample">Sample Project: ${item.sampleProject}</div>
                    </div>
                </a>
            </article>`;
        }).join("");
    } catch (error) {
        console.error("Unable to load destination demos:", error);
        demoGallery.innerHTML = '<p class="empty-state">Who we work with content is currently unavailable.</p>';
    }
}

document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
});

renderDemoGallery();
