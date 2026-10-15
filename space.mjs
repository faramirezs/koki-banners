/*
 * space.mjs — the design space: every axis value, and nothing that touches the filesystem.
 *
 * Split out of gen.mjs so the renderer can import the same constants the sampler used. If
 * these two ever disagreed, a banner would render as something other than what was sampled.
 *
 * It also carries the *communication* layer, transcribed from `../creative-strategy/` in
 * `strategy.mjs`: a Campaign may name a Brief, and a Mode may vary a Hook. Both sit outside
 * `AXES`, exactly like `direction`, so no deck the lab has already built is resampled by them.
 */
import { BRIEFS, HOOK_AXIS, HOOK_HYPOTHESES, HOOK_IDS, MESSAGE_FRAMES } from "./strategy.mjs";

export { BRIEFS, HOOK_AXIS, HOOK_HYPOTHESES, HOOK_IDS };
/** The Hook hypotheses, by id: the opening each candidate is testing. */
export const HOOKS = HOOK_HYPOTHESES;

// --------------------------------------------------------------------------- //
// axes
// --------------------------------------------------------------------------- //

// --------------------------------------------------------------------------- //

// Landscape 1080p only. Every banner is authored at exactly the size it will ship at, so
// the composition is judged at the real aspect ratio rather than at a preview scale.
export const WIDTH = 1920;
export const HEIGHT = 1080;

/**
 * KoKitchen tokens. Every colour below is one of these seven or a step of one, so the whole
 * deck stays inside the brand even when it is loud.
 */
export const KK = {
  olive: "#282F23", ink: "#1D231A", green: "#5F6F52", sage: "#B5BEA0",
  cream: "#FEFAE0", orange: "#FF7D00", odeep: "#C2410C", white: "#FFFFFF",
};

/**
 * A palette is not "a background" any more: it is the three colours that slide behind the
 * banner, the panel the copy sits on, and the text colours on that panel. `slide` is ordered
 * brightest-first where it matters, because the audit checks the panel against both ends.
 *
 * Contrast rules the palettes are built to, all computed with the WCAG formula:
 *   ink / muted / accent / accent2 on panel >= 4.5   onAccent on accent >= 4.5
 *
 * The brand's graphics-only orange is NOT a field here, and that is deliberate: the experiment
 * stamp hashes every value of a palette, so a new field would move the stamp of every deck that
 * varies one. `PALETTE_FILL` below carries it instead.
 */
/**
 * `#FF7D00` where a palette's accent is the light theme's *text* orange, so a graphic that wants
 * the brand's fill orange can ask for it.
 *
 * `brand/identity.md` splits the light theme in two: `#C2410C` carries text, because `#FF7D00` on
 * white is 2.57 and fails at every size, and `#FF7D00` carries bars, dots and chip fills, which are
 * never read as words. Six palettes name `#C2410C` as their accent, so those six are the ones where
 * the two are not the same colour. A palette not listed here is its own fill.
 */
export const PALETTE_FILL = {
  cream: "#FF7D00", paper: "#FF7D00", rust: "#FF7D00",
  memberCream: "#FF7D00", memberSage: "#FF7D00", deliCream: "#FF7D00",
};

