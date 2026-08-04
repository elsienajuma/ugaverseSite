<!-- Copilot / AI agent quick instructions for the Ugaverse static site -->
# Ugaverse repository guide

## Active architecture

- The site is plain static HTML, CSS, JavaScript, and JSON. It has no framework, package manager, build step, or CMS.
- `index.html` is the public homepage.
- `project.html?id=PROJECT_ID` is the reusable project landing-page template.
- `player.html` is the specialist 360-video player.
- `viewer.html` is the specialist 360-panorama viewer.
- Future WebGL experiences should use a separate specialist wrapper if required.
- `css/style.css` contains the active shared responsive styles.
- `js/site.js` controls homepage navigation and sample-project cards.
- `js/destination-data.js` loads and normalizes `data/destinations.json`.

## Project media

- Project-specific media belongs under `projects/PROJECT_ID/`.
- Ndere is the current temporary test project under `projects/ndere/`.
- `videos/player-test.mp4` is the intentional generic video-player test asset.
- Large masters and archived media remain outside the repository.
- Do not create empty future project directories or placeholder `.gitkeep` files.

## Editing guardrails

- Treat current working code as the source of truth and preserve working behavior.
- Keep `player.html` and `viewer.html` independent; do not create a universal media viewer.
- Keep industry/category separate from experience type.
- Preserve the `#demos` homepage anchor for the “Who we work with” section.
- Add optional project experiences through project data and render only blocks that have data.
- Do not introduce a framework or build system without explicit approval.

## Local preview

Run from the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`. Use an HTTP server because the site fetches JSON.
