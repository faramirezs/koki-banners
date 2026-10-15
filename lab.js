/*
 * lab.js — renders one banner from its spec, animates it, and drives the gallery.
 *
 * One banner = one spec object from banners.json. The spec is also the feedback key, so a
 * verdict can always be traced back to the exact combination of axes that produced it.
 *
 * Motion model: one timeline of fixed duration LOOP that returns to its start state, so it
 * loops forever without a jump. That is the same constraint the video pipeline enforces
 * with the loop-seam check, which means a banner picked here can be exported to video with
 * the motion it was judged on.
 */
import { BG_RECIPES, MOTION_SPEC, NEEDS_CUTOUT, PHASES, ROLE_MOTION, BG_ENERGY_CURVES, MODES, DIRECTIONS, HOOKS, CUPFIELD, CUP_ROLLS, PALETTE_FILL } from "./space.mjs";


// --------------------------------------------------------------------------- //
// helpers
// --------------------------------------------------------------------------- //

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

/** Deterministic per-banner RNG so a spec always renders identically. */
function rngFrom(id) {
  let a = 0;
  for (let i = 0; i < id.length; i++) a = (a * 31 + id.charCodeAt(i)) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --------------------------------------------------------------------------- //
// decorations
// --------------------------------------------------------------------------- //

const DECOR_ART = {
  splash: (n, w, h) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__splash", x: (i % 3) * 34 + 6, y: (i % 2) * 46 + 8,
    size: 10 + ((i * 7) % 9), rot: i * 23,
  })),
  flames: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__flame", x: i * 13 + 2, y: i % 2 ? 76 : 4, size: 7 + (i % 4) * 2.2, rot: i % 2 ? 8 : -6,
  })),
  rings: (n) => Array.from({ length: n }, (_, i) => ({
    cls: `bn__ring${i % 2 ? " bn__ring--dashed" : ""}`, x: 30 + i * 9, y: 18 + i * 11, size: 7 + i * 3,
  })),
  confetti: (n) => Array.from({ length: n }, (_, i) => ({
    cls: i % 3 === 0 ? "bn__dot" : "bn__streak", x: (i * 17) % 96, y: (i * 29) % 92, size: 1.6 + (i % 4) * .7, rot: i * 37,
  })),
  leaves: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__splash", x: (i * 23) % 90, y: (i * 31) % 84, size: 5 + (i % 3) * 2, rot: i * 61,
  })),
  sparkles: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__star", x: (i * 13) % 94, y: (i * 41) % 88, size: 2.4 + (i % 3) * 1.6,
  })),
  streaks: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__streak", x: (i * 19) % 92, y: (i * 27) % 90, size: 2 + (i % 4) * 1.1, w: 10 + (i % 3) * 7,
  })),
  bubbles: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__bubble", x: (i * 21) % 92, y: (i * 37) % 86, size: 3 + (i % 5) * 1.6,
  })),
  doodles: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__doodle", x: (i * 11) % 92, y: (i * 33) % 88, size: 6 + (i % 4) * 3,
  })),

  // ---- the Membership campaign's marks ------------------------------------------------
  // Marks, not shapes. The campaign deck asks whether a mark helps the ad or only fills it,
  // so these are small, few, and in the accent - a dotted rhythm and a tick rhythm, nothing
  // that could be mistaken for a product or a second headline.
  dots: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__pip", x: (i * 17) % 90 + 4, y: (i * 29) % 86 + 5, size: 1.1 + (i % 3) * .5,
  })),
  marks: (n) => Array.from({ length: n }, (_, i) => ({
    cls: "bn__tick", x: (i * 23) % 88 + 5, y: (i * 37) % 84 + 6, size: .5, w: 2.4 + (i % 3) * 1.3, rot: -38,
  })),

  // ---- the Direction families' material cues --------------------------------------------
  // Not decoration: a print rule and a punch mark. They are the Expression Kit's "material cues
  // instead of generic decor" - a rule that belongs to a printed poster, a punch grid that belongs
  // to the membership card - and they are single, fixed elements rather than a scattered field.
  // A Direction that allows decoration allows only these, so "more decoration" can never mean
  // "more shapes": it means one more material gesture, or none.
  rule: () => [{ cls: "bn__rule", x: 5, y: 3.2, size: 90, w: .45 }],
  stamp: () => [{ cls: "bn__stamp", x: 88, y: 88, size: 8 }],
};

/**
 * How many marks each decoration draws. The general treatments randomise the count, because
 * "how many" is part of what they are testing; the campaign's are fixed, because a count that
 * varied with the Banner would be a hidden variable inside a controlled comparison.
 */
const DECOR_COUNT = { dots: 7, marks: 6 };

function decorLayer(spec, rng) {
  const wrap = el("div", "bn__decor");
  if (spec.decor === "none") return wrap;
  const make = DECOR_ART[spec.decor];
  if (!make) return wrap;
  const n = DECOR_COUNT[spec.decor] ?? 6 + Math.floor(rng() * 6);
  for (const d of make(n)) {
    const node = el("div", d.cls);
    const u = 19.2; // 1 unit at 1080p
    node.style.left = `${d.x}%`;
    node.style.top = `${d.y}%`;
    node.style.width = `${d.size * u}px`;
    node.style.height = `${d.w ? d.w * u : d.size * u}px`;
    if (d.rot) node.style.rotate = `${d.rot}deg`;
    wrap.appendChild(node);
  }
  return wrap;
}

/**
 * The background is three oversized gradient sheets sliding past each other, the trick from
 * the brief: a hard 50/50 split of two colours, thrown far past the edges, sliding on an
 * `alternate` ease. Three of them at different speeds and directions never settle into a
 * still image, which is the whole point.
 *
 * Each sheet's duration divides half the loop, so after LOOP seconds the composite is
 * exactly where it started and the video can loop without a jump.
 */
function bgLayers(spec, p) {
  const bg = el("div", "bn__bg");
  const recipe = BG_RECIPES[spec.bg] || BG_RECIPES.triSlide;
  const base = el("div", "bn__bgBase");
  base.style.background = p.slide[0];
  bg.appendChild(base);

  for (let i = 0; i < recipe.layers; i++) {
    const a = p.slide[i % p.slide.length];
    const b = p.slide[(i + 1) % p.slide.length];
    const sheet = el("div", "bn__slide");
    sheet.style.setProperty("--a", a);
    sheet.style.setProperty("--b", b);
    sheet.style.setProperty("--ang", `${recipe.angle - i * 18}deg`);
    sheet.style.setProperty("--op", recipe.opacity);
    sheet.style.setProperty("--dur", `${recipe.dur[i % recipe.dur.length]}s`);
    sheet.style.animationDirection = i % 2 ? "alternate-reverse" : "alternate";
    if (recipe.blend) sheet.style.mixBlendMode = recipe.blend;
    if (recipe.kind) sheet.classList.add(`bn__slide--${recipe.kind}`);
    bg.appendChild(sheet);
  }
  return bg;
}

// --------------------------------------------------------------------------- //
// render
// --------------------------------------------------------------------------- //

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The Membership punch card, drawn rather than photographed.
 *
 * `brand/punch-card-koki.jpg` is the reference: a rounded card, a tan band carrying the brand,
 * and a grid of punch circles - the used ones filled, the rest outlined. It is drawn here rather
 * than pasted because the card is a *count*: ten meals, ten punches, and the count has to be able
 * to change with the offer.
 *
 * This is the motif, not a copy. It carries no wording the campaign did not give it - the brand
 * mark and "10 MEALS" - and it is deliberately not a ground: it is an object on the ground, the
 * way a product photo is. All ten punches are filled, because this is the card as it is handed
 * to you, not one half spent.
 */
function punchCard() {
  const card = el("div", "bn__card");
  const head = el("div", "bn__cardHead");
  head.appendChild(el("span", "bn__cardBrand", "KO KITCHEN"));
  card.appendChild(head);
  const body = el("div", "bn__cardBody");
  const grid = el("div", "bn__punches");
  for (let i = 0; i < 10; i++) grid.appendChild(el("span", "bn__punch bn__punch--used"));
  body.appendChild(grid);
  const foot = el("div", "bn__cardFoot");
  foot.appendChild(el("span", "bn__cardCount", "10"));
  foot.appendChild(el("span", "bn__cardUnit", "MEALS"));
  body.appendChild(foot);
  card.appendChild(body);
  return card;
}

