// Email links on desktop often open nothing (no mail app is set up), so clicking one also copies the address.
//   - The mail icon in the About row shows a small "Copied!" pill just under its row, pointing up at the icon.
//   - The address in the footer flips its "Copy" button to "Copied" instead.
//   - The "Copy" button also works on its own.
// This only happens on devices with a mouse. On phones and tablets the link simply opens the mail app, as it should.
(function () {
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)");

    function copy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
        }
        return Promise.resolve(fallbackCopy(text));
    }

    // for older browsers and pages not on https
    function fallbackCopy(text) {
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
        document.body.appendChild(field);
        field.select();
        let ok = false;
        try { ok = document.execCommand("copy"); } catch (error) { ok = false; }
        field.remove();
        return ok;
    }

    // a "Copy" button shows "Copied" for a moment
    function flashButton(button, ok) {
        const label = button.dataset.label || button.textContent;
        button.dataset.label = label;
        button.textContent = ok ? "Copied" : "Press Ctrl+C to copy";
        clearTimeout(button._timer);
        button._timer = setTimeout(() => { button.textContent = label; }, 2200);
    }

    // the pill sits under the row that holds the link (the "host") and points up at the link
    function showPill(host, link, address) {
        let pill = host.querySelector(".copy-pill");
        if (!pill) {
            pill = document.createElement("span");
            pill.className = "copy-pill";
            pill.setAttribute("role", "status");
            host.appendChild(pill);
        }
        // a row marked data-copy-show-address names the address, for buttons that do not show it (like "Email us")
        pill.textContent = host.hasAttribute("data-copy-show-address") ? "Copied: " + address : "Copied!";

        const hostBox = host.getBoundingClientRect();
        const linkBox = link.getBoundingClientRect();
        const width = pill.offsetWidth;
        const margin = 8;
        const center = linkBox.left + linkBox.width / 2;

        // keep the pill on screen, and keep its pointer aimed at the icon
        const left = Math.min(Math.max(center - width / 2, margin), window.innerWidth - width - margin);
        pill.style.left = left - hostBox.left + "px";
        // a row marked data-copy-above shows the pill over the row instead of under it (for a line at the very foot of a band)
        const above = host.hasAttribute("data-copy-above");
        pill.classList.toggle("copy-pill--above", above);
        pill.style.top = (above ? -pill.offsetHeight - 10 : hostBox.height + 10) + "px";
        pill.style.setProperty("--pointer-x", center - left + "px");

        pill.classList.remove("is-visible");
        void pill.offsetWidth;   // restart the fade if it is already showing
        pill.classList.add("is-visible");
        clearTimeout(pill._timer);
        pill._timer = setTimeout(() => pill.classList.remove("is-visible"), 2400);
    }

    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
        link.addEventListener("click", () => {
            if (!hasMouse.matches || link.hasAttribute("data-no-copy")) return;

            const address = link.getAttribute("href").slice("mailto:".length).split("?")[0];
            const host = link.closest("[data-copy-host]");
            const button = link.parentElement.querySelector("[data-copy-email]");

            copy(address).then((ok) => {
                if (!ok) return;
                if (host) showPill(host, link, address);
                else if (button) flashButton(button, true);
            });
        });
    });

    document.querySelectorAll("[data-copy-email]").forEach((button) => {
        button.addEventListener("click", () => {
            copy(button.dataset.copyEmail).then((ok) => flashButton(button, ok));
        });
    });
})();
