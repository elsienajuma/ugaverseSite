<!-- Copilot / AI agent quick instructions for the UgaverseSite static site -->
# Quick facts

- Type: Simple static website (HTML + CSS). Main entry: `home.html`.
- Styling: `css/style.css`. Custom fonts are in `fonts/`.
- No build system, package.json, or tests detected. Edits are applied directly to files and can be previewed in a browser.

# What an AI agent should know (high-value items)

- Page structure: `home.html` is the single visible entry. The primary layout to preserve is the `#hero` section which uses a side-by-side flex layout: a `.text-container` (left) and `.video-container` (right).
  - Example: `.text-container` uses `max-width: 50%` and brand yellow text `#FFD700` in `css/style.css`.
  - Do not change the two-column intent of `#hero` unless you update both containers consistently.

- External/integration points:
  - The `iframe` in `.video-container` is a placeholder: `YOUR_360_VIDEO_LINK`. This represents an external 360° video source. Replace with a valid URL when wiring real content.
  - Fonts are referenced in `css/style.css` via `@font-face` pointing into `fonts/`. Verify actual filenames and formats in `fonts/` before changing CSS.

- Styling conventions to follow (discoverable from `css/style.css`):
  - Global background uses `rgb(0, 35, 111)` on `body` and `#hero`.
  - Headline sizing: `.text-container h1` uses `font-size: 3rem` and attempts to use the custom font family `Roca Two`.

# Project-specific gotchas (items discovered in-code)

- The `@font-face` block in `css/style.css` is incomplete / non-standard:
  - It lists `src: url('fonts/fonnts.com-Roca_Two_Bold')` without file extensions or formats. Confirm actual font files in `fonts/` and include format hints (e.g., `.woff2`, `.woff`, `.ttf`).
  - There are two `src:` lines back-to-back in the same rule; prefer a single `src` with comma-separated fallbacks.

- `home.html` contains placeholders for header/footer (`<header>...</header>` and `<footer>...</footer>`) — these are intentionally abbreviated and may be fleshed out elsewhere or left minimal.

# Developer workflows (how to preview and validate changes)

- Quick preview (recommended during edits):

```powershell
# From the project root (same folder as home.html)
python -m http.server 8000
# then open http://localhost:8000/home.html in your browser
```

- VS Code users: using the "Live Server" extension is also common for immediate live reload previews.

- No test or lint commands present. Changes should be validated by opening `home.html` and reviewing layout and fonts in-browser.

# Typical tasks an agent may perform (and how to do them safely)

- Replace the video iframe source: update the `src` attribute in `home.html` inside `.video-container`.
- Add/repair fonts: put properly named font files (e.g., `Roca_Two-Bold.woff2`) in `fonts/` and update the `@font-face` rule to reference those filenames and formats.
- Layout tweaks: if altering `#hero` layout, update both `.text-container` and `.video-container` widths and test at multiple viewport sizes (mobile fallback required).

# Examples (location pointers)

- Hero section: `home.html` -> <section id="hero"> contains `.text-container` and `.video-container`.
- Core CSS: `css/style.css` -> contains `@font-face`, `#hero`, `.text-container`, `.video-container` rules.

# When to ask the user

- If you need to add a build step, package manager, or new third-party library, confirm preferences first (they are not present now).
- If you cannot find expected font files in `fonts/`, ask which font formats to use or if they should be uploaded.

# Final notes

- Keep edits minimal and preview in-browser. This is a small static site—changes are low-risk but should be verified visually.
- If you'd like, I can open a follow-up PR that: fixes the `@font-face` rule, adds example font files, and updates the iframe to a demo 360° source.

Please review and tell me if you'd like more detail on any workflow or additional examples added.