/**
 * The card, as the placement asks for it. `tilt` is a small pile of two cards rather than one
 * rotated card: "tilted/layered" is a different idea from "tilted", and the second card is what
 * makes it read as a stack of passes rather than as a crooked rectangle.
 */
function cardsFor(placement) {
  if (placement === "none" || !placement) return [];
  if (placement !== "tilt") return [punchCard()];
  const back = punchCard();
  back.classList.add("bn__card--back");
  const front = punchCard();
  front.classList.add("bn__card--front");
  return [back, front];
}

/**
 * The roll one strip of the wall takes.
 *
 * The component *along* the strip counter-rolls; the component *across* it is shared by every strip.
 * A strip is the window its cups roll through, and a window cannot slide sideways through its own
 * frame - the cups would be cut in half at the seam between two strips. So for rows the x alternates
 * and the y is common, and for columns it is the other way round.
 *
 * A diagonal roll has a component on both axes and is therefore safe in neither orientation; it is
 * built as one unbanded layer and is the one roll this is never called for.
 */
function stripRoll(travel, dir, vertical) {
  return vertical ? { x: travel.x, y: travel.y * dir } : { x: travel.x * dir, y: travel.y };
}

/**
 * The cup field: the tiled ground the reusable cup crosses, and the cell it comes to rest in.
 *
 * The geometry comes from `CUPFIELD`. The ground is its own element - `.bn__cups` - and not the
 * field's own background, because the wipe is a mask and a mask on the field would erase the cup
 * that is doing the erasing. The cell is a plain box at the grid cell the cup lands on; it does not
 * read the roll, because the cup is not carried by the field any more, it crosses it.
 *
 * The glow's position is written here rather than in the stylesheet because it is a fact about
 * where the cup ends up, and only this function knows that.
 */
function cupField(bn, spec) {
  const roll = CUP_ROLLS[spec.roll];
  const [col, row] = CUPFIELD.cell;
  const [tx, ty] = roll.tiles;
  const moving = tx !== 0 || ty !== 0;
  const still = !moving;
  // A roll with a vertical component and no horizontal one is the case where the windows have to be
  // columns.
  const vertical = ty !== 0 && tx === 0;
  // A strip is a window its cups roll through, and a window cannot slide through its own frame. A
  // shift *along* the strip is a shift of the pattern inside the window; a shift *across* it carries
  // the cups out of the band they were drawn in and cuts them at the seam. Rows are therefore safe
  // for a horizontal roll and columns for a vertical one, and a roll with a component on both axes -
  // the diagonal - has a component across *every* orientation. That one is a single layer with no
  // seams to cut at, and it is the one roll that does not counter-roll.
  const banded = !still && (tx === 0) !== (ty === 0);
  bn.classList.add("bn--cupfield");
  bn.style.setProperty("--tile", `calc(var(--u) * ${CUPFIELD.tile})`);
  bn.style.setProperty("--mug-w", CUPFIELD.mug.w);
  bn.style.setProperty("--mug-h", CUPFIELD.mug.h);
  bn.style.setProperty("--baseline", CUPFIELD.tileSpec.baseline);
  bn.style.setProperty("--cell-x", `calc(var(--tile) * ${col})`);
  bn.style.setProperty("--cell-y", `calc(var(--tile) * ${row})`);
  // The cell's centre at rest, as a fraction of the canvas: the tile is `CUPFIELD.tile` units, and
  // the unit is `min(w, h * 1.78) / 100`, so the whole position is a function of the spec's size.
  const u = Math.min(spec.width, spec.height * 1.78) / 100;
  const tile = CUPFIELD.tile * u;
  // The wipe's own dissolve, in the tile's units so it is the same fraction of the canvas at every
  // size. It is read from the same table the Timeline animates against, so the width the mask
  // draws and the width the boundary travels past cannot be two different numbers.
  const soft = tile * CUPFIELD.wipe.soft;
  bn.style.setProperty("--wipe-soft", `${soft}px`);
  // The speed smear trails the motion, so it points back along the roll. It is a length in the
  // tile's own units, which is what makes it the same size on a thumbnail and on a TV.
  const smear = tile * 0.22;
  // The bloom is placed on the cup's *settled* centre, not on the box it was built with: the cup
  // grows about its foot as it takes the scene, so a light pinned to the unshifted centre sits low
  // on the body by the time the words arrive. `base` is the floor it stands on, which is where the
  // light pools and what stops the glow reading as a lamp hanging in the air.
  const cx = (col + 0.5) * tile;
  const foot = (row + CUPFIELD.tileSpec.baseline) * tile;
  // The cup grows about its foot, so its centre is a function of whatever scale it is at. The light
  // has to be at that centre *at every frame*, not at the centre the cup ends on: a bloom that runs
  // ahead of the object it is coming off is the one thing that makes a glow read as a decal. So the
  // three centres are computed here and the Timeline tweens between them on the same beats and with
  // the same eases as the cup's own scale.
  const mid = (scale) => ((foot - (CUPFIELD.mug.h * tile * scale) / 2) / spec.height) * 100;
  const glow = {
    x: (cx / spec.width) * 100,
    y: mid(1),
    yFrom: mid(CUPFIELD.emerge.scale),
    yTo: mid(CUPFIELD.shift.scale),
    base: (foot / spec.height) * 100,
  };
  // The travel is what the field moves *by* across one roll, and it is positive and whole cells.
  // The loop runs it twice - out on the brake and again on the way out - so the ground is at a
  // multiple of the tile at both ends of the loop whatever the direction.
  const travel = { x: tx * tile, y: ty * tile };
  bn.__cupfield = { glow, tile, moving, soft, travel };

  const field = el("div", "bn__cupfield");
  const cups = el("div", "bn__cups");
  cups.dataset.axis = still ? "still" : !banded ? "wall" : vertical ? "v" : "h";
  // The wall is built as strips, one per line of the grid, because the effect is that *adjacent
  // lines counter-roll*: the strips are the overflow windows the cups roll through, and they are
  // what lets one line move one way while the line beside it moves the other. A single tiled
  // background can only have one `background-position`, so a single layer can only roll one way.
  //
  // The strips are perpendicular to the roll's own axis - rows for a horizontal roll, columns for a
  // vertical one - so a strip is always a window the cups cross rather than a band they slide along.
  // One extra strip is laid past the far edge, because the last line has to be whole.
  const strips = banded ? Math.ceil((vertical ? spec.width : spec.height) / tile) + 1 : 1;
  for (let k = 0; k < strips; k++) {
    const strip = el("div", "bn__cupstrip");
    strip.style.setProperty("--strip", `${k * tile}px`);
    // Even lines roll one way, odd lines the other. `still` is the control and gets no smear at all,
    // and an unbanded wall has no second line to roll against.
    const line = stripRoll(travel, banded && k % 2 === 1 ? -1 : 1, vertical);
    // The smear trails *that line's* motion, so it is read off the line's own components rather than
    // off the wall's - a smear that trailed the wrong way on the lines that counter-roll would give
    // the trick away.
    strip.style.setProperty("--smear-x", `${-Math.sign(line.x) * smear}px`);
    strip.style.setProperty("--smear-y", `${-Math.sign(line.y) * smear}px`);
    cups.appendChild(strip);
  }
  field.appendChild(cups);
  // The light is the field's own, and it is *inside* it: the field is a stacking context, so a
  // halo built as its sibling on the banner would paint over the hero cup instead of behind it -
  // which is a cup under a sheet of orange, not a cup with light on it. It is a sibling of the
  // ground and not a child of it, so the wipe does not take the light with the cups.
  field.appendChild(el("div", "bn__halo"));
  const cell = el("div", "bn__cupcell");
  field.appendChild(cell);
  bn.appendChild(field);
  return cell;
}

