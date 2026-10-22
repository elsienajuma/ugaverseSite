# BWAT.md

This file provides guidance to Bwat when working with code in this repository.

## Tech Stack

- Plain static site: HTML, CSS, and vanilla JavaScript. No framework, no CMS, no data layer — do not introduce one without explicit approval. The one approved build step is the Tailwind CSS build for `daddys-house.html` (see below); `index.html` and `player.html` need none.
- Three HTML entry points: `index.html` (homepage), `daddys-house.html` (Daddy's House project page), `player.html` (360° video player, A-Frame, embedded by Daddy's House via iframe).
- A-Frame 1.4.0 loaded from `https://aframe.io/releases/1.4.0/aframe.min.js` (CDN — `player.html` needs internet; not bundled locally).
- `index.html` uses the stylesheet `css/style-system.css` and these scripts: `js/site.js` (nav toggle, year stamp), `js/reveal-system.js` (scroll reveal), `js/steps-flip.js` (How it works card flip, desktop), `js/strip-system.js` (gold scrolling strips), `js/digital-home.js` (phone slideshow and cards), `js/hero-search.js` (typing search box), `js/past-work.js` ("See past work" button shows Coming soon), `js/photo-band.js` (photo band: drag, arrows and enlarged-photo viewer with captions) and `js/copy-email.js` (copies the email address on desktop). `daddys-house.html` is a standalone page: it does NOT use `css/style-system.css` or `js/site.js`. It has its own inline `<style>` and `<script>` plus `css/daddys-house.css`, which is compiled from the Tailwind classes in the page. `player.html` is also fully self-contained — its own inline `<style>` and `<script>`, and its Daddy's Airbnb video scenes are a hardcoded array in the file rather than an external data source.
- `index.html` and `player.html` use self-hosted fonts in `fonts/`. `daddys-house.html` loads Koh Santepheap, Plus Jakarta Sans and Material Symbols from Google Fonts.
- Vercel Analytics (`/_vercel/insights/script.js`) is on `index.html` and `daddys-house.html`.
- `robots.txt` and `sitemap.xml` at the repo root point to `https://ugaverse.vercel.app`; update both if the domain changes or a page is added.

## Brand Identity

This section describes `index.html` and `css/style-system.css`. `daddys-house.html` has its own look (sky and azure blues, forest green, gold, light-lime accents, Koh Santepheap and Plus Jakarta Sans) defined by its Tailwind theme in `tools/tailwind/tailwind.config.js` and its inline styles; follow that page's existing classes and colours there.

**Colors** (defined in `:root` of `css/style-system.css` — use these tokens, never new hex values):
- Primary: `var(--blue)` = `#152b66` — page background, headings on light sections
- Secondary / dark: `var(--blue-dark)` = `#0e1d42` — mobile nav, card backgrounds; `var(--blue-night)` = `#0b1734` is deeper still (footer, photo band)
- Accent: `var(--yellow)` = `#f2c40f` (`var(--yellow-soft)` = `#f7d24a` for hovers) — h1s, eyebrows, buttons, focus outline
- Surface (light sections): `var(--off-white)` = `#f5f7fc`
- Text on light: `var(--text)` = `#15244a`; on dark: `var(--white)`
- Shadow: `var(--shadow)` = `0 18px 50px rgba(11, 23, 52, 0.16)`

**Typography**:
- Display/headings: "Roca Two" (local TTF, weight 700)
- Eyebrows and buttons: "Decalotype" (local woff2, 700), uppercase with `letter-spacing: 0.12em`
- Body: "Open Sauce Two" / "Open Sauce Sans" (local TTF)
- Type and spacing come from the scales in `:root` (`--text-*`, `--space-*`); h1 is `var(--text-h1)`

