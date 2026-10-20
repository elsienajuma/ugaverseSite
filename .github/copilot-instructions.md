<!-- Copilot / AI agent quick instructions for the Ugaverse static site -->
# Ugaverse repository guide

## Active architecture

- The site is plain static HTML, CSS, and JavaScript. It has no framework, CMS, or data layer. The one build step is the Tailwind CSS build for `daddys-house.html` (`tools/tailwind/`, see below).
- Three HTML pages: `index.html` (homepage), `daddys-house.html` (Daddy's House project page), `player.html` (standalone 360° video player, embedded by Daddy's House via iframe).
- Homepage hero visuals use `.hero__visual` with dimension-independent square (1:1) images; use PNG for required transparency, or JPEG, WebP, or AVIF for suitable optimized delivery.
- `css/style.css` contains the active shared responsive styles, used by `index.html` only. `daddys-house.html` and `player.html` do not use it.
- `js/site.js` controls the mobile nav toggle, homepage slideshows, and the footer year stamp, used by `index.html` only. `daddys-house.html` and `player.html` have their own self-contained inline `<script>` blocks.
- `daddys-house.html` is a standalone page styled by an inline `<style>` block plus `css/daddys-house.css`, which is compiled from the Tailwind classes in the page. After changing classes in `daddys-house.html`, rebuild it: in `tools/tailwind/` run `npm install` once, then `npm run build`. Keep the `<link>` to `css/daddys-house.css` at the end of `<head>`, after the inline `<style>`.
- `daddys-house.html` loads Google Fonts; `index.html` and `player.html` use the self-hosted fonts in `fonts/`. Vercel Analytics is on `index.html` and `daddys-house.html`. `robots.txt` and `sitemap.xml` at the repo root use the domain `https://ugaverse.vercel.app`.
- `player.html`'s Daddy's Airbnb 360° scenes are a hardcoded array inside the file itself — there is no JSON data source or loader script.

## Project media

- Daddy's Airbnb media lives under `demos/daddys-airbnb/`.
- Do not create empty future project directories or placeholder `.gitkeep` files.

## Editing guardrails

- Treat current working code as the source of truth and preserve working behavior.
- Keep `player.html` a standalone, self-contained document — do not fold it into `daddys-house.html` or make it depend on `css/style.css`/`js/site.js`.
- Do not reintroduce a generic multi-destination data layer (JSON schema, loader script, `?id=` routing) unless a second destination is actually being added and the approach is discussed first.
- Do not introduce a framework or another build system without explicit approval (the Tailwind build for `daddys-house.html` is the one approved exception).

## Local preview

Run from the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`. Open pages without a trailing slash (for example `/daddys-house.html`), or relative CSS and image paths break.