export function renderBanner(spec) {
  // Decoration count and placement are derived randomness, not an axis. Seeding them from the
  // Banner's *id* made them vary with the Banner's identity, so a Mode that held `decor` still
  // still showed a different decoration layout on every Banner - a hidden variable inside a
  // controlled experiment. Two Background Banners with the same decoration treatment did not
  // render identically, which is precisely what "held constant" is supposed to rule out. The seed
  // is the decoration value itself, so a treatment is one fixed look that the whole deck shares.
  const rng = rngFrom(String(spec.decor));
  const p = spec.palette;
  const bn = el("div", "bn");
  bn.dataset.id = spec.id;
  // `refit()` is exported and called with the element alone, and one of the things it has to do -
  // anchoring a sliced photo - needs to know which edge the file is cut on. Stash the spec rather
  // than thread it through every caller.
  bn.__spec = spec;
  bn.style.cssText = [
    `--w:${spec.width}px`, `--h:${spec.height}px`,
    `--bg:${p.slide[0]}`, `--bg2:${p.slide[1]}`, `--panel:${p.panel}`, `--ink:${p.ink}`,
    `--accent:${p.accent}`, `--accent2:${p.accent2}`, `--accent-fill:${PALETTE_FILL[spec.paletteName] || p.accent}`,
    `--muted:${p.muted}`, `--on-accent:${p.onAccent}`,
    `--u:${(Math.min(spec.width, spec.height * 1.78) / 100).toFixed(3)}px`,
  ].join(";");
  // A treatment that floats the product needs real alpha; without a cutout, show it framed.
  const treatment = NEEDS_CUTOUT.has(spec.product) && !spec.cut ? "framed" : spec.product;
  bn.dataset.treatment = treatment;
  bn.classList.add(
    `bn--bg-${spec.bg}`, `bn--lay-${spec.layout}`, `bn--type-${spec.type}`,
    `bn--badge-${spec.badge}`, `bn--cta-${spec.cta}`, `bn--prod-${treatment}`,
    `bn--card-${spec.card || "none"}`, `bn--bonus-${spec.bonus || "none"}`,
    // The campaign, not the plan. A campaign may sell more than one plan, and the two plans are
    // two values of one axis - `deliclub` and `deliclub6` are the same poster with different
    // numbers. Keying the class off the plan meant the second plan matched no rule at all: it lost
    // the campaign's label pill, the accent figure and the tight leading, so the deck's "which
    // plan?" question was partly a question about a treatment that had silently gone missing. A
    // copy block with no campaign keeps its own key, which is how the general decks work.
    `bn--copy-${spec.copy.campaign || spec.copy.key}`,
    `bn--energy-${spec.bgEnergy || "flat"}`, `bn--roles-${spec.roleMotion || "uniform"}`
  );
  if (p.mode === "light") bn.classList.add("bn--light");
  // The Direction is metadata, but it is also the one thing that is allowed to change the frame
  // without being an axis: the panel posture (type on the field vs type on a surface) and the
  // Direction's own composition character. Both are CSS, keyed off the Direction's id, so a
  // Direction is a stylesheet as well as a value set - which is what stops it being "just a palette".
  if (spec.direction && DIRECTIONS[spec.direction]) {
    bn.classList.add("bn--direction", `bn--dir-${spec.direction}`);
    if (DIRECTIONS[spec.direction].panelPosture === "field") bn.classList.add("bn--panel-field");
  }

  // where the glow sits: under the product, whichever side the layout put it
  const glowX = spec.layout.includes("Right") || spec.layout === "circleMask" || spec.layout === "topBanner" ? "72%" : spec.layout === "centerStack" || spec.layout === "bottomPlate" ? "50%" : "30%";
  bn.style.setProperty("--glow-x", glowX);
  bn.style.setProperty("--glow-y", "48%");

  bn.appendChild(bgLayers(spec, p));
  // ---- the cup field -------------------------------------------------------------------------
  // Built before anything that sits on it, and only when the spec asks for one: every Banner the
  // lab has ever rendered takes the branch it always took. It replaces the ground, so it is drawn
  // straight over the sheets and the base colour is left showing between the cups.
  //
  // The hero cup's box is a child of a grid cell rather than an absolutely placed element that
  // happens to land on one. The cell and the tiled ground are moved by the same `--roll-x`/
  // `--roll-y`, so the cup is in the grid by construction - which is the whole idea, and which no
  // amount of matching two independent animations would guarantee.
  const cell = spec.roll ? cupField(bn, spec) : null;
  bn.appendChild(el("div", "bn__vignette"));
  // The one layer a communication hypothesis may add. `spotlight-hero` wins attention with light
  // rather than with travel, and light has to be a layer behind the object to be light. It is
  // built only when the Hook's plan asks for it, so a Banner without a Hook - every Banner the lab
  // has ever rendered - has exactly the elements it had before. The cup field has a light too, but
  // it builds its own inside itself, for the reason given there.
  const hook = spec.hook ? HOOKS[spec.hook] : null;
  if (hook?.plan?.halo) bn.appendChild(el("div", "bn__halo"));
  bn.appendChild(decorLayer(spec, rng));

  // ---- product ----
  const media = el("div", "bn__media");
  const img = el("img", "bn__img");
  // A Direction deck is built on the brand's own product cutouts, so it always draws the alpha
  // asset. The flat files are the same products photographed on the studio's white sweep, and a
  // white box on an olive field is exactly the "white-box food photography" the kit's visual
  // language rules out. Outside a Direction the rule is unchanged: only the treatments that
  // float the product need alpha.
  const wantsAlpha = NEEDS_CUTOUT.has(spec.product) || (spec.direction && spec.cut);
  img.src = `photos2/${wantsAlpha && spec.cut ? spec.cut : spec.photo}`;
  img.alt = "";
  img.decoding = "sync";
  media.appendChild(img);
  // The cup field's hero arrives at speed, and the speed is drawn as a trail behind it rather than
  // as a blur on it. The trail is a second copy of the same alpha asset inside the cup's own box,
  // so it inherits the entrance, the shift and the cell for free.
  if (spec.roll) {
    const trail = el("img", "bn__trail");
    trail.src = img.src;
    trail.alt = "";
    media.appendChild(trail);
  }
  (cell || bn).appendChild(media);

  // ---- the membership card ----
  // Its own layer, not the product: the card reinforces the plan without becoming the message,
  // so the photo stays and the card is placed against it. Above the media, below the copy, so
  // a card that tucks behind the panel is clipped by the panel and never crosses the words.
  for (const card of cardsFor(spec.card)) bn.appendChild(card);

  // ---- copy ----
  const copy = el("div", "bn__copy");
  // The label is optional for the same reason the call to action is: an empty element still takes
  // a gap in the stack and a slot in the cast. The cup offer is one sentence with no label, and
  // the deck is not allowed to invent one.
  if (spec.copy.kicker) copy.appendChild(el("div", "bn__kicker", spec.copy.kicker));
  const headline = el("h2", "bn__headline");
  for (const line of spec.copy.lines) {
    const node = el("span", "bn__line");
    // `fig` is the line a type treatment may size as the figure - the price in the campaign's
    // offer. Wrapping rather than storing two strings keeps the line exactly the campaign's
    // wording while letting the treatment set the figure against the words it belongs to.
    if (spec.copy.fig && line === spec.copy.fig) node.appendChild(el("span", "bn__fig", line));
    else node.textContent = line;
    headline.appendChild(node);
  }
  copy.appendChild(headline);
  // The per-meal working and the call to action are optional for the same reason the note is:
  // an empty element still takes a gap in the stack and a slot in the cast, and a treatment
  // that paints its slot would paint an empty box. The Deli Club lockup is two lines and a
  // label - it has neither, and the deck is not allowed to invent them.
  if (spec.copy.sub) copy.appendChild(el("div", "bn__sub", spec.copy.sub));
  // The bonus, when the campaign gives one and the placement is not `none`. A line of the
  // stack: no badge shape holds a sentence without shrinking it below reading size.
  if (spec.copy.bonus && spec.bonus !== "none") copy.appendChild(el("div", "bn__bonus", spec.copy.bonus));
  // The quiet second offer. Optional: the general copy blocks have none, and an empty element
  // would still take a gap in the stack and a slot in the cast.
  if (spec.copy.note) copy.appendChild(el("div", "bn__note", spec.copy.note));
  if (spec.copy.cta) copy.appendChild(el("div", "bn__cta", spec.copy.cta));
  bn.appendChild(copy);

  // ---- badge ----
  if (spec.copy.badge) bn.appendChild(el("div", "bn__badge", spec.copy.badge));

  // a first pass so the banner is never shown unfitted; settle() does it properly once the
  // webfont is in, and refit() starts from the stylesheet so the two cannot compound
  fitType(bn);
  requestAnimationFrame(() => refit(bn));
  return bn;
}