**Geometry**:
- Radius: `--radius-sm` 12px, `--radius-md` 24px, `--radius-lg` 32px
- Container: `--container` 1200px; spacing is on a 4px grid (`--space-1` to `--space-24`); two breakpoints, 640px and 1024px, mobile-first
- Buttons: uppercase Decalotype, min-height 48px, 2px borders, hover `translateY(-2px)`; the header "Get me online" button is a gold pill

**Visual language**: Dark navy + gold, immersive/premium feel — oversized display type, generous rounded cards (20–32px), soft deep shadows, light sections alternating with the navy base, subtle white-alpha borders and fills (`rgba(255,255,255,0.07)` etc.) for depth.

## Coding Conventions

- BEM-style class naming: `.block__element--modifier` (e.g. `site-header__inner`, `button--primary`). This applies to `index.html` and `css/style-system.css`; `daddys-house.html` uses Tailwind utility classes.
- After changing classes in `daddys-house.html`, rebuild its CSS or the new styles will not appear: in `tools/tailwind/` run `npm install` once, then `npm run build` (writes `css/daddys-house.css`). Commit the rebuilt file. Keep the `<link>` to `css/daddys-house.css` at the end of `<head>`, after the page's inline `<style>`.
- 4-space indentation in HTML, CSS, and JS.
- Buttons/eyebrows get uppercase via CSS `text-transform` — never write ALL-CAPS text in markup.
- Accessibility is load-bearing, preserve it: skip-link, `.sr-only`, `aria-expanded` toggling, `:focus-visible` yellow outline, Escape closes the mobile nav, `aria-live` status for Share.
- `player.html` must stay a standalone, self-contained page — do not merge it into `daddys-house.html` or make it depend on `css/style-system.css`/`js/site.js`. A future second destination should get its own copy of `player.html`, not a shared/generic viewer.

## Architecture Notes

The site is three independent static pages, not a data-driven template. Only `index.html` uses `css/style-system.css` and the scripts listed above; `daddys-house.html` and `player.html` are self-contained. `player.html` is embedded by `daddys-house.html` via `<iframe src="player.html?id=daddys-airbnb">`, but the `?id=` parameter is currently unused — the player's six Daddy's Airbnb scenes (`{ name, src }`) are a hardcoded array inside `player.html` itself. Daddy's Airbnb media lives under `demos/daddys-airbnb/`. If a second destination is ever added, the intended approach is to copy `player.html`, replace its scene array, and give the new destination its own page — not to reintroduce a shared JSON data source or loader script.

## Commands

- Serve locally: from the repo root, `python -m http.server 8000`, then open `http://localhost:8000/`. Open pages without a trailing slash (`/daddys-house.html`); with one, relative CSS and image paths break.
- Build the Daddy's House CSS: in `tools/tailwind/`, `npm install` (once) and `npm run build`.
- No test or lint commands exist.

## Gotchas

- `.gitignore` excludes `*.mp4` / `*.mov` / `*.MOV`, plus `backups/`, `*.bak`, `.temp_*`, with one exception: `demos/daddys-airbnb/video-360/*.mp4` (the 14 player scene videos, 4K + 2K) is tracked because Vercel deploys from git and `player.html` requests them from the deployed site. Source clips such as `demos/daddys-airbnb/video/*.MOV` stay untracked. Don't add other video exceptions without asking.
- `.vercelignore` lists `tools/` (the Tailwind build files). After the first deploy, check that `/tools/tailwind/tailwind.config.js` is not served; if it is, the ignore file is not honoured for Git deployments.
- `demos/` directories exist only for real projects — no empty placeholder dirs, no `.gitkeep` files.
- Never invent contact details, booking info, or addresses beyond what's already on the page. The only public contact is the email address in the About row and footer; no phone number or street address is published.
- The photo band's captions come from `data-caption` on each photo in `index.html`; add `data-project="page.html"` to a photo to show a "View this project" link after its caption (none are set yet). Each photo appears twice in the band so it loops: put the attributes on the first copy only.
- Original, full-size gallery photos are kept outside the repository (they are large); the page uses compressed WebP copies in `images/web/`.
