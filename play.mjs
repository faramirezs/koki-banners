/*
 * play.mjs — mount one Banner from banners.json into a box, live, and keep it fitted.
 *
 * The lab renders a Banner into a 1920x1080 window (`banner.html`, `one.html`). A published page
 * has a viewport instead, so the stage stays 1920x1080 — the size the composition was measured at
 * — and is scaled to the box it sits in. Scaling the stage and not the type is what keeps the
 * banner the banner that was judged: `fitType` sized every line against the 1920px column, and a
 * smaller column would re-fit it to different type.
 *
 * `live` is on: a published page is for watching, and a paused timeline is a poster. `animate()`
 * builds the timeline paused — the gallery plays it on hover, `one.html` seeks it for a still — so
 * a live page has to start it. It repeats on its own from there, so nothing drives it after that.
 */
import { mount } from "./mount.mjs";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

export async function play(id, host, { live = true } = {}) {
  const all = await fetch("banners.json").then((r) => r.json());
  const spec = all.find((b) => b.id === id);
  if (!spec) throw new Error(`unknown banner id "${id}"`);

  const stage = document.createElement("div");
  stage.className = "stage";
  host.appendChild(stage);
  const handle = await mount(spec, { host: stage, live });
  if (live) handle.tl?.play();

  const fit = () => {
    const s = Math.min(host.clientWidth / STAGE_W, host.clientHeight / STAGE_H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  };
  new ResizeObserver(fit).observe(host);
  fit();

  return { ...handle, spec, fit };
}