// --------------------------------------------------------------------------- //
// motion
// --------------------------------------------------------------------------- //

const q = (root, sel) => [...root.querySelectorAll(sel)];

/**
 * One loop is one story, told in five Phases (see PHASES in space.mjs):
 *
 *   Intro   0.0 - 1.5   the background alone, already sliding
 *   Reveal  1.5 - 3.9   the panel wipes in and the elements slam into it, staggered
 *   Hold    3.9 - 9.5   everything breathes while you read it
 *   Exit    9.5 - 11.1  the elements are thrown back off the canvas
 *   Tail   11.1 - 12.0  the background alone again
 *
 * The Reveal and Exit boundaries move with the size of the cast, so the two interior numbers
 * are the timeline's own, not the design's. The phase boundaries themselves come from PHASES,
 * which is also what the background-energy curves in lab.css are drawn against.
 *
 * The timeline does NOT yoyo: at t=LOOP every element is back in exactly the pose it had at
 * t=0, because the exit ends on the same off-canvas pose the entrance started from. So the
 * loop closes without a jump and without a reversed copy of the entrance.
 */
export const LOOP = PHASES.tail[1];
const T_IN = PHASES.reveal[0];  // the background gets the stage to itself first
const IN_DUR = 0.60;
const IN_STAGGER = 0.08;
const HOLD_END = PHASES.exit[0]; // ~6s of settled, readable time for a typical cast
const OUT_DUR = 0.55;
const OUT_STAGGER = 0.045;
const EASE_IN = "back.out(2.2)"; // the overshoot is the impact
const EASE_OUT = "expo.in";

/** How each element breathes while it is on screen. Amplitudes are deliberately small. */
const IDLE = {
  floatY:   { y: -15 },
  bob:      { y: -24 },
  sway:     { y: -7, rot: 1.5 },
  breathe:  { scale: 1.035 },
  drift:    { y: -11, x: 13, rot: 0.9 },
  pendulum: { y: -5, rot: 2.8 },
  wave:     { y: -17, rot: -1.3, scale: 1.012 },
};

/**
 * How far an element has to move to be completely off the canvas. Measured from its own box,
 * so "left" is off the left edge whether the layout put the element at 5% or 70%.
 */
function offPose(node, root, dir, margin = 90) {
  const r = node.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  if (!r.width && !r.height) return { x: 0, y: 0 };
  if (dir === "left") return { x: -(r.right - b.left) - margin, y: 0 };
  if (dir === "right") return { x: b.right - r.left + margin, y: 0 };
  if (dir === "top") return { x: 0, y: -(r.bottom - b.top) - margin };
  if (dir === "bottom") return { x: 0, y: b.bottom - r.top + margin };
  return { x: 0, y: 0 };
}

/**
 * The background's energy: how far the sheets travel during each Phase.
 *
 * Driven from the Timeline rather than from CSS, so that seeking to a Phase shows the energy that
 * Phase actually has. `flat` has no curve and keeps full travel throughout.
 *
 * Its own function because it is its own Timeline. Background Mode must build this - `bgEnergy` is
 * the only thing that Mode varies, so without it all four values render identically - while
 * Composition Mode must build neither.
 */
function addEnergy(tl, root, spec) {
  const bgEl = root.querySelector(".bn__bg");
  const curve = BG_ENERGY_CURVES[spec.bgEnergy];
  if (!bgEl || !curve) return;
  let prev = 0;
  for (const [t, v] of curve) {
    tl.to(bgEl, { "--energy": v, duration: Math.max(0.001, t - prev), ease: "none" }, prev);
    prev = t;
  }
}

/**
 * The field's own Timeline: the roll, the speed it carries, the wipe the cup crosses with, and the
 * light that comes up behind it.
 *
 * Its own function because it is its own layer. Four properties on one element - `--roll-x`,
 * `--roll-y`, `--speed` and `--clear` - are what the ground, the smear and the wipe all read, so
 * they cannot disagree with each other, and the halo rides the same beat as the cup.
 *
 * The roll runs three times: a flat fast pass, a brake, and the same run again on the way out. The
 * third one is not decoration. `--speed` is 1 at `t=0`, and a field that is smeared at the start of
 * the loop and still at the end of it is a jump however identical the pose is - so the wall has to
 * be moving again by the time the loop restarts, and the whole travel has to land on a multiple of
 * the tile. Both hold: the loop closes on the picture it opened on.
 */
function addCupfield(tl, root, spec, heroFrom) {
  const field = root.querySelector(".bn__cupfield");
  const geom = root.__cupfield;
  if (!field || !geom) return;
  const { travel, glow, moving, soft } = geom;
  const R = CUPFIELD.roll;

  if (moving) {
    const run = R.runFrac;
    // A wall with a single strip has no second line to take the roll backwards, so the direction
    // falls out of the strip list rather than out of a flag here.
    const vertical = travel.y !== 0 && travel.x === 0;
    // One roll per strip, and every other strip takes it backwards. The three moves are the pen's
    // recipe in the only form a loop allows: the roll itself is flat - `ease: "none"`, whole cells,
    // no easing inside the motion - and the deceleration is a separate move on top of it. An eased
    // roll would be a wall that changes speed *within* a pass, which is a different and much less
    // mechanical thing than a wall that passes at one speed and then stops.
    const rollStrip = (node, dir) => {
      const r = stripRoll(travel, dir, vertical);
      tl.fromTo(node, { "--sx": 0, "--sy": 0 },
        { "--sx": r.x * run, "--sy": r.y * run, duration: R.run, ease: "none" }, 0);
      tl.to(node, { "--sx": r.x, "--sy": r.y, duration: R.brake, ease: R.brakeEase }, R.run);
      // Out again, so the wall is moving when the loop restarts.
      tl.to(node, { "--sx": r.x * 2, "--sy": r.y * 2, duration: R.back.dur, ease: R.back.ease }, R.back.at);
    };
    for (const [k, strip] of [...field.querySelectorAll(".bn__cupstrip")].entries()) rollStrip(strip, k % 2 === 1 ? -1 : 1);
    // The smear is on while the wall is fast and gone by the time the cup lands. It comes back with
    // the roll on the way out for the same reason the roll does.
    tl.fromTo(field, { "--speed": 1 }, { "--speed": 0, duration: CUPFIELD.speed.out.dur, ease: CUPFIELD.speed.out.ease }, CUPFIELD.speed.out.at);
    tl.fromTo(field, { "--speed": 0 }, { "--speed": 1, duration: CUPFIELD.speed.back.dur, ease: CUPFIELD.speed.back.ease, immediateRender: false }, CUPFIELD.speed.back.at);
  }

  // The wipe. `--wipe-x` is the boundary in canvas pixels and it runs from off the right edge to
  // off the left one: the cup crosses the wall and the wall is not there behind it. It opens again
  // as the cup leaves, which is what puts the field back for the loop's opening frame.
  const W = CUPFIELD.wipe;
  const open = spec.width + soft;
  tl.fromTo(field, { "--wipe-x": open }, { "--wipe-x": -soft, duration: W.dur, ease: W.ease }, W.at);
  tl.fromTo(field, { "--wipe-x": -soft }, { "--wipe-x": open, duration: W.open.dur, ease: W.open.ease, immediateRender: false }, W.open.at);

  const halo = root.querySelector(".bn__halo");
  // The speed the cup arrives with, drawn as a trail rather than as a blur: a blurred cup is a cup
  // out of focus, and this is one moving. The trail is a second copy of the same alpha asset inside
  // the cup's own box, so it inherits the entrance and the shift for free, and it is gone by the
  // time the cup lands.
  const trail = root.querySelector(".bn__trail");
  if (trail) {
    tl.fromTo(trail, { "--trail": 0.55 },
      { "--trail": 0.5, duration: 0.4, ease: "none", immediateRender: false },
      CUPFIELD.emerge.at);
    tl.to(trail,
      { "--trail": 0, duration: CUPFIELD.emerge.dur - 0.4, ease: "power1.in", immediateRender: false },
      CUPFIELD.emerge.at + 0.4);
  }

  if (halo) {
    halo.style.setProperty("--glow-base", `${glow.base}%`);
    // The light is placed on the cup and crosses with it. The percentages are of the canvas, which
    // is why `.bn--cupfield .bn__halo` drops the halo's own inset.
    const startX = glow.x + (heroFrom ? (heroFrom.x / spec.width) * 100 : 0);
    // The same beats and the same eases as the cup's own entrance and shift, so the light and the
    // object are one motion: `x` crosses with the cup, `y` rises with the scale the cup is at.
    tl.fromTo(
      halo,
      { "--glow-x": `${startX}%`, "--glow-y": `${glow.yFrom}%` },
      { "--glow-x": `${glow.x}%`, "--glow-y": `${glow.y}%`, duration: CUPFIELD.emerge.dur, ease: CUPFIELD.emerge.ease },
      CUPFIELD.emerge.at
    );
    tl.to(halo, { "--glow-y": `${glow.yTo}%`, duration: CUPFIELD.shift.dur, ease: CUPFIELD.shift.ease }, CUPFIELD.shift.at);
    // It blooms on the arrival rather than crossing with the cup, and it goes while the cup does -
    // so the light is never the thing the loop opens on.
    tl.fromTo(halo, { opacity: 0 }, { opacity: CUPFIELD.glow.peak, duration: CUPFIELD.glow.dur, ease: "power2.out" }, CUPFIELD.glow.at);
    tl.to(halo, { opacity: CUPFIELD.glow.settle.to, duration: CUPFIELD.glow.settle.dur, ease: "power2.inOut" }, CUPFIELD.glow.settle.at);
    tl.to(halo, { opacity: 0, duration: CUPFIELD.glow.fade, ease: "power2.in" }, CUPFIELD.leave.at);
  }
}

