/**
 * mount.mjs — the single banner lifecycle. Browser side.
 * mount(spec, {host, at, live, overrides}) -> {bn, tl, seek, dispose}.
 * Every page renders through here; no caller sequences render/decode/settle/animate by hand.
 */
import { renderBanner, animate, settle } from "./lab.js";
import { MODES, FIELDS, EXTRA_AXES } from "./space.mjs";
const ALLOWED = new Set([...FIELDS, ...EXTRA_AXES, "typeScale"]);
function applyOverrides(spec, record = {}) {
  const out = { ...spec };
  for (const [k, v] of Object.entries(record)) {
    if (!ALLOWED.has(k)) throw new Error(`unknown override "${k}"`);
    out[k] = v;
  }
  return out;
}
export async function mount(spec, { host = document.body, at = null, live = false, overrides = null } = {}) {
  if (!MODES[spec.mode]) throw new Error(`unknown mode "${spec.mode}"`);
  const s = overrides ? applyOverrides(spec, overrides) : spec;
  const bn = renderBanner(s);
  if (s.typeScale != null) bn.style.setProperty("--type-scale", s.typeScale);
  host.appendChild(bn);
  await Promise.all([...host.querySelectorAll(".bn__img")].map((i) => i.decode().catch(() => {})));
  await settle(bn);
  const tl = animate(bn, s);
  const seek = (t) => {
    tl?.pause();
    tl?.seek(t);
    for (const a of window.__sheets || []) a.currentTime = t * 1000;
  };
  if (!live && (at !== null || !tl)) seek(at ?? 6);
  let dead = false;
  return {
    bn, tl, spec: s,
    seek,
    dispose() {
      if (dead) return;
      dead = true;
      try { tl?.kill(); } catch {}
      bn.remove();
    },
  };
}
