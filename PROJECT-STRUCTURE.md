# Ugaverse project structure

## Active website

The active MVP is a plain static HTML, CSS, JavaScript, and JSON website.

- `index.html` is the public homepage. Its `#demos` section remains the "Who we work with" section.
- `destination.html` renders destination content selected with an `id` query parameter.
- `player.html` is the video/360-video player. Opening it without an `id` uses the lightweight test clip.
- `viewer.html` is the 360 panorama viewer.
- `css/style.css` contains the active shared responsive styles.
- `js/site.js` controls homepage navigation and industry/project cards.
- `js/destination-data.js` loads and normalizes destination data.
- `data/destinations.json` is the active destination data source.
- `images/destinations/ndere/`, `immersive/ndere/`, and `audio/ndere/` contain the temporary Ndere test assets.
- `videos/player-test.mp4` is the single lightweight development clip retained to verify the video player. It is not a public destination project.

Use a local HTTP server so browser `fetch()` requests can load the JSON data:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Temporary project

Ndere Cultural Centre remains temporarily available at `destination.html?id=ndere` to test the panorama/image experience. It has not been recategorized.

## Planned projects

- Hospitality: Daddy's Airbnb — planned as a video-led experience using one longer video or video scenes.
- Real Estate and Construction: a future project will replace the temporary test use case later.
- Tourism and Culture, Education, and other categories: future projects will be added when real project material is ready.

Industry cards without an active project display a coming-soon state and do not link to fabricated destinations.

## Supported and planned experience types

The existing data-loading layer supports galleries, multiple destination videos, and panorama collections, while the standalone test player supports the retained 360 test clip.

The intended project model must continue to allow:

- Standard images
- One standard video
- Multiple videos
- 360 video
- 360 panorama
- Combinations of media types
- Unity WebGL later

Unity WebGL is not implemented. The current schema uses compatibility fields such as `gallery`/`images`, `videos`/`immersive.videos`, and `panorama`/`immersive.images`. Before mixed-media or Unity projects are added, the schema will need a small, deliberate extension rather than another destination-specific fallback.

## External media

High-resolution masters, duplicate videos, retired project media, and the legacy mobile project are intentionally stored outside Git and outside the lightweight active codebase.

The local archive is currently:

```text
../Archived Project Media/
  onomo/
  igongo/
  master-videos/
```

The archive is not a deployment dependency and must not be copied into the repository. Original media should be backed up separately before any future permanent cleanup.

The active `.gitignore` excludes MP4 files by default and permits only `videos/player-test.mp4`. Large production media should eventually be served from suitable media/object storage rather than committed to Git.

## Retained legacy and backups

- `home.html` is retained legacy/experimental work and is not the main entry point.
- `backups/` is retained locally but ignored by Git.
- `.temp_*` and `*.bak` files are ignored.