/** The panel and the cast: Enter, Idle and Exit, in reading order. */
function addChoreography(tl, root, spec) {
  const m = MOTION_SPEC[spec.motion] || MOTION_SPEC.slamLeft;
  // A Hook replaces the *opening beat* and nothing else.
  //
  // The panel wipe, the cast's stagger, the breathing and the exit are all still the family's, so
  // every candidate in a Hook deck settles into the same frame at the same time and leaves the same
  // way. That is what makes the comparison honest: the only thing that differs between two Hook
  // Banners is the thing the hypothesis is about, and the thing a viewer reacted to cannot have
  // been the exit. A deck without a Hook takes exactly the branch it always took - `plan` is null
  // and every `??` below falls through to the constant it replaced.
  const hook = spec.hook ? HOOKS[spec.hook] : null;
  const plan = hook?.plan || null;
  // The cup field's own beats, and they are not a Hook. A Hook replaces the opening beat of a
  // Motion family and hands off to it; the field has no family to hand off to, because its hero is
  // already in the grid when the loop opens and has to stay in its cell. So the family supplies the
  // exit and the breathing, and everything before the Hold is the field's.
  const cup = spec.roll ? CUPFIELD : null;
  const panel = root.querySelector(".bn__copy");
  // One Motion family, shared by the whole cast, so the board reads as a single gesture.
  // `roleMotion` decides how much of that family each Role takes - ROLE_MOTION in space.mjs.
  const share = ROLE_MOTION[spec.roleMotion] || ROLE_MOTION.uniform;
  const of = (r) => share[r] ?? 1;
  const idleOf = share.idle ?? 1;

  // ---- the panel wipes in first: it is the ground the words land on ----
  if (panel) {
    if (cup) {
      // Out of the cup's side. The panel is clipped against the edge the cup is on and slides the
      // short distance between them, so the words read as coming from the object rather than as a
      // second element arriving on its own beat. The panel is one statement: its contents arrive
      // inside it (see the cast loop) instead of slamming in behind the wipe.
      tl.fromTo(
        panel,
        { clipPath: "inset(0 100% 0 0)", x: -cup.copy.from * spec.width },
        { clipPath: "inset(0 0% 0 0)", x: 0, duration: cup.copy.dur, ease: "power3.out" },
        cup.copy.at
      );
    } else {
      const from = m.in.dir === "bottom" || m.in.dir === "top" ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";
      tl.fromTo(
        panel,
        { clipPath: from, opacity: 0.2 },
        { clipPath: "inset(0% 0 0 0)", opacity: 1, duration: 0.5, ease: "power4.out" },
        plan ? Math.max(0, plan.copy.at - 0.14) : T_IN - 0.14
      );
    }
  }

  // ---- the cast: words in reading order, then the badge, the photo, then the decor ----
  const cast = [
    ...q(root, ".bn__copy > *").map((node) => ({ node, role: "copy" })),
    ...q(root, ".bn__badge").map((node) => ({ node, role: "badge" })),
    ...q(root, ".bn__media").map((node) => ({ node, role: "media" })),
    // the card is part of the media role: it is an object on the ground, not a word
    ...q(root, ".bn__card").map((node) => ({ node, role: "media" })),
    ...q(root, ".bn__decor > *").map((node) => ({ node, role: "decor" })),
  ];
  const mediaNode = root.querySelector(".bn__media");
  const figNode = root.querySelector(".bn__fig");
  // The hero's two off-canvas poses, measured now and not where they are used: `fromTo` renders its
  // start values the moment it is created, so a pose measured after the entrance exists is the pose
  // the cup has already left. The halo needs the same number to know where the light starts.
  const heroFrom = cup && mediaNode ? offPose(mediaNode, root, "right") : null;
  const heroTo = cup && mediaNode ? offPose(mediaNode, root, "left") : null;
  for (const [i, { node, role }] of cast.entries()) {
    const f = of(role);
    // Which slot of the Hook's plan this element is. The hero is the object; everything else in
    // the panel enters together at the copy's time, because the panel is one statement.
    const slot = plan ? (node === mediaNode ? plan.hero : node.closest(".bn__copy") ? plan.copy : null) : null;
    // With a cup field there is no separate entrance for the words: they are inside the panel, and
    // the panel is the thing that slides out of the cup. A second entrance on top of it would make
    // the sentence arrive twice.
    const inPanel = cup && node !== mediaNode;
    const hero = cup && node === mediaNode;
    // Hoisted out of the branch: the breathing below starts when this element's entrance ended, and
    // an element that came in with the panel has no entrance of its own to measure from.
    let at = 0;
    let dur = 0;
    if (hero) {
      // The cup crosses the wall from off the right edge and comes to rest in its cell. It is the
      // only thing in the Banner that arrives from outside the frame, which is what makes the wipe
      // read as *it* clearing the cups rather than as the ground changing under a still object. It
      // arrives small and resolves to its size, so the crossing has depth and not just travel.
      at = cup.emerge.at;
      dur = cup.emerge.dur;
      // It does not fade in. A cup that fades up on the spot is a graphic appearing; a cup that is
      // already opaque when it enters the frame is an object crossing it, and the frame is where it
      // starts. The blur is the speed it arrives with, and it is gone by the time it lands - the
      // same idea as the wall's own smear, on the one object the Banner is about.
      // Invisible until it enters, and opaque from the frame it does. This is a snap and not a fade:
      // the cup is 90px past the right edge at `emerge.at`, so the change happens where nothing can
      // see it. It is here because the loop has to open on a frame it can close on - the cup is off
      // the *right* at `t=0` and off the *left* at `t=LOOP`, and an element that is on the canvas at
      // one end of the loop and not the other is a jump however far off the edge it is standing.
      //
      // The state before the entrance lives in the DOM and not in a `set` at `t=0`, and both tweens
      // are `immediateRender: false`. A `fromTo` renders its from-values the moment it is created,
      // whatever the playhead is: a `set` at `t=0` is rendered first and then overwritten by the
      // entrance that has not started yet, and re-seeking to `t=0` does not render it again. So the
      // only place the opening pose can live is the element itself.
      // The opening pose is written here and not left to the Timeline, because the Timeline has
      // nothing to render at `t=0`: the entrance has not started. An element with no transform of
      // its own sits at the pose the stylesheet gave it, which is the pose it *lands* on - a cup
      // parked in its cell at the frame the loop opens. The pose the loop opens on is the pose it
      // arrives from.
      node.style.opacity = "0";
      node.style.transform = `translate(${heroFrom.x}px, 0px) scale(${cup.emerge.scale})`;
      tl.set(node, { opacity: 1, immediateRender: false }, at);
      tl.fromTo(
        node,
        { x: heroFrom.x, y: 0, rotation: 0, scale: cup.emerge.scale },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: dur, ease: cup.emerge.ease, immediateRender: false },
        at
      );
    } else if (inPanel) {
      // Nothing. The words are inside the panel and the panel is the thing that opens: it is
      // clipped open from the cup's side, and the words are what is behind the clip, so they are
      // revealed by the wipe rather than arriving on a beat of their own. A fade on top of the wipe
      // is the sentence arriving twice, and the second arrival is the weaker one - the words are
      // already there, they are simply not visible yet.
    } else {
      at = slot?.at ?? T_IN + i * IN_STAGGER;
      dur = slot?.dur ?? IN_DUR;
      const ease = slot?.ease ?? EASE_IN;
      const off = offPose(node, root, slot?.from && slot.from !== "none" ? slot.from : m.in.dir);
      const start = { x: off.x * f, y: off.y * f, rotation: (m.in.rot || 0) * f, scale: 1 + ((m.in.scale ?? 1) - 1) * f, opacity: 0 };
      // a Hook slot may name its own scale: `reward-scale-impact` opens with the copy oversized, and
      // `quiet-stamp` brings the object in small so that the stamp is the only large event
      if (slot?.scale != null) start.scale = slot.scale;
      const settle = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: dur, ease };
      if (m.in.blur || slot?.blur) start.filter = `blur(${slot?.blur ?? m.in.blur}px)`;
      if (m.in.blur || slot?.blur) settle.filter = "blur(0px)";
      if (m.in.clip) {
        start.clipPath = m.in.dir === "bottom" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)";
        settle.clipPath = "inset(0% 0 0 0)";
      }
      tl.fromTo(node, start, settle, at);
    }
    // The hero's shift forward, once the field has nearly stopped: the cup grows off the same floor
    // it was standing on. It is a second tween rather than a bigger `emerge` scale because the two
    // are different events - the cup becomes visible, and then it takes the scene. It lands before
    // the words do, so the sentence comes out of a cup that has already arrived.
    const landed = hero ? cup.emerge.at + cup.emerge.dur : 0;
    if (hero) tl.to(node, { scale: cup.shift.scale, duration: cup.shift.dur, ease: cup.shift.ease }, cup.shift.at);

    // ---- breathing: alternating half-cycles that end on the settled pose ----
    const amp = IDLE[m.idle] || IDLE.floatY;
    const ia = f * idleOf;
    // The cup field breathes around the scale the shift left it at, so the hero keeps its size and
    // the settle at the end of the Hold does not shrink it back into the grid.
    const restScale = hero ? cup.shift.scale : 1;
    const idleFrom = hero ? landed : cup ? cup.copy.at + cup.copy.dur : at + dur;
    const idleTo = HOLD_END - 0.34;
    const span = Math.max(0, idleTo - idleFrom);
    const steps = Math.max(1, Math.round(span / 1.6));
    const step = span / steps;
    for (let k = 0; k < steps; k++) {
      const up = k % 2 === 0;
      const tween = { duration: step, ease: "sine.inOut" };
      if (amp.y) tween.y = (up ? amp.y : -amp.y * 0.45) * ia;
      if (amp.x) tween.x = (up ? amp.x : -amp.x * 0.45) * ia;
      if (amp.rot) tween.rotation = (up ? amp.rot : -amp.rot) * ia;
      if (amp.scale) tween.scale = up ? restScale + (amp.scale - 1) * ia : restScale;
      tl.to(node, tween, idleFrom + k * step);
    }
    tl.to(node, { x: 0, y: 0, rotation: 0, scale: restScale, duration: 0.34, ease: "power2.out" }, idleTo);

    // ---- the exit: last in, first out, thrown the other way ----
    if (hero) {
      // The cup leaves the way it came, off the left edge, and the wall closes behind it. It has to
      // be gone by the loop's last frame: the ground is rolling again at `t=LOOP` and the cup is not
      // in it, which is the same picture the loop opens on.
      tl.to(node, { x: heroTo.x, y: 0, rotation: 0, scale: 1, duration: cup.leave.dur, ease: cup.leave.ease }, cup.leave.at);
      // It leaves opaque and stops existing off the edge, which is the same snap the entrance uses
      // and for the same reason: the loop opens on a cup that is not on the canvas, so the last
      // frame has to be a cup that is not on the canvas either.
      tl.set(node, { opacity: 0, immediateRender: false }, cup.leave.at + cup.leave.dur);
    } else {
      const outAt = HOLD_END + (cast.length - 1 - i) * OUT_STAGGER;
      const away = offPose(node, root, m.out.dir);
      const end = { x: away.x * f, y: away.y * f, rotation: (m.out.rot || 0) * f, scale: 1 + ((m.out.scale ?? 1) - 1) * f, opacity: 0, duration: OUT_DUR, ease: EASE_OUT };
      if (m.out.blur) end.filter = `blur(${m.out.blur}px)`;
      if (m.out.clip) end.clipPath = m.out.dir === "top" ? "inset(0 0 100% 0)" : "inset(0 0 0 100%)";
      tl.to(node, end, outAt);
    }
  }

  // ---- the field itself: the roll, and the light on the cup that stops it ----
  if (cup) addCupfield(tl, root, spec, heroFrom);

  // ---- the Hook's two non-cast events: the reward's emphasis and the light bloom ----
  //
  // The reward is a `.bn__fig` inside a line of the headline, so it is not in the cast and has no
  // entrance of its own. A Hook gives it one: it is set to the plan's scale at the plan's time and
  // resolved to its settled size. That is what makes `reward-scale-impact` a different hypothesis
  // from `cinematic-arrival` rather than the same one with a different caption - the reward is
  // oversized *while the panel is still arriving* in one, and stamped after the object has landed
  // in the other. `set` rather than a `fromTo`, because a `fromTo` would render its start value
  // immediately at t=0 and the reward would be visibly wrong in the Intro.
  if (plan?.reward && figNode) {
    const r = plan.reward;
    tl.set(figNode, { scale: r.scale }, r.at);
    tl.to(figNode, { scale: 1, duration: r.dur, ease: r.ease || "power2.out" }, r.at);
  }
  // The halo is the `spotlight-hero` hypothesis: attention won by light. It is behind the object,
  // it blooms and it goes, so the seam at t=LOOP is the same stillness it opened on.
  const haloNode = root.querySelector(".bn__halo");
  if (plan?.halo && haloNode) {
    const h = plan.halo;
    tl.fromTo(haloNode, { opacity: 0, scale: 0.55 }, { opacity: h.peak ?? 0.85, scale: 1, duration: h.dur, ease: "power2.out" }, h.at);
    tl.to(haloNode, { opacity: 0, duration: h.fade ?? 0.6, ease: "power2.in" }, h.at + h.dur + 0.4);
  }

  if (panel) {
    // the wipe leaves the way it came in, not the way the elements leave
    const exitClip = m.out.dir === "bottom" ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)";
    tl.to(panel, { clipPath: exitClip, opacity: 0.2, duration: 0.5, ease: "power3.in" }, HOLD_END + 0.35);
  }

  // The background keeps sliding on its own CSS animation for the whole 12s, so the quiet
  // stretch at the end is not empty - it is the background's own moment, and it is what the
  // loop opens on. This spacer pins the timeline's duration to LOOP: without it the timeline
  // would end when the last exit tween ends (~10.4s) and every caller that seeks to LOOP
  // would silently wrap back to frame zero.
  tl.to({ pad: 0 }, { pad: 1, duration: 0.01, ease: "none" }, LOOP - 0.01);
}

