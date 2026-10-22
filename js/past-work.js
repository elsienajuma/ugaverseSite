// "See past work" has nothing to show yet: on click, the button turns into an outlined "Coming soon" for a moment
document.querySelectorAll("[data-coming-soon]").forEach((button) => {
    const original = button.innerHTML;
    let timer;

    button.addEventListener("click", () => {
        button.style.minWidth = button.offsetWidth + "px";   // keep the width so nothing around it shifts
        button.classList.add("is-soon");
        button.textContent = "Coming soon";
        clearTimeout(timer);
        timer = setTimeout(() => {
            button.classList.remove("is-soon");
            button.innerHTML = original;
        }, 2200);
    });
});
