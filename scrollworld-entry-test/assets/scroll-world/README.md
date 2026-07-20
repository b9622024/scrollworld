# Scroll World v1 assets

## Formal scenes

- Scene 01: `images/scene-01-exterior.webp`
- Scene 02: `images/scene-02-foyer.webp`
- Scene 03: `images/scene-03-hallway.webp`
- Scene 04: `images/scene-04-analysis-entrance.webp`
- Scene 05: `images/scene-05-analysis-room.webp`
- Scene 06: `images/scene-06-energy-report.webp`
- Scene 07: virtual report close-up using Scene 08; no separate image
- Scene 08: `images/scene-08-coach-reveal.webp`
- Scene 09: `images/scene-09-action-path.webp`
- Scene 10: `images/scene-10-courtyard.webp`

## Transitions

- Scene 01 -> 02: `videos/scene-01-to-02.mp4`
- Scene 02 -> 03: `videos/scene-02-to-03.mp4`
- Scene 03 -> 04: `videos/scene-03-to-04.mp4`
- Scene 04 -> 05: `videos/scene-04-to-05.mp4`
- Scene 08 -> 09: `videos/scene-08-to-09.mp4` (02 stable version)
- Scene 09 -> 10: frontend warm-light transition, no Luma interpolation
- Scene 10 ambient: `videos/scene-10-courtyard-ambient.mp4`

Unused or superseded test media lives under `archive/` and is not referenced by the page.

To replace a scene without changing animation parameters, keep the same filename, dimensions, aspect ratio, and visual focal point. Replace the file in `images/` or `videos/`, then update the asset version query in `index.html` if a browser cache needs to be bypassed.