/** The whole Scene, both timelines. What `motions.html` and the loop-seam test measure. */
export function buildMotion(root, spec) {
  const tl = gsap.timeline({ repeat: -1, paused: true });
  addEnergy(tl, root, spec);
  addChoreography(tl, root, spec);
  tl.pause(0);
  return tl;
}

// --------------------------------------------------------------------------- //
// fitting
// --------------------------------------------------------------------------- //

/**
 * Display lines never wrap - a broken line is a design decision, not a wrap point. So a line
 * that does not fit its box is scaled down instead, which is what a designer would do.
 * Runs before the element is in the document as a no-op, and again on the next frame.
 */
/**
 * The width a child of `.bn__copy` can occupy: the panel's content box. `clientWidth`
 * includes the panel's own padding, and using it as the limit lets a headline run 130px into
 * the padding and out of the panel.
 *
 * A panel that hugs its content - which the Direction deck sets, so the composition is authored
 * by the type's own shape - cannot also be its own measure. Shrinking the headline shrinks the
 * panel, which shrinks the measure, which shrinks the headline again: the loop is a runaway that
 * ends at the 6px floor. When the stylesheet declares `--fit-w` (a percentage of the banner), that
 * width is the measure instead, and the panel is free to hug inside it.
 */
function copyContentWidth(copy) {
  if (!copy) return 0;
  const cs = getComputedStyle(copy);
  const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const fitW = parseFloat(cs.getPropertyValue("--fit-w"));
  const bn = copy.closest(".bn");
  if (fitW && bn) return (bn.clientWidth * fitW) / 100 - pad;
  return copy.clientWidth - pad;
}

