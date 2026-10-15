# koki-banners

Two KoKitchen banners from `koki-screens/banner-lab`, published as live HTML:

- **Bring your own cup** — `u1-b0024` — <https://faramirezs.github.io/koki-banners/own-cup.html>
- **Membership** — `k1-b0001` — <https://faramirezs.github.io/koki-banners/membership.html>

Both are the deck's own Banner, rendered by the lab's own runtime: the same `lab.js` that the
gallery, `one.html` and the video pipeline use. `play.mjs` mounts the spec from `banners.json` on a
1920x1080 stage and scales the stage to the viewport, so the type is the type the composition was
measured at and not a re-fit.

`?id=` overrides the Banner, for any id in `banners.json`.

## What is here

| File | What it is |
|---|---|
| `index.html` | Landing page: both banners, live, scaled into 16:9 frames |
| `own-cup.html`, `membership.html` | One banner, the whole viewport |
| `play.mjs`, `play.css` | The shell: mount a Banner into a box, keep it fitted |
| `lab.js`, `lab.css`, `space.mjs`, `strategy.mjs`, `mount.mjs` | The lab runtime, copied unmodified from `banner-lab` |
| `banners.json` | Only the two specs the pages mount |
| `photos2/` | Only the two photos and their cutouts those specs name |
| `vendor/` | GSAP and the OFL fonts (Anton, Montserrat, Playfair Display) with their licences |

Copies are snapshots, not a build: re-copy from `banner-lab` when the runtime or a spec changes.

The two banners are the ones rendered to video for the screen. The video is the same composition at
30 fps, cut at a loop seam; this page is that composition running live.