export const PALETTES = {
  // ---- dark grounds: a near-black or olive panel, cream or white type -------
  olive:   { mode: "dark",  panel: "#1D231A", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#282F23", "#5F6F52", "#282F23"] },
  ink:     { mode: "dark",  panel: "#0F130D", ink: "#FFFFFF", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#1D231A", "#3A4433", "#1D231A"] },
  green:   { mode: "dark",  panel: "#282F23", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#5F6F52", "#282F23", "#5F6F52"] },
  ember:   { mode: "dark",  panel: "#1D231A", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#C2410C", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#C2410C", "#FF7D00", "#1D231A"] },
  citrus:  { mode: "dark",  panel: "#1D231A", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#FF7D00", "#FEFAE0", "#FF7D00"] },
  clay:    { mode: "dark",  panel: "#0F130D", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#C2410C", "#282F23", "#FF7D00"] },
  moss:    { mode: "dark",  panel: "#1D231A", ink: "#FEFAE0", accent: "#B5BEA0", accent2: "#FF7D00", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#5F6F52", "#B5BEA0", "#282F23"] },
  noir:    { mode: "dark",  panel: "#0F130D", ink: "#FFFFFF", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#1D231A", "#1D231A", "#3A4433"] },
  char:    { mode: "dark",  panel: "#1D231A", ink: "#FEFAE0", accent: "#FEFAE0", accent2: "#FF7D00", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#3A4433", "#1D231A", "#C2410C"] },
  sunbeam: { mode: "dark",  panel: "#282F23", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#FF7D00", "#B5BEA0", "#FF7D00"] },
  // ---- light grounds: a cream, white or sage panel, dark type --------------
  cream:   { mode: "light", panel: "#FFFFFF", ink: "#1D231A", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#FEFAE0", "#B5BEA0", "#FEFAE0"]  },
  sage:    { mode: "light", panel: "#FEFAE0", ink: "#282F23", accent: "#5F6F52", accent2: "#C2410C", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#B5BEA0", "#5F6F52", "#B5BEA0"] },
  paper:   { mode: "light", panel: "#FEFAE0", ink: "#282F23", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#FFFFFF", "#FEFAE0", "#B5BEA0"]  },
  linen:   { mode: "light", panel: "#FFFFFF", ink: "#1D231A", accent: "#1D231A", accent2: "#C2410C", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#FEFAE0", "#FFFFFF", "#FF7D00"] },
  grove:   { mode: "light", panel: "#FEFAE0", ink: "#1D231A", accent: "#282F23", accent2: "#5F6F52", muted: "#282F23", onAccent: "#FEFAE0", slide: ["#B5BEA0", "#FEFAE0", "#5F6F52"] },
  rust:    { mode: "light", panel: "#FEFAE0", ink: "#1D231A", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#FF7D00", "#FEFAE0", "#C2410C"]  },

  // ---- the Membership campaign's grounds ------------------------------------------------
  // One ground, one text colour, one accent. The general palettes above carry three `slide`
  // tones because their background is built from a two-tone split, and that is exactly the
  // "many colours doing many things" a sales ad cannot afford: the offer has to be the loudest
  // thing on the canvas. Here the three tones are near-neighbours, so the background reads as a
  // single ground that happens to be moving, and the accent is spent on the price and the CTA.
  //
  // The four are the brief's four: olive/cream/orange, ink/cream/orange, cream/dark/orange and
  // sage/dark/orange. `accent` is the one orange that is legal on that ground - #FF7D00 on a
  // dark ground, #C2410C on a light one, because the bright orange fails 4.5:1 on cream.
  // `accent2` is set to the palette's quiet tone and is not spent on anything in this deck: an
  // ad with two accents has none.
  //
  // The panel is a deliberate surface, so on every one of these it is separated from the ground:
  // lighter than a dark ground, whiter than a light one. `memberSage` used to carry the same
  // value as its own ground, which made the panel vanish into the background - and so did
  // `grove`, which is the same bug in the general set.
  //
  // The punch card's own tan is NOT one of these. A mid-tone ground is the hardest case for
  // text; the tan belongs to the card object, where it is large and carries no body copy.
  memberOlive: { mode: "dark",  panel: "#1D231A", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#282F23", "#2E3627", "#282F23"] },
  memberCream: { mode: "light", panel: "#FFFFFF", ink: "#1D231A", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#FEFAE0", "#F7F1DA", "#FEFAE0"]  },
  memberInk:   { mode: "dark",  panel: "#1D231A", ink: "#FFFFFF", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#0F130D", "#161C12", "#0F130D"] },
  memberSage:  { mode: "light", panel: "#FEFAE0", ink: "#1D231A", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#B5BEA0", "#BEC7A9", "#B5BEA0"]  },

  // ---- the Deli Club campaign's ground ---------------------------------------------------
  // The source creative, sampled: cream #FEFAE0 ground, olive #5F6F52 headline, orange figure,
  // orange pill. Three of those four are the lab's own tokens already - the cream is `paper`'s
  // ground, the olive is the general `muted`, the orange is the brand accent - so this is one
  // palette, not four, and the campaign's other grounds are borrowed from the Membership set.
  //
  // `ink` is the olive, not a near-black: in this ad the headline is a mid green and the figure
  // carries the weight, which is the opposite of the house default and the whole character of
  // the design. It measures 5.3:1 on the white panel.
  //
  // `accent` is #C2410C, not the #FF7D00 the source uses on cream, because the bright orange
  // measures 2.44:1 there - under the 3:1 floor the audit enforces and well under the 4.5:1 the
  // palettes are held to. The bright orange is still the brand's, and it is used on this
  // campaign's dark grounds and in the slide, where it is a fill rather than type.
  deliCream:   { mode: "light", panel: "#FFFFFF", ink: "#5F6F52", accent: "#C2410C", accent2: "#282F23", muted: "#66755A", onAccent: "#FEFAE0", slide: ["#FEFAE0", "#F7F1DA", "#FEFAE0"]  },
};

// The general space's reading orders. `bottomPlate` is NOT here: it was built for the Directions
// (a full-width crop with the type above it) and it lives in `DIRECTION_ONLY.layout` instead. A
// general deck that dealt it would be the new idea bolted onto the old cross-product, and every
// Composition and Scene Banner would be resampled as a side effect.
export const LAYOUTS = ["productLeft", "productRight", "centerStack", "productBehind", "bottomBand", "diagonalSplit", "circleMask", "fullBleed", "cornerScrim", "topBanner"];
/**
 * Every background is the same idea — three oversized gradient sheets sliding past each
 * other — so the axis is how loud it is, not whether it moves.
 *
 * `dur` values must divide half the loop (6 s): an `alternate` animation returns to its
 * start after 2 x duration, so 1/2/3/6 s are the only speeds that close the 12 s loop.
 */
export const BACKGROUNDS = ["triSlide", "duoSlide", "quadSlide", "softSlide", "boldSlide", "blendSlide", "raySlide", "stripeSlide", "dotSlide", "meshSlide"];

export const BG_RECIPES = {
  triSlide:    { layers: 3, angle: -60, opacity: 0.50, dur: [3, 6, 2] },
  duoSlide:    { layers: 2, angle: -60, opacity: 0.64, dur: [4, 3] },
  quadSlide:   { layers: 4, angle: -45, opacity: 0.40, dur: [3, 4, 6, 2] },
  softSlide:   { layers: 3, angle: -60, opacity: 0.24, dur: [6, 4, 3] },
  boldSlide:   { layers: 2, angle: -60, opacity: 0.96, dur: [3, 6] },
  blendSlide:  { layers: 3, angle: -75, opacity: 0.62, dur: [4, 6, 3], blend: "overlay" },
  raySlide:    { layers: 3, angle: -60, opacity: 0.50, dur: [3, 6, 2], kind: "rays" },
  stripeSlide: { layers: 3, angle: -60, opacity: 0.50, dur: [3, 6, 2], kind: "stripes" },
  dotSlide:    { layers: 3, angle: -60, opacity: 0.50, dur: [3, 6, 2], kind: "dots" },
  meshSlide:   { layers: 3, angle: -60, opacity: 0.50, dur: [3, 6, 2], kind: "mesh" },
};
// Same rule as `LAYOUTS`: the three type systems the Directions added are Direction-only. They
// are the ones that make typography the actor - poster-scale display, a price-first lockup, a
// stacked editorial break - and they are only meaningful inside a Direction that has decided the
// type should carry the composition.
export const TYPES = ["whiteCaps", "twoTone", "outline", "ribbonKicker", "boxed", "mixedBox", "stacked", "shadowPop", "editorial", "ticket", "offerStrap"];
export const BADGES = ["starburst", "circle", "ribbon", "pill", "corner", "seal", "none"];
export const CTAS = ["pill", "ribbon", "chipArrow", "boxed", "underline", "badgeSquare", "none"];
export const PRODUCTS = ["cutoutFloat", "framed", "circleMask", "tiltedCard", "bottomCrop", "polaroid", "arch"];
// And again: `rule` and `stamp` are the Directions' material gestures (a printed margin line, the
// punch grid of the membership card). The general decoration set is unchanged.
export const DECOR = ["none", "splash", "flames", "rings", "confetti", "leaves", "sparkles", "streaks", "bubbles", "doodles"];


/**
 * The Membership punch card's placement, and the bonus line's treatment. Both are campaign axes,
 * so their general domain is the single value `none`: a card reading "10 MEALS" under a headline
 * reading "LAYERS OF DELICIOUS" is not a design experiment, it is a mistake, and a general axis
 * would have produced it happily. The Membership campaign replaces both domains with its own
 * lists - see `CAMPAIGNS.membership.domains` - which is the only place the treatments are named.
 */
export const CARDS = ["none"];
export const BONUSES = ["none"];

/**
 * The loop is one story: the elements slam in, breathe while you read them, then get thrown
 * off the screen. `in` and `out` are directions and modifiers; `idle` is the breathing.
 * Travel is computed at runtime from the element's own box, so "left" always means fully
 * off the canvas, whatever the layout put there.
 */
export const MOTIONS = [
  "slamLeft", "slamRight", "slamTop", "slamBottom", "slamScale",
  "spinSlam", "flipSlam", "dropSlam", "riseSlam", "zoomSlam",
  "tiltSlam", "swingSlam", "orbitSlam", "wipeSlam", "maskSlam",
  "blurSlam", "cascade", "elasticPop",
];

export const MOTION_SPEC = {
  slamLeft:    { in: { dir: "left",  rot: -7, scale: 1.08 }, idle: "floatY", out: { dir: "left",  rot: 9,  scale: 0.92 } },
  slamRight:   { in: { dir: "right", rot: 7,  scale: 1.08 }, idle: "floatY", out: { dir: "right", rot: -9, scale: 0.92 } },
  slamTop:     { in: { dir: "top",   rot: -4, scale: 1.05 }, idle: "sway",   out: { dir: "top",   rot: 5,  scale: 0.95 } },
  slamBottom:  { in: { dir: "bottom",rot: 4,  scale: 1.05 }, idle: "sway",   out: { dir: "bottom",rot: -5, scale: 0.95 } },
  slamScale:   { in: { dir: "none",  scale: 2.1, rot: -3 },  idle: "breathe",out: { dir: "none",  scale: 0.1, rot: 4 } },
  spinSlam:    { in: { dir: "left",  rot: -150, scale: 0.4 }, idle: "floatY", out: { dir: "right", rot: 120, scale: 0.5 } },
  flipSlam:    { in: { dir: "top",   rot: 90,  scale: 0.7 }, idle: "sway",   out: { dir: "bottom", rot: -80, scale: 0.6 } },
  dropSlam:    { in: { dir: "top",   rot: -2, scale: 1.3 },  idle: "bob",    out: { dir: "bottom", rot: 2,  scale: 0.8 } },
  riseSlam:    { in: { dir: "bottom", rot: 2, scale: 1.3 },  idle: "bob",    out: { dir: "top",   rot: -2, scale: 0.8 } },
  zoomSlam:    { in: { dir: "none",  scale: 0.15, rot: 12 }, idle: "breathe",out: { dir: "none",  scale: 2.4, rot: -8 } },
  tiltSlam:    { in: { dir: "left",  rot: -28, scale: 1.1 }, idle: "sway",   out: { dir: "bottom", rot: 22, scale: 0.9 } },
  swingSlam:   { in: { dir: "top",   rot: -55, scale: 1.0 }, idle: "pendulum",out: { dir: "right", rot: 45, scale: 0.9 } },
  orbitSlam:   { in: { dir: "right", rot: 60, scale: 0.5 },  idle: "drift",  out: { dir: "left",  rot: -60, scale: 0.5 } },
  wipeSlam:    { in: { dir: "left",  clip: true, scale: 1 }, idle: "floatY", out: { dir: "right", clip: true, scale: 1 } },
  maskSlam:    { in: { dir: "bottom", clip: true, scale: 1 },idle: "floatY", out: { dir: "top",   clip: true, scale: 1 } },
  blurSlam:    { in: { dir: "left",  blur: 26, scale: 1.2 }, idle: "drift",  out: { dir: "right", blur: 22, scale: 1.15 } },
  cascade:     { in: { dir: "top",   rot: -12, scale: 0.86 },idle: "wave",   out: { dir: "bottom", rot: 14, scale: 0.86 } },
  elasticPop:  { in: { dir: "none",  scale: 0.05, rot: -18 },idle: "breathe",out: { dir: "none",  scale: 0.05, rot: 18 } },
};

export const COPY = [
  { key: "burger",    kicker: "EXCLUSIVE",  lines: ["LAYERS OF", "DELICIOUS"], sub: "UNEXPECTED FLAVOR", cta: "ORDER NOW",     badge: "TASTY BURGER" },
  { key: "menu",      kicker: "SUPER",      lines: ["DELICIOUS", "FOOD MENU"],  sub: "TODAY'S BEST DEAL", cta: "ORDER NOW",     badge: "24/7 DELIVERY" },
  { key: "fresh",     kicker: "NEW",        lines: ["FRESH FROM", "THE OVEN"],  sub: "MADE THIS MORNING", cta: "SEE THE MENU",  badge: "HOT & FRESH" },
  { key: "deal",      kicker: "TODAY ONLY", lines: ["BIG TASTE", "SMALL PRICE"],sub: "COME HUNGRY",       cta: "GRAB IT",       badge: "SPECIAL" },
  { key: "spicy",     kicker: "WARNING",    lines: ["SERIOUSLY", "SPICY"],      sub: "FOR THE BRAVE",     cta: "TRY IT",        badge: "HOT HOT" },
  { key: "veggie",    kicker: "PLANT BASED",lines: ["GREEN &", "GORGEOUS"],     sub: "FRESH EVERY DAY",   cta: "TASTE IT",      badge: "VEGGIE" },
  { key: "coffee",    kicker: "BREWED",     lines: ["WAKE UP", "WITH US"],      sub: "FRESH ROAST DAILY", cta: "ORDER AHEAD",   badge: "OPEN 7AM" },
  { key: "sweet",     kicker: "DESSERT",    lines: ["TOO GOOD", "TO SHARE"],    sub: "SWEET OBSESSION",   cta: "INDULGE",       badge: "SWEET" },
  { key: "pizza",     kicker: "STONE BAKED",lines: ["ONE MORE", "SLICE"],       sub: "STRAIGHT FROM THE OVEN", cta: "ORDER NOW", badge: "HOT" },
  { key: "breakfast", kicker: "GOOD MORNING",lines:["START YOUR", "DAY RIGHT"], sub: "SERVED FROM 7AM",   cta: "FIND US",       badge: "BREAKFAST" },
  { key: "lunch",     kicker: "LUNCH",      lines: ["READY IN", "FIVE"],        sub: "NO WAITING AROUND", cta: "ORDER NOW",     badge: "12–3 PM" },
  { key: "family",    kicker: "FOR EVERYONE",lines:["MADE TO", "SHARE"],        sub: "BIG TABLE ENERGY",  cta: "BOOK A TABLE",  badge: "FAMILY SIZE" },
  { key: "local",     kicker: "LOCAL",      lines: ["FROM THE", "NEIGHBOURHOOD"],sub:"SUPPORT LOCAL",     cta: "VISIT US",      badge: "OUR STREET" },
  { key: "chef",      kicker: "CHEF'S PICK",lines: ["OUR BEST", "SELLER"],      sub: "YOU ASKED FOR IT",  cta: "TRY IT TODAY",  badge: "TOP PICK" },

  // ---- the Membership campaign ----------------------------------------------------------
  // One lockup, read top to bottom in the order the brief fixes: what the plan is, what it
  // costs, what that works out to, what else you get, what the smaller plan costs, and what to
  // do. Every string is the brief's, character for character - this deck is not allowed to
  // invent a price, a term or a claim, and the only thing it varies is how they are set.
  //
  // `lines` carries the hero, `sub` the per-meal working, `bonus` the promotional line and
  // `note` the quiet second offer. The bonus is a line of the stack rather than a floating
  // badge: no badge shape holds "OCTOBER BONUS - +1 MEAL FREE" without shrinking it below
  // reading size, and the bonus is not allowed to be louder than the offer it decorates.
  {
    key: "membership",
    campaign: "membership",
    kicker: "KO KITCHEN MEMBERSHIP",
    // The offer exactly as the campaign states it, kept whole for the record and for the test
    // that guards it, and `lines` is how it is set: the separator becomes the line break, so the
    // price gets a line of its own to be the loudest thing on the canvas. `fig` is the line the
    // type treatments treat as the figure - see `.bn__fig` in lab.css.
    offer: "10 MEALS · €69",
    lines: ["10 MEALS", "€69"],
    fig: "€69",
    sub: "€6.90 per meal",
    bonus: "OCTOBER BONUS · +1 MEAL FREE",
    note: "6 meals · €49",
    cta: "JOIN NOW",
  },

  // ---- the Deli Club campaign -----------------------------------------------------------
  // Two lines and a label, and nothing else. The source creative is a price poster: the club's
  // name in a pill, the offer, and the monthly figure. There is no call to action on it, so the
  // deck does not invent one - a CTA is a claim about what the business wants the viewer to do,
  // and inventing it is the same class of mistake as inventing a price.
  //
  // The headline is two lines because the source sets them as two: "10 Meals only" in the olive,
  // then the figure half again as large in the orange. `fig` names the second line, which is the
  // line the type treatments size - see `.bn__fig` in lab.css.
  {
    key: "deliclub",
    campaign: "deliclub",
    kicker: "Deli club",
    offer: "69 €/mo",
    lines: ["10 Meals only", "69 €/mo"],
    fig: "69 €/mo",
  },
  // The club sells two plans, and the deck asks which one it should be selling. The second plan
  // is the same lockup with the other numbers: the label, the two-line shape and the figure are
  // the source's, and `Meals only` is the source's own phrase reused rather than a new claim.
  {
    key: "deliclub6",
    campaign: "deliclub",
    kicker: "Deli club",
    offer: "49 €/mo",
    lines: ["6 Meals only", "49 €/mo"],
    fig: "49 €/mo",
  },

  // ---- the Bring your own cup campaign ---------------------------------------------------
  // A different piece of content, so a different campaign: the club's plan posters are one
  // direction and this is another, and a deck that varied both would answer "which composition"
  // with three messages mixed into it.
  //
  // One sentence, set as three lines: the instruction, then the reward, then the drinks it is
  // about. Three and not two because the reward clause is twice the length of every other line
  // the club sets - as one line the fitter shrank it to 40px against the deck's 90px, which is
  // not a smaller offer but an unread one. `fig` is the clause that carries the figure, which is
  // what the accent is for. There is no label and no call to action because the brief gives none,
  // and the trailing full stop of the brief's sentence is punctuation, not part of the lockup.
  {
    key: "byoc",
    campaign: "byoc",
    offer: "Bring your own cup get up to 10% off in hot drinks",
    lines: ["Bring your own cup", "get up to 10% off", "in hot drinks"],
    fig: "get up to 10% off",
  },

  // ---- the Reusable Cup communication experiment -----------------------------------------
  // The words are not this file's. They are `MESSAGE_FRAMES["bring-save"]` from `strategy.mjs`,
  // the `bring → save` frame the reusable-cup brief pins, and they are built here rather than
  // retyped so the rendered lockup and the authored frame cannot drift apart. The frame is the
  // one hypothesis the Hook experiment HOLDS: the opening is the only thing under test, so the
  // sentence a viewer reads is the same in every candidate.
  //
  // Two lines and no kicker, sub, note, badge or call to action, because the brief's message
  // strategy gives none: the desired behavior is already stated by the headline, and a call to
  // action would be a second instruction for the same act. `fig` is the reward clause, which is
  // what the accent is for and what the reward treatment emphasises.
  {
    key: "reusable-cup",
    campaign: "reusable-cup",
    offer: `${MESSAGE_FRAMES["bring-save"].headline} ${MESSAGE_FRAMES["bring-save"].reward}`,
    lines: [MESSAGE_FRAMES["bring-save"].headline, MESSAGE_FRAMES["bring-save"].reward],
    fig: MESSAGE_FRAMES["bring-save"].reward,
  },

  // ---- the own-cup field ------------------------------------------------------------------
  // The same promotion as `byoc` and `reusable-cup`, in the operator's own words for this scene:
  // "Bring your OWN. Get 10% off". It is a third block rather than a reuse of either because the
  // words are the operator's and are not this file's to paraphrase - `byoc` says "get up to 10%
  // off" and this says "Get 10% off", and those are different claims about the same offer.
  //
  // The capitalised "OWN" is the operator's emphasis, kept exactly. It is a word inside the line
  // rather than a line of its own, so it is carried by the string and not by `fig`: `fig` names a
  // whole line for a type treatment to size, and the accent belongs on the reward.
  {
    key: "owncup",
    campaign: "owncup",
    offer: "Bring your OWN. Get 10% off",
    lines: ["Bring your OWN.", "Get 10% off"],
    fig: "Get 10% off",
  },
];

/**
 * The copy blocks a general deck may draw from. The campaign's own lockup is not one of them: it
 * is Membership content, and a general Mode that varied it would put "KO KITCHEN MEMBERSHIP" over
 * an unrelated photo under an unrelated type treatment. It would also put the campaign's
 * hierarchy rules and a general type treatment on the same element at once, and the audit caught
 * exactly that - eight `ribbonKicker` banners where the campaign's kicker colour and the
 * treatment's ribbon ground left the text at 2.4:1.
 */
export const GENERAL_COPY = COPY.filter((c) => !c.campaign);

/**
 * Which photo subjects each copy block can honestly sit next to. A "VEGGIE" headline over
 * croissants is not a design experiment, it is a mistake, so the sampler pairs them.
 * Copy keys absent here take any photo.
 */
export const COPY_CATS = {
  burger:    ["burger", "cheeseburger", "barbecue", "steak", "sandwich"],
  fresh:     ["croissant", "salad bowl", "fruit", "smoothie bowl", "breakfast", "seafood"],
  spicy:     ["curry", "ramen", "noodles", "tacos", "fried chicken"],
  veggie:    ["salad bowl", "soup", "smoothie bowl", "fruit", "pasta"],
  coffee:    ["coffee latte", "breakfast", "croissant", "chocolate cake", "dessert"],
  sweet:     ["chocolate cake", "dessert", "doughnut", "ice cream", "croissant"],
  pizza:     ["pizza", "pasta", "sandwich"],
  breakfast: ["breakfast", "croissant", "doughnut", "coffee latte", "smoothie bowl"],
  lunch:     ["sandwich", "tacos", "soup", "noodles", "sushi", "pizza", "pasta"],
  family:    ["pizza", "pasta", "barbecue", "sushi", "noodles", "tacos", "seafood"],
  chef:      ["steak", "seafood", "sushi", "dumplings", "ramen"],
};
/** Layouts where the photo fills the whole canvas, so it cannot also be a framed object. */
export const FULL_CANVAS_LAYOUTS = new Set(["fullBleed", "cornerScrim"]);

/**
 * Layouts where the photo is a full-width band or the whole canvas. A floating cutout or an arch
 * needs a box of its own, so these layouts may not carry one - on `bottomPlate` the media box is
 * the full width of the canvas and an arch across it is not an arch.
 */
export const WIDE_MEDIA_LAYOUTS = new Set([...FULL_CANVAS_LAYOUTS, "bottomPlate"]);

/** Treatments that only look right with a real alpha cutout. */
export const NEEDS_CUTOUT = new Set(["cutoutFloat", "arch"]);

/**
 * Treatments that need a box of their own, so a full-canvas layout cannot carry them: a floating
 * cutout and an arch. Wider than NEEDS_CUTOUT - an arch needs no alpha asset but still cannot be
 * stretched across the whole canvas.
 */
export const NEEDS_OWN_BOX = new Set(["cutoutFloat", "arch"]);

/**
 * Treatments that draw a container around the picture - a frame, a circle, a card, a polaroid.
 * On a full-canvas layout a container is a frame around the whole poster and it works; on a
 * full-width *strip* it is a footer, and a product adrift inside an empty footer is not a
 * composition. `bottomPlate` is the only strip layout and it is Direction-only, so the rule is
 * scoped to it rather than added to `NEEDS_OWN_BOX`, which would resample Composition and Scene.
 */
export const STRIP_INCOMPATIBLE = new Set([...NEEDS_OWN_BOX, "framed", "circleMask", "tiltedCard", "polaroid"]);

// --------------------------------------------------------------------------- //
// time
// --------------------------------------------------------------------------- //

/**
 * The five Phases of the loop, in seconds. This is the single source of truth: the GSAP
 * timeline in lab.js and the background-energy keyframes in lab.css are both derived from
 * these numbers, so a curve cannot drift away from the timeline it is meant to follow.
 *
 * The boundaries are design intent, not arithmetic. A Scene whose cast is small finishes
 * entering before the Reveal boundary and one with a big cast finishes just after it; the
 * background is allowed to be calm either way.
 */
export const PHASES = {
  intro:  [0, 1.5],     // the background has the stage to itself
  reveal: [1.5, 3.5],   // the panel wipes in and the elements enter
  hold:   [3.5, 9.5],   // settled and readable - the Settled Composition
  exit:   [9.5, 11.0],  // the elements are thrown back off the canvas
  tail:   [11.0, 12.0], // the background alone again, which is what the loop opens on
};

// --------------------------------------------------------------------------- //
// how the scene moves, and how hard the background pushes
// --------------------------------------------------------------------------- //

/**
 * How far the background travels during each Phase, as a fraction of the travel it would make
 * at full energy. The sheets always slide; this only decides how far. A quiet Hold is the
 * point - the copy should not have to fight its own background for six seconds.
 *
 * A curve is a list of [seconds, energy] stops, linearly joined, and it is driven by the same
 * GSAP timeline as the elements. That matters: a curve on the CSS clock could not be frozen
 * with `seek(t)`, so every contact sheet and motion strip would show whatever energy the wall
 * clock happened to be at rather than the energy of the Phase it was illustrating.
 *
 * `flat` is the control - no curve, full travel for the whole loop, which is what v2 shipped.
 */
const at = (phase, i) => PHASES[phase][i];
export const BG_ENERGY_CURVES = {
  flat: null,
  /* loud at the edges, quiet while you read */
  swell: [
    [0, 1], [at("reveal", 0), .78], [at("reveal", 1), .22],
    [at("exit", 0), .22], [at("exit", 1), 1], [at("tail", 1), 1],
  ],
  /* the same shape pushed much further: how quiet can the Hold get before the board dies? */
  swellHard: [
    [0, 1], [at("reveal", 0), .55], [at("reveal", 1), .07],
    [at("exit", 0), .07], [at("exit", 1), 1], [at("tail", 1), 1],
  ],
  /* two calm windows instead of one plateau */
  breathe: [
    [0, 1], [at("reveal", 0), .68], [at("reveal", 1), .28],
    [6.0, .78], [at("exit", 0), .28], [at("exit", 1), 1], [at("tail", 1), 1],
  ],
};
export const BG_ENERGY = Object.keys(BG_ENERGY_CURVES);

/** The parts of a Scene that can take their own share of the motion. Reading order. */
export const ROLES = ["copy", "media", "badge", "decor"];

/**
 * How much of the Scene's Motion family each Role takes. The family is decided once per Scene
 * so the board reads as a single gesture; this decides who carries it and who stays quiet.
 * `idle` scales the breathing for every Role at once.
 *
 * `uniform` is the control: every Role takes the family whole, which is what v2 shipped.
 */
export const ROLE_MOTION = {
  uniform:     { copy: 1.00, media: 1.00, badge: 1.00, decor: 1.00, idle: 1.00 },
  hierarchy:   { copy: 0.72, media: 1.05, badge: 1.30, decor: 1.40, idle: 1.00 },
  textLead:    { copy: 1.25, media: 0.85, badge: 0.95, decor: 0.70, idle: 0.90 },
  productLead: { copy: 0.62, media: 1.35, badge: 1.10, decor: 0.88, idle: 1.00 },
  hush:        { copy: 0.55, media: 0.80, badge: 1.10, decor: 1.15, idle: 0.40 },
};

/**
 * Every field a Banner carries, in display order. One list, imported by the build summary,
 * the gallery's filters and the analysis, so an axis can never show up in one and be missing
 * from another.
 */
export const AXES = [
  "paletteName", "layout", "bg", "bgEnergy", "type", "card", "bonus", "badge", "cta",
  "product", "decor", "motion", "roleMotion", "copy", "photo",
];

/**
 * The value set each axis is dealt from when a Mode varies it and no Campaign narrows it. One
 * list, because two things need the same answer: `gen.mjs`, which deals the deck, and `stampFor`,
 * which hashes what the deck was dealt from.
 *
 * They were written separately once, and the sampler's copy of the table was the one that was
 * wrong: `card` and `bonus` were added to `AXES` and to the Campaign's own domain, but not to the
 * table `gen.mjs` had written by hand, so every general Banner carried `undefined` for both. The
 * renderer fell back to `none`, nothing looked wrong, and every Vote stored a vector with two
 * undefined fields.
 *
 * `photo` is the only axis whose domain is not in this file: it is the pool, so the caller that
 * has loaded it passes it in, and an empty pool is `none` rather than an empty list.
 */
export const globalDomains = (photos = []) => ({
  paletteName: Object.keys(PALETTES),
  layout: LAYOUTS,
  bg: BACKGROUNDS,
  bgEnergy: BG_ENERGY,
  type: TYPES,
  card: CARDS,
  bonus: BONUSES,
  badge: BADGES,
  cta: CTAS,
  product: PRODUCTS,
  decor: DECOR,
  motion: MOTIONS,
  roleMotion: Object.keys(ROLE_MOTION),
  copy: GENERAL_COPY.map((c) => c.key),
  photo: photos.length ? photos : ["none"],
});

// >>> reference (owned by promote.mjs: `node promote.mjs <banner-id>` rewrites this block)
/**
 * The generation of the Reference Scene. The workflow replaces the Reference three times -
 * Composition's winner becomes Reference v2, Background's becomes v3, Motion's becomes v4 - and
 * `promote.mjs` is what performs that replacement. The version is part of the experiment stamp,
 * so two decks built against the same vector in different generations are still two experiments
 * and a Vote cast in one is never joined to the other.
 */
export const REFERENCE_VERSION = 1;

/**
 * The Reference Scene: one axis vector that every Mode holds fixed while it studies something
 * else. Background and Motion mode can only isolate their own axis if the Composition behind it
 * does not also change, and the lab has no validated Composition to point at yet (feedback.jsonl
 * is empty), so the reference is declared rather than derived.
 *
 * Re-point it at the winner of Composition mode once that mode has votes - `node promote.mjs
 * <banner-id>` does exactly that, and bumps REFERENCE_VERSION. Nothing else changes: the modes
 * read this object, they do not know which values are in it.
 */
export const REFERENCE = {
  paletteName: "ember",
  layout: "productRight",
  bg: "duoSlide",
  bgEnergy: "swell",
  type: "whiteCaps",
  card: "none",
  bonus: "none",
  badge: "circle",
  cta: "pill",
  product: "cutoutFloat",
  decor: "sparkles",
  motion: "slamLeft",
  roleMotion: "hierarchy",
  copy: "burger",
  photo: "cheeseburger-01-nhd6bs5qcgcjpg.jpg",
};
// <<< reference

/**
 * The composition shortlist the club's two decks share. Both ask the same question of the same
 * brand - how should this be set - so they draw from the same set: four grounds, four reading
 * orders, four type systems, three decoration levels, three photo treatments, six gestures and
 * three distributions.
 *
 * `centerStack` is not in the reading orders. It took all eleven of its votes in the plan deck's
 * first round, including the one cast after the sliced photo was fixed, and the render says why:
 * two inset blocks stacked in the middle of the ground, touching no border, with nothing for the
 * eye to travel along. A Campaign is a direction, so a value that loses every vote comes out of
 * the shortlist instead of being dealt again to lose again.
 */
const CLUB_SHORTLIST = {
  paletteName: ["deliCream", "memberCream", "memberOlive", "memberInk"],
  layout: ["productRight", "productLeft", "productBehind", "circleMask"],
  type: ["deliSerif", "whiteCaps", "stacked", "ticket"],
  decor: ["none", "dots", "marks"],
  product: ["framed", "circleMask", "cutoutFloat"],
  motion: ["slamLeft", "riseSlam", "zoomSlam", "cascade", "maskSlam", "elasticPop"],
  roleMotion: ["hierarchy", "textLead", "hush"],
};

/**
 * The Direction families' grounds.
 *
 * These are deliberately NOT in `PALETTES`. A palette table is the general space's axis domain, so
 * adding one here would put olive, teal, slate, kraft and afterglow into the Composition and Scene
 * cross-products - which is the thing the Expression Kit exists to stop: the new colours bolted
 * onto the old combinatorial machine, and every general deck resampled as a side effect.
 *
 * A Direction's ground is a property of the Direction, so it lives here and is reached through
 * `DIRECTIONS[id].domains.paletteName`. The contract is the same as every palette above:
 * ink/muted/accent/accent2 on `panel` >= 4.5, onAccent on `accent` >= 4.5. The three `slide` tones
 * are near-neighbours on purpose - a Direction's field reads as ONE ground that happens to be
 * moving, which is what lets a Direction be "teal" or "slate" rather than a gradient.
 *
 * `panel` is the surface the copy sits on. Four Directions set it to the field's own tone
 * (`oliveField`, `oliveFieldSoft`, `slateFeast`, `slateDeep`) so the panel dissolves and the type
 * reads as sitting ON the ground; the rest keep a distinct surface - paper on the kraft, board on
 * the teal. That choice belongs to the Direction, not to the Banner.
 */
export const DIRECTION_PALETTES = {
  oliveField:   { mode: "dark",  panel: "#282F23", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#282F23", "#2C3426", "#282F23"] },
  oliveFieldSoft: { mode: "dark", panel: "#2C3426", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#2C3426", "#303827", "#2C3426"] },
  tealService:  { mode: "dark",  panel: "#1B332F", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#F2EDDF", muted: "#A9B388", onAccent: "#12241F", slide: ["#4F8580", "#558B85", "#4F8580"] },
  tealShade:    { mode: "dark",  panel: "#16302C", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#F2EDDF", muted: "#A9B388", onAccent: "#12241F", slide: ["#3F6F6A", "#467771", "#3F6F6A"] },
  slateFeast:   { mode: "dark",  panel: "#343A37", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#343A37", "#39403C", "#343A37"] },
  slateDeep:    { mode: "dark",  panel: "#2A302C", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#B5BEA0", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#2A302C", "#2F3531", "#2A302C"] },
  creamLinen:   { mode: "light", panel: "#FEFAE0", ink: "#282F23", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#F2EDDF", "#F6F1E4", "#F2EDDF"] },
  creamPaper:   { mode: "light", panel: "#FFFFFF", ink: "#1D231A", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#FEFAE0", "#F8F3E4", "#FEFAE0"] },
  kraftGarden:  { mode: "light", panel: "#FEFAE0", ink: "#282F23", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#C7A36B", "#CCAA75", "#C7A36B"] },
  kraftLinen:   { mode: "light", panel: "#FEFAE0", ink: "#282F23", accent: "#C2410C", accent2: "#5F6F52", muted: "#5F6F52", onAccent: "#FEFAE0", slide: ["#D8BE8E", "#DDC59A", "#D8BE8E"] },
  afterglow:    { mode: "dark",  panel: "#0F130D", ink: "#FEFAE0", accent: "#C4661F", accent2: "#D8A82E", muted: "#B5BEA0", onAccent: "#0F130D", slide: ["#2F3729", "#333B2C", "#2F3729"] },
  afterglowWood:{ mode: "dark",  panel: "#241E16", ink: "#FEFAE0", accent: "#FF7D00", accent2: "#D8A82E", muted: "#B5BEA0", onAccent: "#1D231A", slide: ["#402E1F", "#473426", "#402E1F"] },
};

/** Every ground a Banner may name, general or Direction. Only the renderer needs the union. */
export const ALL_PALETTES = { ...PALETTES, ...DIRECTION_PALETTES };

/**
 * The values a Direction may name that the general space may not.
 *
 * The Expression Kit's rule is that a Direction is decided first and the axes are sampled inside
 * it. A value that only makes sense as part of a Direction therefore belongs to the Direction
 * layer, not to the general axis domain - otherwise adding one silently resamples every deck the
 * lab has already built, and the new idea arrives as a new option in the old cross-product, which
 * is the thing this whole layer exists to stop. `DIRECTIONS[id].domains` names these freely;
 * `valuesFor` never deals them outside a Direction deck.
 */
export const DIRECTION_ONLY = {
  layout: ["bottomPlate"],
  type: ["displayField", "priceLockup", "editorialStack"],
  decor: ["rule", "stamp"],
  paletteName: Object.keys(DIRECTION_PALETTES),
};

/**
 * A Direction is the first creative decision, and it is not a palette.
 *
 * The lab used to search a cross-product: palette x layout x type x badge x cta x product x decor.
 * That produces technically valid but aesthetically incoherent Banners, because the axes are
 * independent and taste is not. A Direction is the coherent hypothesis the cross-product cannot
 * state: a dominant ground, a typographic posture, an image role, a crop habit, a material
 * vocabulary, a decoration budget and one expressive tension, decided together. See
 * `../brand/brand-expression-kit/04-direction-families.yaml` for the source families and
 * `docs/directions.md` for how they constrain the axes.
 *
 * `domains` is what makes the search local instead of Cartesian: a Banner dealt this Direction may
 * only take the values listed here, so the sampler samples inside a point of view rather than
 * across the whole space. Every Direction must name every axis the Direction deck varies, or the
 * deck would hold different axes for different Banners and its stamp would be a lie - `gtest.mjs`
 * asserts it.
 *
 * `panelPosture` is the one property that is not an axis: `field` dissolves the copy panel into the
 * ground (the type reads as sitting on the field), `surface` keeps it as a material surface (paper
 * on kraft, board on teal). It is applied as a CSS class by `renderBanner`, not sampled.
 *
 * `tension` is the single expressive relationship the Direction is built around, and `level` is the
 * Expression Ladder rung (1 essential, 2 signal, 3 material, 4 editorial, 5 kinetic) the Direction
 * mostly works at. Both are documentation the analysis and the gallery can read; neither is a
 * variable.
 */

export const DIRECTIONS = {
  "olive-editorial": {
    name: "Olive Editorial",
    thesis: "A confident food-editorial poster: quiet olive field, huge cream typography, one orange sales signal.",
    tension: "oversized type x small card object",
    level: 4,
    panelPosture: "field",
    domains: {
      paletteName: ["oliveField", "oliveFieldSoft"],
      layout: ["productRight", "productLeft", "productBehind", "fullBleed"],
      type: ["displayField", "editorial", "stacked", "whiteCaps"],
      product: ["bottomCrop", "framed", "cutoutFloat"],
      decor: ["none", "rule"],
      cta: ["underline", "boxed", "none"],
      card: ["none", "support", "crop"],
      bonus: ["highlight", "strap"],
      photo: ["ko-burger.png", "ko-curry.png", "ko-turkey-sandwich-1.png"],
    },
  },

  "teal-service": {
    name: "Teal Service",
    thesis: "The cool teal serving surface as a distinct Ko field; warm food and cream type supply the contrast.",
    tension: "cool teal field x warm food crop",
    level: 3,
    panelPosture: "surface",
    domains: {
      paletteName: ["tealService", "tealShade"],
      layout: ["productRight", "productLeft", "circleMask", "bottomPlate"],
      type: ["displayField", "whiteCaps", "editorial", "priceLockup"],
      product: ["framed", "circleMask", "bottomCrop"],
      decor: ["none", "rule"],
      cta: ["pill", "boxed", "none"],
      card: ["none", "support", "behind"],
      bonus: ["highlight", "strap"],
      photo: ["ko-curry-vegan-basmati.png", "ko-caprese-sandwich-1.png", "ko-pickles-cheese-sandwich-1.png"],
    },
  },

  "slate-feast": {
    name: "Slate Feast",
    thesis: "Dark slate as a tactile neutral stage for abundant food and cream typography.",
    tension: "dark slate field x bright warm food",
    level: 4,
    panelPosture: "field",
    domains: {
      paletteName: ["slateFeast", "slateDeep"],
      layout: ["fullBleed", "productBehind", "productRight", "cornerScrim"],
      type: ["displayField", "stacked", "editorial", "priceLockup"],
      product: ["bottomCrop", "framed", "cutoutFloat"],
      decor: ["none", "rule"],
      cta: ["boxed", "underline", "pill"],
      card: ["none", "hero", "tilt"],
      bonus: ["strap", "highlight", "ribbon"],
      photo: ["ko-curry-vegan-angle.png", "ko-caprese-sandwich-2.png", "ko-burger.png"],
    },
  },

  "cream-linen": {
    name: "Cream Linen",
    thesis: "A bright, generous editorial layout: warm cream, dark olive type and one concentrated food or accent area.",
    tension: "quiet cream field x aggressive oversized price",
    level: 3,
    panelPosture: "surface",
    domains: {
      paletteName: ["creamLinen", "creamPaper"],
      layout: ["productLeft", "productRight", "fullBleed", "topBanner"],
      type: ["displayField", "editorial", "whiteCaps", "offerStrap"],
      product: ["framed", "circleMask", "bottomCrop"],
      decor: ["none", "rule"],
      cta: ["underline", "boxed", "pill"],
      card: ["none", "support", "tilt"],
      bonus: ["highlight", "strap"],
      photo: ["ko-latte.png", "ko-croissant-vegan.png", "ko-caprese-sandwich-2.png"],
    },
  },

  "kraft-garden": {
    name: "Kraft Garden",
    thesis: "Modern typography over casual kraft warmth, lifted by herbs, flowers and fruit.",
    tension: "rustic kraft material x precise modern typography",
    level: 3,
    panelPosture: "surface",
    domains: {
      paletteName: ["kraftGarden", "kraftLinen"],
      layout: ["productRight", "productLeft", "productBehind", "bottomPlate"],
      type: ["displayField", "editorial", "stacked", "ticket"],
      product: ["framed", "tiltedCard", "bottomCrop"],
      decor: ["none", "leaves", "rule"],
      cta: ["pill", "chipArrow", "none"],
      card: ["none", "support", "tilt"],
      bonus: ["highlight", "ribbon"],
      photo: ["ko-turkey-sandwich-1.png", "ko-croissant-vegan.png", "ko-pickles-cheese-sandwich-1.png"],
    },
  },

  "garden-afterglow": {
    name: "Garden Afterglow",
    thesis: "Warm late-day hospitality: deep ground, directional sunlight, food highlights and a burnt-orange signal.",
    tension: "cinematic warm crop x simple quiet type",
    level: 4,
    panelPosture: "surface",
    domains: {
      paletteName: ["afterglow", "afterglowWood"],
      layout: ["fullBleed", "cornerScrim", "productBehind", "productRight"],
      type: ["displayField", "editorial", "stacked", "shadowPop"],
      product: ["bottomCrop", "cutoutFloat", "framed"],
      decor: ["none", "leaves"],
      cta: ["pill", "underline", "none"],
      card: ["none", "hero", "behind"],
      bonus: ["highlight", "strap"],
      photo: ["ko-brownie.png", "ko-chocolate-chunk-cookie.png", "ko-double-espresso.png"],
    },
  },
};

/** Direction ids, in the order the kit lists them. */
export const DIRECTION_IDS = Object.keys(DIRECTIONS);

/**
 * The axis a Direction deck varies first. It is deliberately NOT a member of `AXES`.
 *
 * `AXES` is the general design space, and every stamp hashes it. Adding a field to it would move
 * the stamp of every deck the lab has ever built, and turn the Votes already cast - the Deli Club
 * round - into stale Votes overnight. A Direction deck is a new kind of deck, so its stamp covers
 * this axis explicitly (`stampFor`) while every existing deck's stamp stays exactly where it was.
 */
export const DIRECTION_AXIS = "direction";

/**
 * Which direction the own-cup field rolls, and how far.
 *
 * It is an axis-like field and not an `AXES` member for the same reason `direction` is not: the
 * field is a scene, not a column of the general design space. Adding it to `AXES` would move the
 * experiment stamp of every deck the lab has already built and turn every Vote cast on them into a
 * stale Vote, and it would deal a cup field to Composition and Scene - decks whose whole question is
 * "does this design work as a still", which a rolling wall of paper cups answers by accident.
 *
 * `tiles` is the travel in grid cells, not pixels: the field is a tiled ground and the hero cup is
 * a box in one of its cells, so both are moved by the same two numbers and neither can drift. Whole
 * cells matter - at the end of the roll the field is displaced by an exact multiple of the tile, so
 * the ground it settles on is the ground it started on and the loop closes without a jump.
 *
 * `still` is the control. If the field is preferred at rest, the roll is not earning the four
 * seconds it costs before the message is complete, and the honest answer is to drop it.
 */
export const ROLL_AXIS = "roll";

/** The distance each roll covers, in cells. Six cells is 1382px - most of the canvas width - and
 *  the run is 1.8s, so the wall crosses at about 770px/s: fast enough that the speed effect has
 *  something to be about, and slow enough that a cup is still a cup and not a stripe. */
export const CUP_ROLLS = {
  h: { label: "Horizontal", tiles: [6, 0] },
  v: { label: "Vertical", tiles: [0, 6] },
  d: { label: "Diagonal", tiles: [4, 4] },
  still: { label: "Still", tiles: [0, 0] },
};

export const ROLL_IDS = Object.keys(CUP_ROLLS);

/**
 * The own-cup field: the geometry and the beats of the one scene this campaign renders.
 *
 * It is one table rather than constants in the stylesheet because two consumers have to agree on
 * it exactly. `lab.css` draws the tile and puts the hero cup's box in a cell; `lab.js` rolls the
 * field and lands the cup in that cell. A cell expressed twice is a cup that stands between two
 * rows of paper cups.
 *
 * `cell` is in tiles from the canvas origin. The cup's base sits on the cell's baseline, so the
 * hero stands on the same floor as the cups around it - which is the whole reason it reads as one
 * cup in the grid being different rather than as a product shot laid over a pattern.
 *
 * `tile` is the cell size in `--u`, the banner's own unit (19.2px at 1920x1080), so the field keeps
 * its density at any size. `mug` is the hero's box as a fraction of a cell: taller than a paper cup
 * and much narrower, which is what the two shapes actually are, and short enough that the cup is
 * still a cup in the grid before the shift.
 */
export const CUPFIELD = {
  /**
   * The cell the cup lands on. It is the third floor of the grid - `(row + baseline) * tile` - and
   * not the middle one, because the hero is a tall object: it stands on the same floor as the cups
   * in its row, and a floor near the top of the canvas would push its rim off the frame.
   */
  cell: [1, 3],
  tile: 12,
  /**
   * The tile image itself, in the one place both consumers can read it: `tiles.mjs` builds the PNG
   * from this, and `lab.css` reads `baseline` back out of it to stand the hero cup on the same
   * floor as the cups around it. The stylesheet cannot see the PNG's contents, and a baseline typed
   * into the CSS as well is a cup that stands between two rows the day the tile is re-cut.
   */
  tileSpec: { side: 512, subject: 0.76, baseline: 0.93 },
  /**
   * The hero's box as a fraction of a cell. It has to read as an object, not as a cup, so it is
   * taller than the cell it lands on - and it lands on a cell, because the ground it comes to rest
   * on is the ground the cups were standing on.
   *
   * It is as large as the frame allows and no larger: `h * tile * shift.scale` is 861px against a
   * 1080px canvas, and the cup grows from its foot, so anything taller would push its rim off the
   * top. The brief's word for this object is "priority", and a cup the size of the cups it is
   * standing in does not have any.
   */
  mug: { w: 1.55, h: 3.40 },
  /**
   * The roll, in three moves, and the whole reason it is three is the loop.
   *
   * `run` is a flat, fast pass: the wall is already moving when the Banner opens and it does not
   * ease in, because a wall that starts from rest spends its first second saying nothing. `brake`
   * then takes it to a stop over a distance short enough to feel like a decision. The third move
   * runs on the way out, from `back.at`, and it exists only so the ground is moving again by the
   * time the loop restarts.
   *
   * The numbers are not free. `power1.out` leaves the brake at twice its average rate, so the
   * brake's entry rate is `2 * (1 - runFrac) * travel / brake` and the run's is `runFrac * travel /
   * run`; at 0.70 / 1.4 / 1.2 those are the same number, so the deceleration has no step in it.
   * `power1.in` leaves the third move at twice its average rate too, which is why it is twice as
   * long as the first two together: it ends at the rate the run starts at, so the loop is
   * continuous in velocity and not only in pose. It is also invisible until `wipe.open`, because
   * the ground is wiped away while it is getting up to speed.
   *
   * Every move is a whole number of cells, so the ground at `t=LOOP` is the ground at `t=0`.
   */
  roll: {
    run: 1.8, runFrac: 0.72,
    brake: 1.4, brakeEase: "power1.out",
    back: { at: 7.0, dur: 5.0, ease: "power1.in" },
  },
  /**
   * The speed effect: the ground is smeared along the roll while it is moving fast, and the smear
   * is gone by the time the cup arrives. It comes back with the roll on the way out, so the first
   * frame and the last frame are the same picture - which is the brand's own rule for a loop.
   */
  speed: { out: { at: 1.8, dur: 1.4, ease: "none" }, back: { at: 9.2, dur: 2.8, ease: "power1.out" } },
  /**
   * The wipe: the cups are erased behind the cup as it crosses, and the boundary is the cup's own
   * leading edge. `soft` is the width of the dissolve in cells - a hard edge reads as a mask, and
   * the whole point is that the field is being cleared, not covered.
   *
   * It opens again on the way out. That is not a trick to close the loop: the cup leaves, and the
   * wall it parted closes behind it, which is what the loop should open on.
   */
  wipe: { at: 4.0, dur: 1.3, ease: "expo.out", soft: 0.8, open: { at: 9.6, dur: 2.2, ease: "power2.inOut" } },
  /**
   * The cup arrives from off the right edge. It arrives *large* and settles down to its size, not
   * the other way round: an object that grows into place reads as a graphic being scaled, and an
   * object that flies in too big and lands reads as something with weight and speed behind it.
   * `expo.out` is the whole of that - almost all of the travel in the first third, then a long
   * settle - and it is why the entry is a second long rather than a second and a half.
   */
  emerge: { at: 4.0, dur: 1.05, scale: 1.22, ease: "expo.out" },
  /** The shift forward and the bloom, once the cup has landed. */
  shift: { at: 5.15, dur: 0.85, scale: 1.10, ease: "power3.out" },
  /**
   * The light. It comes up under the cup as the cup crosses - the wall is lit before it is cleared,
   * which is what makes the clearing read as the cup's doing - reaches its brightest as the cup
   * lands, and then eases back to the steady aura the cup holds while the words are read.
   *
   * `at + dur` is `settle.at` exactly, so the light has one arrival and not two.
   */
  glow: { at: 3.6, dur: 1.45, peak: 0.7, settle: { at: 5.05, dur: 0.7, to: 0.6 }, fade: 1.4 },
  /** The words come out of the cup's side, so they arrive after it does. */
  copy: { at: 5.9, dur: 0.6, from: 0.09 },
  /** The cup leaves the way it came, and it is gone before the loop restarts. */
  leave: { at: 9.3, dur: 1.5, ease: "power2.in" },
};

/** Every field a Banner may carry, in display order: the general axes, then the Direction. */
export const FIELDS = [...AXES, DIRECTION_AXIS];

/**
 * The fields that are not columns of the general design space: a Banner may carry one, a deck may
 * vary one, and `stampFor` has to hash it - but adding it to `AXES` would move the experiment stamp
 * of every deck the lab has already built and turn the Votes already cast into stale Votes.
 */
export const EXTRA_AXES = [DIRECTION_AXIS, HOOK_AXIS, ROLL_AXIS];

/**
 * The fields a Mode's deck carries: the general axes, plus every extra field the deck either varies
 * or holds.
 *
 * A held field belongs here even though the deck deals no value for it. The Hook deck holds a
 * Direction, and that Direction is part of what a viewer reacted to: a card that showed the axis
 * vector without it would be describing a different Banner than the one on screen, and a Vote that
 * dropped it could not be joined to the right deck.
 */
export const fieldsFor = (mode) => {
  const varies = variesIn(mode);
  const ref = referenceFor(mode);
  return [...AXES, ...EXTRA_AXES.filter((a) => varies.has(a) || ref[a] != null)];
};

/**
 * The value sets one Direction allows, over the global domains. It is a restriction, never an
 * extension: an axis the Direction does not name is held at the Reference, and a value it does not
 * list is not dealt to its Banners.
 */
export const directionDomains = (id, photos = []) => ({ ...globalDomains(photos), ...(DIRECTIONS[id]?.domains || {}) });

/**
 * The union of every Direction's allowed values, per axis - what a Direction deck is dealt from
 * *as a deck*. The deck's Experiment stamp covers this table, not the per-Banner Direction's own,
 * because one deck is one experiment: a change to any Direction's allowed values resamples the deck
 * and must move its stamp.
 */
export const directionUnionDomains = (photos = []) => {
  const out = { direction: DIRECTION_IDS };
  for (const d of Object.values(DIRECTIONS)) {
    for (const [axis, values] of Object.entries(d.domains)) {
      const seen = (out[axis] ||= []);
      for (const v of values) if (!seen.includes(v)) seen.push(v);
    }
  }
  return { ...globalDomains(photos), ...out };
};

/**
 * A Campaign is a creative direction: one piece of content, and the value sets that suit it.
 *
 * A Mode says what a deck *varies*. A Campaign says what it is *about*. They are orthogonal, so
 * a Campaign restricts the axis domains and supplies the axes it holds, while the Mode still
 * decides which of them vary. The general Modes explore the whole design space; a Campaign Mode
 * explores a disciplined corner of it.
 *
 * The Membership campaign exists because the general composition deck is a search over 960
 * Banners and thirteen axes, and a search is not a direction: it can tell you which palette you
 * prefer, never whether the ad sells. A campaign deck is smaller on purpose - fewer, stronger
 * axes, and every Banner a candidate someone could plausibly ship.
 */
export const CAMPAIGNS = {
  membership: {
    label: "KO Kitchen Membership",
    /**
     * The axes the campaign holds, overriding REFERENCE. The offer is not a variable: the words,
     * the photo and the motion are the same in every Banner of this deck, so the only thing a
     * viewer can be reacting to is the composition. The bonus is a line of the stack, not a
     * badge, so the badge axis is held at `none`.
     */
    pinned: {
      bg: "duoSlide",
      bgEnergy: "swell",
      motion: "slamLeft",
      roleMotion: "hierarchy",
      badge: "none",
      copy: "membership",
      photo: "cheeseburger-01-nhd6bs5qcgcjpg.jpg",
    },
    /**
     * The value sets the campaign is willing to consider. Each is a shortlist, not a domain:
     * four grounds, five reading orders, four type systems, six card placements, four bonus
     * treatments, three CTAs, three decoration levels, three photo treatments. The general
     * deck's 16 x 10 x 10 x 7 x 7 x 7 x 10 is a permutation machine; this is a point of view.
     *
     * The values are the brief's own lists, cut down. `twoTone` is gone because the hero is one
     * line and a two-tone rule needs two; `bottomBand` is gone because it is `productRight` with
     * a taller photo; `sparkles` and `bubbles` are gone because the deck is judged on whether a
     * mark is a mark and not on how many marks there are.
     */
    domains: {
      paletteName: ["memberOlive", "memberCream", "memberInk", "memberSage"],
      layout: ["centerStack", "productRight", "productLeft", "circleMask", "productBehind"],
      type: ["whiteCaps", "priceHero", "offerStrap", "stacked", "ticket"],
      card: ["none", "support", "hero", "tilt", "crop", "behind"],
      bonus: ["strap", "ribbon", "badge", "highlight"],
      cta: ["pill", "boxed", "underline"],
      decor: ["none", "dots", "marks"],
      product: ["framed", "circleMask", "cutoutFloat"],
    },
  },

  deliclub: {
    label: "Deli Club",
    /**
     * The axes the campaign holds. The words, the photo and the background are the same in every
     * Banner, so what the deck is asking is how the same ad is set - and, unlike the Membership
     * deck, how it moves.
     *
     * The background is `duoSlide` on a palette whose three slide tones are near-neighbours, so
     * the ground reads as one colour that happens to be moving. `badge`, `card`, `bonus` and
     * `cta` are held at `none` because the source creative has none of them: it is a price
     * poster, and adding a badge to it would be inventing content.
     */
    pinned: {
      bg: "duoSlide",
      bgEnergy: "swell",
      badge: "none",
      card: "none",
      bonus: "none",
      cta: "none",
      // The campaign's own default block. `copy` is also one of the axes this deck deals, so the
      // deck sets both plans; this names the one a Banner falls back to if the axis ever stops
      // varying, and keeps the held vector honest - the alternative was a campaign whose held
      // `copy` was a general block, which is a landmine rather than a default.
      copy: "deliclub",
      photo: "deli-bowl.jpg",
    },
    /**
     * The value sets the campaign is willing to consider: the club's shared composition shortlist,
     * and the two plans the deck asks the viewer to choose between.
     */
    domains: {
      ...CLUB_SHORTLIST,
      copy: ["deliclub", "deliclub6"],
    },
  },

  /**
   * The club's second direction: the cup discount. Same brand, same composition shortlist, one
   * sentence instead of a price, and a cup instead of a plate.
   *
   * It is a separate Campaign rather than a third copy block in the plan deck, because a deck
   * answers one question: with two plans and a cup offer in the same deck, a preference for
   * `productBehind` could not be told apart from a preference for the cup.
   */
  byoc: {
    label: "Bring your own cup",
    /**
     * The photo is pinned because the offer is about the cup: a Banner that shows a bowl next to
     * "Bring your own cup" is not a design experiment, it is a mistake. This is a takeaway cup on
     * a board, cut out of its background, so the floating treatments have an alpha asset.
     */
    pinned: {
      bg: "duoSlide",
      bgEnergy: "swell",
      badge: "none",
      card: "none",
      bonus: "none",
      cta: "none",
      copy: "byoc",
      photo: "cappuccino-09-4wlgzbqusgjpg.jpg",
    },
    domains: { ...CLUB_SHORTLIST },
  },

  /**
   * The reusable-cup communication experiment, from `../creative-strategy/`.
   *
   * It is a Campaign rather than a Mode for the same reason `byoc` is: one deck answers one
   * question. But where `byoc` asks "does the cup discount read?", this one asks a question about
   * the *opening* - which Hook makes the offer land fastest - and a question about the opening
   * cannot be answered by a deck that also moves the composition, the words and the gesture.
   *
   * So everything except the Hook is pinned, including the Direction. The Direction is pinned
   * because a Direction is a taste decision made before the axes are dealt (see
   * `docs/directions.md`), and because the brief fixes it: `cup-causes-reward` is directed
   * `teal-service`. The Composition is pinned because the Hook hands off *to* it, and the settled
   * frame is a control, not a variable. The Motion family is pinned because the Hook owns the
   * opening and the family owns the rest of the loop.
   *
   * The photo is the brand's own latte glass. It is the lab's nearest asset to the brief's
   * `reusable-cup` hero: a vessel a customer holds, on the brand's ground, with an alpha asset. The
   * brief's asset grammar asks for a reusable cup with a visible rim and handle, and the lab has no
   * such photograph - that gap is recorded in `docs/communication-experiments.md` rather than
   * papered over by re-labelling a takeaway cup as a reusable one.
   */
  "reusable-cup": {
    label: "Reusable cup",
    brief: "reusable-cup-10",
    /**
     * The Message frame this campaign renders. It is named here rather than inferred from the
     * copy key so the preflight can check the rendered lockup against the authored frame instead
     * of against itself - a check that reads the same table twice proves nothing.
     */
    frame: "bring-save",
    pinned: {
      direction: "teal-service",
      paletteName: "tealService",
      layout: "circleMask",
      type: "displayField",
      product: "circleMask",
      decor: "none",
      bg: "duoSlide",
      bgEnergy: "flat",
      badge: "none",
      card: "none",
      bonus: "none",
      cta: "none",
      copy: "reusable-cup",
      photo: "ko-latte.png",
      motion: "slamLeft",
      roleMotion: "hierarchy",
    },
    /**
     * One value per Hook hypothesis that can actually be rendered. `HOOK_IDS` is the strategy
     * layer's own list, so a hypothesis the lab cannot compile is not dealt - and a Hook that is
     * added to `strategy.mjs` is dealt without touching this file.
     */
    domains: { [HOOK_AXIS]: HOOK_IDS },
  },

  /**
   * The own-cup field: a wall of paper takeaway cups rolls past, one cup in the grid is a reusable
   * one, the roll slows as it resolves, and the offer comes out of its side.
   *
   * A Campaign rather than a fourth Hook, and a Mode rather than a value of `bg`, because it is a
   * *scene*: it replaces the ground, the hero and the reading order at once, and a deck that varied
   * it against the general composition axes would be comparing a scene to a poster. It is also the
   * asset the Hook deck had to record as missing - `reusable-cup` pins the brand's latte glass
   * because the lab had no photograph of a reusable cup, and it says so in
   * `docs/communication-experiments.md`. The operator has now supplied one.
   *
   * Everything except the roll is held. The content is one sentence and one object, so the only
   * thing a viewer can be reacting to is the field's motion. `bg` and `bgEnergy` are held even
   * though the cup field paints over the sheets: a held vector that named no background at all
   * would describe a Banner that does not exist, and the sheets are still built and still behind
   * the field.
   */
  owncup: {
    label: "Own cup field",
    pinned: {
      paletteName: "cream",
      layout: "productLeft",
      type: "priceLockup",
      product: "cutoutFloat",
      decor: "none",
      bg: "duoSlide",
      bgEnergy: "flat",
      badge: "none",
      card: "none",
      bonus: "none",
      cta: "none",
      motion: "slamLeft",
      roleMotion: "hierarchy",
      copy: "owncup",
      // The operator's own cutout of the reusable cup. It replaced the matted one: the model read
      // the steel base as background and returned the lower third of the cup as a window onto the
      // paper cup behind it, and no threshold fixes a mask that was never there. The file is used
      // as both the photo and the alpha asset - there is no source photograph in the tree, only
      // the finished cut - and it is fully opaque inside its silhouette, which is what the field
      // needs of the one object in it that is not a paper cup.
      photo: "cut/own-cup-no-bg.png",
    },
    /**
     * One value per roll direction the brief leaves open. It is a shortlist of the four readings
     * the idea has, not a domain: horizontal, vertical, diagonal, and the control where the field
     * does not move at all.
     */
    domains: { [ROLL_AXIS]: ROLL_IDS },
  },

  /**
   * The Expression Kit's campaign: the Membership lockup used as a stress test for the Direction
   * families. It is a Campaign rather than a general Mode because the content is fixed - one offer,
   * one photo pool per Direction - so the only thing a viewer can react to is the design world.
   *
   * The lockup is the Membership one on purpose. It forces the system to solve hierarchy, price
   * prominence, secondary information, CTA, a card object and a bonus at once, which is the hardest
   * case a Direction can be asked to hold. The Directions themselves know nothing about Membership:
   * they are declared in `DIRECTIONS` above and are as usable for a future promotion as for this
   * one, which is the whole point of putting them above the axes instead of inside this campaign.
   */
  expression: {
    label: "Expression kit",
    /**
     * Held for every Banner of the deck. The background is `duoSlide` on a palette whose three
     * slide tones are near-neighbours, so the Direction's field reads as ONE ground; the motion is
     * held because this batch judges the still. `bgEnergy: flat` is the control - the sheets are
     * frozen at t=0 anyway, and the axis exists only so the deck's held vector is honest.
     */
    pinned: {
      bg: "duoSlide",
      bgEnergy: "flat",
      motion: "slamLeft",
      roleMotion: "uniform",
      copy: "membership",
      photo: "cheeseburger-01-nhd6bs5qcgcjpg.jpg",
    },
    /**
     * The union of the Direction families' allowed values. `generate` does not deal this table: it
     * deals each Direction's own (`directionDomains`). The union is here because a Deck's Experiment
     * stamp has to cover everything the deck could have dealt - change one Direction's allowed
     * values and the deck resamples, so its stamp must move.
     */
    domains: directionUnionDomains(),
  },
};

/**
 * A Mode is the question a deck asks, expressed as the axes it is allowed to vary. Every axis it
 * does not vary is pinned to REFERENCE, so Banners within a Mode vary only the axes belonging to
 * the subsystem under study, and every axis outside it stays fixed.
 *
 * That is the whole point. The scene deck varies 13 axes at once, and a preference expressed in it
 * cannot be attributed to any one of them. Note that a Mode may vary several axes at once -
 * Composition varies seven - so this is not a one-variable A/B test. It is the design problem cut
 * into subsystems, each judged with the others held still.
 *
 * A Scene has two independent timelines, and a Mode says which of them to build:
 *
 *   energy       the background's travel. `bgEnergy` is a curve on `--energy`, so a Mode that
 *                does not build this cannot show the difference between swell and flat.
 *   choreography the panel and the cast: Enter, Idle, Exit.
 *   background   "frozen" stops the sheets where they are; "live" lets them slide.
 */
export const MODES = {
  deliclub: {
    letter: "d",
    label: "Deli Club",
    question: "Does this Deli Club ad work, and does it work in motion?",
    campaign: "deliclub",
    // A focused deck, not a sample - see build.mjs. The sampler drops exact duplicate vectors,
    // so a deck of this size lands just under the requested count rather than on it.
    count: 60,
    // `copy` is here so the deck sets both plans. The two blocks differ in the numbers and in
    // nothing else, so a preference between them is a preference about the offer, not about the
    // setting - which is exactly what the club needs to know before it prints one of them.
    varies: ["paletteName", "layout", "type", "decor", "product", "motion", "roleMotion", "copy"],
    // The one campaign deck that moves. Membership asks whether a still composition works;
    // this asks whether the same poster still works once it is animated, so the choreography
    // is part of the deck rather than a Mode of its own.
    energy: true,
    choreography: true,
    background: "live",
  },
  byoc: {
    letter: "u",
    label: "Bring your own cup",
    question: "Does the cup discount read, and does it read in motion?",
    campaign: "byoc",
    count: 60, // a focused deck, not a sample - see build.mjs
    // The same seven axes the plan deck varies. The content is one sentence and one cup, so the
    // deck is a question about the setting and the gesture, and about nothing else.
    varies: ["paletteName", "layout", "type", "decor", "product", "motion", "roleMotion"],
    energy: true,
    choreography: true,
    background: "live",
  },
  membership: {
    letter: "k",
    label: "Membership",
    question: "Does this membership ad work as a still?",
    campaign: "membership",
    count: 60, // a focused deck, not a sample - see build.mjs
    varies: ["paletteName", "layout", "type", "card", "bonus", "cta", "decor", "product"],
    energy: false,
    choreography: false,
    background: "frozen",
  },

  /**
   * The Hook deck: the reusable-cup campaign's communication experiment.
   *
   * It is a Mode, and it is the first Mode whose varied axis is neither an `AXES` member nor
   * `direction`. That is not a contradiction: a Mode is still "the question a deck asks, expressed
   * as the axes it varies", and this deck asks exactly one - which opening wins attention and hands
   * off to the same settled frame fastest. What is new is that the answer is a *communication*
   * hypothesis rather than a visual subsystem, and that the thing being judged is a timeline, not a
   * still.
   *
   * Everything else is held, which is why `count` is 4 and not 60. One candidate per hypothesis is
   * the whole deck: the four Hooks differ in their opening beat only, so a second Banner per Hook
   * would be the same candidate again, and re-running it would inflate n without adding evidence.
   *
   * `background: "frozen"` with `choreography: true` is a combination no earlier Mode used: the
   * sheets are still, so the Hook plays against a controlled frame, but the panel and the cast do
   * move. `energy` is off because a live background would make the Hook's own timing
   * unattributable - the thing a viewer reacted to might have been the slides, not the opening.
   */
  hooks: {
    letter: "h",
    label: "Hooks",
    question: "Which opening makes the cup discount land fastest?",
    campaign: "reusable-cup",
    count: 4, // one candidate per renderable Hook hypothesis - see build.mjs
    varies: [HOOK_AXIS],
    energy: false,
    choreography: true,
    background: "frozen",
  },

  /**
   * The own-cup field: which way the wall of paper cups rolls, and whether it should roll at all.
   *
   * One candidate per direction the brief leaves open, which is what makes `count` 4 and not 60.
   * The scene is fixed - the same wall, the same reusable cup in the same cell, the same words out
   * of the same side - so a second Banner per direction would be the same candidate again, and
   * running it would inflate n without adding evidence.
   *
   * `energy` is off and `background` is frozen for the Hook deck's reason: the field's own
   * deceleration is the thing under test, and a live background would put a second, unattributable
   * motion on the same canvas. The sheets are still built and still behind the field; they are
   * simply held, so nothing about the field's timing can be blamed on them.
   */
  owncup: {
    letter: "o",
    label: "Own cup field",
    question: "Which way should the cup field roll?",
    campaign: "owncup",
    count: 4, // one candidate per roll direction - see build.mjs
    varies: [ROLL_AXIS],
    energy: false,
    choreography: true,
    background: "frozen",
  },
  composition: {
    letter: "c",
    label: "Composition",
    question: "Does this design work as a still?",
    varies: ["paletteName", "layout", "type", "badge", "cta", "product", "decor"],
    energy: false,
    choreography: false,
    background: "frozen",
  },

  /**
   * The Direction deck. It is the Expression Kit's experiment: rather than varying the axes
   * independently, it varies a Direction first and then samples only inside that Direction's
   * allowed values (`DIRECTIONS` above). One deck, 6-10 Banners per Direction, all of them stills,
   * so the question is art-direction selection and not "which axis value is best".
   *
   * The Mode varies `direction` plus the ten axes a Direction constrains. `photo` is among them:
   * an image role is part of a Direction, so each family carries the two crops that belong to its
   * world rather than one photo shared by six worlds.
   */
  directions: {
    letter: "x",
    label: "Directions",
    question: "Which visual direction should the Membership ad belong to?",
    campaign: "expression",
    count: 48, // a focused deck: 6 Directions x 8 Banners
    // `badge` is absent on purpose. The Membership copy block carries no badge string, so
    // `renderBanner` never builds the element and the axis has nothing to vary - a dead axis in a
    // deck whose whole point is that every field is a decision. The punch card is this campaign's
    // one object; the bonus is a line of the lockup, which is what the campaign decided.
    varies: ["direction", "paletteName", "layout", "type", "product", "decor", "cta", "card", "bonus", "photo"],
    energy: false,
    choreography: false,
    background: "frozen",
  },

  background: {
    letter: "g",
    label: "Background",
    question: "Does the background support the content, or compete with it?",
    varies: ["bg", "bgEnergy"],
    energy: true, // without this, all four bgEnergy values render identically
    choreography: false,
    background: "live",
  },
  motion: {
    letter: "m",
    label: "Motion",
    question: "Does the choreography read, and does it suit each Role?",
    varies: ["motion", "roleMotion"],
    energy: true, // pinned to REFERENCE, so it is constant across the deck
    choreography: true,
    background: "live",
  },
  scene: {
    letter: "s",
    label: "Scene",
    question: "Does the whole thing work together?",
    varies: null, // null = every axis, which is the deck the lab started with
    energy: true,
    choreography: true,
    background: "live",
  },
};

/** Mode names in workflow order: the campaign first, then the general design space. */
export const MODE_NAMES = Object.keys(MODES);

/** The set of axes a Mode varies. `null` in MODES means all of them. */
export const variesIn = (mode) => new Set(MODES[mode]?.varies ?? AXES);

/** The Campaign a Mode belongs to, or undefined for a general Mode. */
export const campaignOf = (mode) => CAMPAIGNS[MODES[mode]?.campaign];

/** The axis vector a Mode holds: REFERENCE, overridden by its Campaign's pinned axes. */
export const referenceFor = (mode) => ({ ...REFERENCE, ...(campaignOf(mode)?.pinned || {}) });

/** The value sets a Mode may draw from, or null for the whole design space. */
export const domainsFor = (mode) => campaignOf(mode)?.domains || null;

/**
 * The communication Brief a Mode's Campaign was built from, or null.
 *
 * A deck with a brief is a communication experiment: the gallery offers the flash test, the
 * analysis reports comprehension beside preference, and the preflight runs the communication
 * rubric. A deck without one is a design experiment, and nothing about it changes.
 */
export const briefFor = (mode) => BRIEFS[campaignOf(mode)?.brief] || null;

/**
 * What a domain value *is*, for the stamp.
 *
 * A value can be a name for content that lives in this file, or it can be its own identity. A copy
 * key and a palette name are names: `deliclub6` stays `deliclub6` while its figure goes from 49 to
 * 59, and every Banner dealt that block changes under an id that has not moved. Those two hash the
 * content they stand for.
 *
 * The rest are their own identity. A photo is named by its file, and the names carry a random
 * suffix - `cappuccino-09-4wlgzbqusgjpg.jpg` - so a different picture is a different name. A
 * layout, a type, a decor, a motion and the rest name behaviour in the stylesheet: there is no
 * table to hash, and a change to one is a commit, which is what the version in the stamp is for.
 */
const valueUnder = (axis, v) => {
  if (axis === "copy") {
    const c = COPY.find((x) => x.key === v);
    return c ? `${v}:${[c.kicker, ...c.lines, c.sub, c.bonus, c.note, c.cta, c.badge].filter(Boolean).join("/")}` : v;
  }
  if (axis === "paletteName") {
    // the union, not `PALETTES`: a Direction's ground is a name for a whole colour table, and the
    // stamp has to hash the table whether the ground came from the general list or a Direction's.
    const p = ALL_PALETTES[v];
    return p ? `${v}:${Object.values(p).flat().join(",")}` : v;
  }
  // A Direction is a *name* for a whole hypothesis - its allowed values, its ground, its posture.
  // Editing any of them changes what a Direction Banner is, so the stamp has to hash the whole
  // definition rather than the id.
  if (axis === "direction") {
    const d = DIRECTIONS[v];
    return d ? `${v}:${JSON.stringify(d)}` : v;
  }
  // A Hook is a name for a whole hypothesis too, and a more literal one: its job, its beats and
  // the plan that compiles them into a timeline. The plan is what a viewer actually sees, so
  // re-timing one Hook is a different experiment and must move the deck's stamp.
  if (axis === HOOK_AXIS) {
    const h = HOOKS[v];
    return h ? `${v}:${JSON.stringify(h)}` : v;
  }
  // A roll direction is a name for a distance and a direction, so it hashes the whole entry: a
  // three-cell roll and a two-cell roll are different Banners under the same name, and a deck
  // whose field was re-measured is a different experiment.
  if (axis === ROLL_AXIS) {
    const r = CUP_ROLLS[v];
    return r ? `${v}:${JSON.stringify(r)}` : v;
  }
  return v;
};

/**
 * The stamp of the exact context a deck was built against: the Mode, the generation of the
 * Reference Scene, the value of every axis the Mode holds, and the value set of every axis it
 * deals from.
 *
 * It exists because Votes outlive Decks. Re-pointing REFERENCE is a designed part of the
 * workflow - the Reference Scene is meant to be replaced by the winner of Composition - and the
 * moment it changes, a Vote cast against the old one is describing a different Banner: the same
 * axis vector now sits on a different pinned background. Nothing about the Vote's own fields
 * would show that. The stamp travels on the Banner into the Vote, so `analyze.mjs` can refuse to
 * join a Vote to a Deck it was not cast against instead of silently reinterpreting it.
 *
 * A domain change is the same failure by another route. The deck is dealt round-robin from the
 * domain, so shortening one - dropping a losing layout, adding a second offer - reshuffles every
 * axis after it and `d1-b0001` becomes a different Banner under the same id.
 *
 * A pure function of (mode, vector, version, domains) rather than of the module's own state,
 * because `promote.mjs` has to know the stamp a vector is *about* to have, before it writes it.
 */
export const stampFor = (mode, ref, version = REFERENCE_VERSION, domains = null) => {
  const varies = variesIn(mode);
  // A Direction deck carries one field the general space does not, and its stamp has to cover it or
  // editing a Direction would silently reinterpret the deck's Votes. The Hook deck is the same
  // argument one layer up: a Hook is a communication hypothesis, so editing its job, its beats or
  // its timing changes what its Banners are. Every other deck's stamp is byte-for-byte what it was
  // before either existed: `axes` is `AXES` for them, every extra field is neither varied nor held,
  // and every Reference value is defined, so `?? "none"` never fires.
  const axes = [...AXES, ...EXTRA_AXES.filter((a) => varies.has(a) || ref[a] != null)];
  const held = axes.map((a) => `${a}=${ref[a] ?? "none"}`).join("|");
  const dealt = axes.filter((a) => varies.has(a))
    .map((a) => `${a}~${(domains?.[a] || []).map((v) => valueUnder(a, v)).join(",")}`)
    .join("|");
  const s = `${mode}|v${version}|${held}|${dealt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${mode}@v${version}.${(h >>> 0).toString(36).padStart(7, "0").slice(0, 7)}`;
};

/**
 * The Deck a Banner belongs to: the Mode plus the context it was built against.
 *
 * `domains` is required for a Mode that has no Campaign, because its domains include the photo
 * pool and only the caller has loaded that. A silent default here would stamp a deck differently
 * from the way it was built, which is worse than the failure the stamp exists to catch.
 */
export const experimentOf = (mode, domains = domainsFor(mode)) => {
  if (!domains) throw new Error(`experimentOf(${mode}) needs the domain table: ${mode} varies the photo pool`);
  return stampFor(mode, referenceFor(mode), REFERENCE_VERSION, domains);
};