/**
 * Drop every inline size the fit pass ever wrote. Both fit functions are shrink-only, so
 * without this a second run compounds the first one: render before the webfont loads, and the
 * fallback's wider metrics shrink the type, then the post-font run shrinks it again. The
 * result is a banner whose type has collapsed into a sliver.
 */
function clearFit(bn) {
  for (const n of bn.querySelectorAll(".bn__line, .bn__kicker, .bn__sub, .bn__bonus, .bn__note, .bn__cta")) n.style.fontSize = "";
}

/**
 * The rendered width of a text node, in layout px. A badge centres its label, so an
 * over-wide label overflows both edges and `scrollWidth` reports the box plus half the
 * overflow on each side -- a number that never drops below the limit, so a shrink loop
 * against it drives the type to the floor. Measure the glyphs instead.
 */
let measureCtx = null;
function textWidth(n) {
  measureCtx ||= document.createElement("canvas").getContext("2d");
  const cs = getComputedStyle(n);
  measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const text = n.textContent.trim().toUpperCase(); // the badge label is uppercased by CSS
  const track = (parseFloat(cs.letterSpacing) || 0) * Math.max(0, text.length - 1);
  return measureCtx.measureText(text).width + track;
}

const MIN_TYPE = 32; // brand rule: text never renders below 32px on a 1920 canvas
export function fitType(bn) {
  const copy = bn.querySelector(".bn__copy");
  const copyW = copyContentWidth(copy);
  for (const n of bn.querySelectorAll(".bn__line, .bn__kicker, .bn__sub, .bn__bonus, .bn__note, .bn__cta, .bn__badge")) {
    // `.bn__copy` is a flex column with `align-items: flex-start`, so a nowrap line grows
    // past its parent rather than being clipped: the limit is the copy box, never the
    // element's own width, which is already the too-wide text width.
    //
    // A badge is the opposite case. It has a fixed box, and the shaped ones (starburst,
    // circle, seal) have no room at the corners, so the label has to fit the *inscribed*
    // area -- `--fit` is that fraction of the box. Without it a long label runs past the
    // star's points and the clip-path slices the last letter off.
    const cs = getComputedStyle(n);
    const isBadge = !n.closest(".bn__copy");
    const fit = parseFloat(cs.getPropertyValue("--fit")) || 1;
    const limit = isBadge
      ? (n.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) * fit
      : copyW;
    if (!limit) continue;
    let size = parseFloat(cs.fontSize);
    const floor = n.classList.contains("bn__line") ? MIN_TYPE : 6;
    for (let i = 0; i < 8 && size > floor; i++) {
      const w = isBadge ? textWidth(n) : n.scrollWidth;
      if (!w || w <= limit) break;
      size = Math.max(floor, size * limit / w);
      n.style.fontSize = `${size.toFixed(2)}px`;
    }
  }
}

/**
 * `fitType` fits each line to its own box; it cannot see that the stack as a whole is taller
 * than the canvas. The centred layouts put the copy at 50% with a translate, so a tall stack
 * runs off both edges. Shrink the whole stack until it clears, then re-fit the lines.
 */
/**
 * Shrink the stack until it fits the room its layout allows. The room is the panel's
 * `max-height` when the stylesheet sets one (the layouts that share the canvas with a photo
 * do), and 88% of the banner otherwise. Only the content counts: padding does not shrink.
 */
/**
 * How tall the copy stack actually is. `getBoundingClientRect()` is useless here: once the
 * panel hits its `max-height` the box stops growing and the text overflows instead, so the
 * rect reports "it fits" while the last line is off the panel. Measure the children instead.
 */
function stackHeight(copy) {
  // offsetTop/offsetHeight, not getBoundingClientRect: the gallery and the contact sheet both
  // preview a banner through `transform: scale()`, and a rect is reported in the scaled units
  // while the padding it is compared against is not. Mixing the two collapses the type.
  const kids = [...copy.children].filter((n) => n.offsetHeight || n.offsetWidth);
  if (!kids.length) return 0;
  const tops = kids.map((n) => n.offsetTop);
  const bottoms = kids.map((n) => n.offsetTop + n.offsetHeight);
  return Math.max(...bottoms) - Math.min(...tops);
}

export function fitCopy(bn) {
  const copy = bn.querySelector(".bn__copy");
  if (!copy) return;
  const cs = getComputedStyle(copy);
  const boxH = bn.offsetHeight;
  // Chrome hands back a percentage max-height verbatim, so `parseFloat("47%")` would read as
  // 47px and the loop below would shrink the type to nothing. Resolve it against the banner.
  const raw = cs.maxHeight;
  const maxH = raw.endsWith("%") ? (parseFloat(raw) / 100) * boxH : parseFloat(raw);
  const limit = Number.isFinite(maxH) && maxH > 0 ? maxH : boxH * 0.88;
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const room = Math.max(0, limit - padY);
  for (let i = 0; i < 8; i++) {
    const h = stackHeight(copy);
    if (!h || h <= room) break;
    const k = Math.max(0.5, room / h);
    for (const n of copy.querySelectorAll(".bn__line, .bn__kicker, .bn__sub, .bn__bonus, .bn__note, .bn__cta")) {
      const floor = n.classList.contains("bn__line") ? MIN_TYPE : 6;
      n.style.fontSize = `${Math.max(floor, parseFloat(getComputedStyle(n).fontSize) * k)}px`;
    }
    fitType(bn);
  }
}

/**
 * Decorations paint behind everything, so a solid blob under the copy or the badge drops the
 * text on it to about 1:1 without any element's own colours being wrong. Push any shape that
 * lands under a text box clear of it; a shape with nowhere to go is faded instead.
 */
