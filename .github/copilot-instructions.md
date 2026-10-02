<!-- Copilot / AI agent quick instructions for the Ugaverse static site -->
# Ugaverse repository guide

## Active architecture

- The site is plain static HTML, CSS, and JavaScript. It has no framework, package manager, build step, CMS, or data layer.
- Three HTML pages: `index.html` (homepage), `daddys-house.html` (Daddy's House project page), `player.html` (standalone 360° video player, embedded by Daddy's House via iframe).
- Homepage hero visuals use `.hero__visual` with dimension-independent square (1:1) images; use PNG for required transparency, or JPEG, WebP, or AVIF for suitable optimized delivery.
- `css/style.css` contains the active shared responsive styles, used by `index.html` and `daddys-house.html`. `player.html` has its own self-contained inline `<style>` block and does not use `css/style.css`.
- `js/site.js` controls the mobile nav toggle, homepage/Daddy's House slideshows, and the footer year stamp, used by `index.html` and `daddys-house.html`. `player.html` has its own self-contained inline `<script>` and does not use `js/site.js`.
- `player.html`'s Daddy's Airbnb 360° scenes are a hardcoded array inside the file itself — there is no JSON data source or loader script.

## Project media

- Daddy's Airbnb media lives under `demos/daddys-airbnb/`.
- Do not create empty future project directories or placeholder `.gitkeep` files.

## Editing guardrails

- Treat current working code as the source of truth and preserve working behavior.
- Keep `player.html` a standalone, self-contained document — do not fold it into `daddys-house.html` or make it depend on `css/style.css`/`js/site.js`.
- Do not reintroduce a generic multi-destination data layer (JSON schema, loader script, `?id=` routing) unless a second destination is actually being added and the approach is discussed first.
- Do not introduce a framework or build system without explicit approval.

## Local preview

Run from the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.