export function dodgeCopy(bn) {
  const box = bn.getBoundingClientRect();
  if (!box.width) return;
  const shapes = [...bn.querySelectorAll(".bn__decor > *")];
  if (!shapes.length) return;
  // wide enough to survive the motion tweens, which move shapes by up to ~60px
  const pad = box.width * 0.045;

  for (const host of bn.querySelectorAll(".bn__copy, .bn__badge")) {
    const c = host.getBoundingClientRect();
    if (!c.width) continue;
    const top = c.top - box.top - pad;
    const bottom = c.bottom - box.top + pad;
    const left = c.left - box.left;
    const right = c.right - box.left;
    for (const d of shapes) {
      if (d.style.display === "none") continue;
      const dr = d.getBoundingClientRect();
      const r = { left: dr.left - box.left, right: dr.right - box.left, top: dr.top - box.top, bottom: dr.bottom - box.top, width: dr.width };
      if (r.right <= left || r.left >= right || r.bottom <= top || r.top >= bottom) continue;
      const w = r.width;
      const goLeft = r.left + w / 2 < (left + right) / 2;
      const target = goLeft ? left - w : right;
      if (target < -w * 0.5 || target + w > box.width + w * 0.5) {
        d.style.opacity = "0.08";
        continue;
      }
      d.style.left = `${((target / box.width) * 100).toFixed(3)}%`;
    }
  }
}

// --------------------------------------------------------------------------- //
// sanity measurement
// --------------------------------------------------------------------------- //

/** Treatments that put the photo inside a mask or a frame. The mask is what crops the picture,
 *  so which edge of the file is sliced stops mattering and the layout keeps its own choice. */
const MASKED_PRODUCTS = new Set(["framed", "circleMask", "arch", "polaroid", "tiltedCard"]);

/**
 * Point a sliced photo's cut at the canvas border.
 *
 * Some assets are a *crop* of a subject: `cut/deli-bowl.png` is a plate sliced off at its left
 * edge, so the file has a hard straight cut there. Where that cut lands inside the frame it reads
 * as a mistake — a plate cut in half by nothing — and where it lands on the canvas border it
 * reads as a bleed, which is what the source poster does. A photo declares which edge it is
 * sliced on (`edge`, in `photos2.json`), and this mirrors the picture when the layout has put the
 * media on the other side, then anchors it so the cut sits on the border the media is nearest.
 *
 * The offset is compared as a *fraction* of the banner's width, not in pixels: every preview
 * renders the banner through `transform: scale()`, and `getBoundingClientRect()` reports the
 * scaled px.
 *
 * There is no branch for a media box that spans the canvas or one that is centred: the club's
 * decks hold no `fullBleed` and no `centerStack` — the centred stack lost every vote it was ever
 * given — so a box that is off-centre by any amount is the only case a Banner in this lab can
 * produce. A box exactly centred would take the left, deterministically.
 */
export function faceEdge(bn, spec) {
  const media = bn.querySelector(".bn__media");
  const img = bn.querySelector(".bn__img");
  if (!media || !img || !spec.edge) return;
  if (bn.classList.contains("bn--lay-circleMask") || MASKED_PRODUCTS.has(bn.dataset.treatment)) return;
  const box = bn.getBoundingClientRect();
  const m = media.getBoundingClientRect();
  if (!box.width || !m.width) return;

  // The side the media sits on is the side the cut has to face, so the picture is mirrored
  // whenever the file is sliced on the other one. A box that spans the canvas has no side: the
  // mirror takes its cut off the frame either way, and "right" is what the source poster does.
  const offset = (m.left + m.width / 2 - box.left - box.width / 2) / box.width;
  const side = m.width > box.width * 0.9 ? "right" : offset > 0 ? "right" : "left";
  const mirror = spec.edge !== side;
  bn.classList.toggle("bn--mirror", mirror);
  // The anchor is set in the picture's own frame, which the mirror then flips: `object-position`
  // on a mirrored image moves the content the other way. So the side the picture is anchored to
  // is the *opposite* of the border the cut has to land on. Anchoring the cut to the outer edge
  // of the media box puts it on the canvas border, because that is where the box already is.
  const anchorLeft = mirror ? side === "right" : side === "left";
  bn.style.setProperty("--edge-x", anchorLeft ? "0%" : "100%");
}

/** The whole fit pass, from the stylesheet's sizes. */
export function refit(bn, spec = bn.__spec || {}) {
  clearFit(bn);
  fitType(bn);
  fitCopy(bn);
  fitType(bn);
  dodgeCopy(bn);
  faceEdge(bn, spec);
}

/**
 * Resolve once the banner is laid out the way a viewer sees it: webfont loaded, fit applied,
 * decorations dodged. Every caller that is about to measure or animate a banner awaits this,
 * because everything downstream reads the geometry this produces.
 */
export function settle(bn) {
  return document.fonts.ready.then(() => new Promise((resolve) => {
    requestAnimationFrame(() => { refit(bn); resolve(bn); });
  }));
}

/**
 * Stop the background sheets at the start of their cycle.
 *
 * The sheets are driven by CSS, not by the Timeline, so leaving the Timeline unbuilt is not enough
 * to hold them still. A settled Composition is a still, so nothing in the frame may move - and
 * "still" means every Banner shows the SAME pose, not merely a pose that has stopped. `pause()`
 * alone freezes each sheet wherever the wall clock happened to be when it mounted, so twelve cards
 * in one contact sheet freeze at twelve different points of the slide. Seeking to 0 first is what
 * makes the background of a Composition a controlled variable.
 */
export function freezeBackground(root) {
  for (const slide of root.querySelectorAll(".bn__slide")) {
    for (const a of slide.getAnimations()) {
      a.pause();
      a.currentTime = 0;
    }
  }
}

/**
 * Put a Banner into the state its Mode asks for, and return its Timeline when it has one.
 *
 * A Scene has two independent timelines, and the Mode decides which to build. Composition builds
 * neither - every Element already sits at its settled pose in CSS, because the Timeline is only
 * ever what moves it away from that pose, so "show the settled Composition" is not a special case
 * to build, it is the absence of one. Background builds only the energy, because that is the only
 * thing it varies. Motion and Scene build both.
 */
export function animate(root, spec) {
  if (!MODES[spec.mode]) throw new Error(`unknown mode "${spec.mode}"`);
  const mode = MODES[spec.mode];
  if (mode.background === "frozen") freezeBackground(root);
  const tl = gsap.timeline({ repeat: -1, paused: true });
  if (mode.energy) addEnergy(tl, root, spec);
  if (mode.choreography) addChoreography(tl, root, spec);
  if (!tl.getChildren().length) return null; // nothing to drive: `flat` background, no cast
  tl.pause(0);
  return tl;
}

export function measure(bn) {
  refit(bn); // measure the settled state, not the state before the first fit pass
  const flags = [];
  // copy and product fighting for the same pixels is the single most common defect.
  // The composited layouts put the photo under the copy on purpose, so they are exempt.
  const composite = ["fullBleed", "cornerScrim", "productBehind"].some((l) => bn.classList.contains(`bn--lay-${l}`));
  const copyBox = bn.querySelector(".bn__copy")?.getBoundingClientRect();
  const mediaBox = bn.querySelector(".bn__media")?.getBoundingClientRect();
  if (!composite && copyBox && mediaBox) {
    const overlap = Math.max(0, Math.min(copyBox.right, mediaBox.right) - Math.max(copyBox.left, mediaBox.left)) *
                    Math.max(0, Math.min(copyBox.bottom, mediaBox.bottom) - Math.max(copyBox.top, mediaBox.top));
    if (overlap > copyBox.width * copyBox.height * 0.12) flags.push("collide");
  }
  const copyW = copyContentWidth(bn.querySelector(".bn__copy"));
  for (const n of bn.querySelectorAll(".bn__line, .bn__kicker, .bn__sub, .bn__bonus, .bn__note, .bn__cta, .bn__badge")) {
    const limit = n.closest(".bn__copy") ? copyW : bn.clientWidth * 0.9;
    if (limit && n.scrollWidth > limit + 2) flags.push("overflow");
  }
  for (const n of bn.querySelectorAll(".bn__copy > *")) {
    if (!n.getClientRects().length) continue; // cta:none and friends are display:none
    const r = n.getBoundingClientRect();
    const b = bn.getBoundingClientRect();
    const pad = b.width * 0.05;
    if (r.left < b.left + pad * 0.4 || r.right > b.right - pad * 0.4 || r.top < b.top || r.bottom > b.bottom) flags.push("safe");
  }
  return [...new Set(flags)];
}
