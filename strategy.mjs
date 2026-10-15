/**
 * strategy.mjs — the communication layer, as the lab reads it.
 *
 * `../creative-strategy/` answers "what idea will make this message understood?"; this file is the
 * part of that answer a renderer and a sampler can act on. It is a transcription, the same way
 * `DIRECTIONS` in `space.mjs` is a transcription of `brand/brand-expression-kit/04-direction-families.yaml`
 * and `PALETTES` is a transcription of `brand/tokens.css`: the authored files are prose and YAML
 * for a person, and the lab needs tables.
 *
 * Sources, one per table:
 *
 *   BRIEFS               ../creative-strategy/examples/reusable-cup-10.yaml  (`campaign`)
 *   MESSAGE_FRAMES       ../creative-strategy/examples/reusable-cup-10.yaml  (`messageFrames`)
 *   CREATIVE_HYPOTHESES  ../creative-strategy/examples/reusable-cup-10.yaml  (`creativeHypotheses`)
 *   HOOK_HYPOTHESES      ../creative-strategy/examples/reusable-cup-10.yaml  (`hookHypotheses`)
 *                        plus the job/risk text in ../creative-strategy/08-hook-library.yaml
 *   SEMANTIC_ACTIONS     ../creative-strategy/09-semantic-actions.yaml
 *   STORY                ../creative-strategy/examples/reusable-cup-10.yaml  (`recommendedFirstScene.beats`)
 *
 * `gtest.mjs` validates `BRIEFS` and `CREATIVE_HYPOTHESES` against the layer's own JSON Schemas
 * (`../creative-strategy/schemas/`, read from disk rather than copied), and checks the references
 * the schemas can only type as strings: that a hypothesis's `campaignId`, `messageFrameId` and
 * `hookHypothesisId` resolve, that a Hook's verbs are semantic actions, and that a Campaign's
 * `brief` and `frame` exist. A transcription that drifts structurally fails a test rather than
 * shipping.
 *
 * A `plan` is the one field here that is the lab's own. It is how a Hook hypothesis compiles into
 * a Timeline, and it is deliberately declarative: a slot names when a thing happens and how it
 * arrives, and `lab.js` is the only thing that reads it. A hypothesis that cannot be compiled is
 * not a candidate, and it says so with `blocked` instead of rendering as a different hypothesis
 * wearing its name.
 *
 * This module has no filesystem and no DOM, so the browser imports the same constants the sampler
 * used. If the two ever disagreed, a Banner would render as something other than what was sampled.
 */

/**
 * Which axis-like field a Hook hypothesis occupies. It is not in `AXES`, exactly like `direction`:
 * adding it there would move the experiment stamp of every deck the lab has already built, and a
 * Hook belongs to one campaign's communication experiment rather than to the general design space.
 */
export const HOOK_AXIS = "hook";

// --------------------------------------------------------------------------- //
// campaign brief
// --------------------------------------------------------------------------- //

export const BRIEFS = {
  "reusable-cup-10": {
    campaignId: "reusable-cup-10",
    objective: "Increase beverage purchases where customers bring their own reusable cup.",
    desiredBehavior: "Bring and use their own cup.",
    // The offer exactly as the operator supplied it. The scope is UNSPECIFIED, so no Banner may
    // state which drinks it applies to, and the copy block carries the brief's own sentence.
    verifiedOffer: { reward: "10% discount", scope: "UNSPECIFIED" },
    audience: "Ko Kitchen customers at or approaching the point of sale.",
    context: { medium: "1920x1080 digital screen", audio: false, attention: "passing / waiting" },
    friction: ["the cup has to be remembered before the visit", "the discount is invisible until it is claimed"],
    communicationPriority: ["10% reward", "bring own cup", "cup causes reward"],
    oneSecondTakeaway: "There is a 10% benefit connected to a reusable cup.",
    threeSecondTakeaway: "Bring your own cup and receive 10% off.",
    recallCue: "MY CUP = 10% OFF",
    /**
     * The flash-comprehension capture, from `../creative-strategy/07-communication-rubric.json`
     * (`recommended_capture`). The two answers are recorded separately from the preference verdict
     * and are never averaged with it: an ad that is liked but not understood has not worked.
     */
    comprehension: {
      seconds: 1.5,
      benefit: { correct: "10% off", options: ["10% off", "a free drink", "€10 off", "loyalty points", "not sure"] },
      action: { correct: "bring your own cup", options: ["bring your own cup", "order ahead", "buy 10 drinks", "join the membership", "not sure"] },
    },
  },
};

// --------------------------------------------------------------------------- //
// message frames
// --------------------------------------------------------------------------- //

/**
 * One verified offer, four verbal framings. The lab renders `bring-save` - the Hook experiment
 * holds the Message frame still, so the opening is the only thing under test - and the other three
 * are the input of the Message experiment that follows it.
 */
export const MESSAGE_FRAMES = {
  "bring-save": {
    id: "bring-save",
    headline: "BRING YOUR CUP.",
    reward: "SAVE 10%.",
    shape: "behavior → reward",
    note: "explicit and causal",
  },
  equation: {
    id: "equation",
    headline: "YOUR CUP = 10% OFF",
    shape: "equation",
    note: "compact and visually memorable",
  },
  "reward-first": {
    id: "reward-first",
    headline: "10% OFF",
    support: "WITH YOUR OWN CUP",
    shape: "reward → condition",
    note: "the incentive appears immediately",
  },
  "reuse-save": {
    id: "reuse-save",
    headline: "REUSE YOUR CUP.",
    reward: "SAVE 10%.",
    shape: "purpose → reward",
    note: "adds sustainability meaning, but `reuse` is more abstract than `bring`",
  },
};

// --------------------------------------------------------------------------- //
// creative hypotheses
// --------------------------------------------------------------------------- //

export const CREATIVE_HYPOTHESES = {
  "cup-causes-reward": {
    id: "cup-causes-reward",
    campaignId: "reusable-cup-10",
    proposition: "Make the discount visibly activate because the cup arrives.",
    reason: "Visible cause/effect should explain the mechanic before all copy is read.",
    messageFrameId: "bring-save",
    hookHypothesisId: "cinematic-arrival",
    directionId: "teal-service",
    assetStrategy: {
      hero: "reusable-cup",
      supporting: ["contact-shadow"],
      graphic: ["10-percent-stamp"],
    },
    communicationStory: [
      { time: [0.0, 0.9], job: "Win attention with the behavior object.", semanticAction: "arrive" },
      { time: [0.9, 1.7], job: "Name the desired action.", semanticAction: "reveal", message: "BRING YOUR CUP." },
      { time: [1.7, 2.6], job: "Reveal the reward as a consequence of the cup.", semanticAction: "stamp", message: "SAVE 10%." },
      { time: [2.6, 8.5], job: "Allow the complete proposition to be read.", semanticAction: "settle" },
      { time: [8.5, 9.8], job: "Reinforce memory without competing with the copy.", semanticAction: "react" },
      { time: [9.8, 12.0], job: "Clear while preserving the loop.", semanticAction: "clear" },
    ],
    successCriteria: [
      "At 1.5 s the viewer identifies the cup as central.",
      "By 2.5 s the viewer can state both the 10% benefit and the bring-own-cup action.",
      "Motion visibly links the cup to the reward.",
      "The settled Composition is fully readable without Motion.",
    ],
    risks: ["spectacle consumes too much time before the discount appears"],
  },
  "cup-is-coupon": {
    id: "cup-is-coupon",
    campaignId: "reusable-cup-10",
    proposition: "Treat the reusable cup itself as the discount token.",
    reason: "Merging object and reward may create the simplest memorable relationship.",
    messageFrameId: "equation",
    hookHypothesisId: "quiet-stamp",
    directionId: "teal-service",
    assetStrategy: { hero: "reusable-cup", graphic: ["10-percent-attached-label"] },
    communicationStory: [
      { time: [0.0, 0.9], job: "Present the cup quietly, as a token.", semanticAction: "arrive" },
      { time: [0.9, 1.7], job: "Name the cup as the condition.", semanticAction: "reveal" },
      { time: [1.7, 2.6], job: "Attach the reward to the object.", semanticAction: "attach", message: "YOUR CUP = 10% OFF" },
      { time: [2.6, 8.5], job: "Let the equation be read as one statement.", semanticAction: "settle" },
      { time: [9.8, 12.0], job: "Clear while preserving the loop.", semanticAction: "clear" },
    ],
    successCriteria: [
      "The cup and the discount are read as one object, not two facts.",
      "By 2.5 s the viewer can state both the benefit and the action.",
    ],
    risks: ["cleverness hurts clarity"],
  },
  "reward-first-cup-proof": {
    id: "reward-first-cup-proof",
    campaignId: "reusable-cup-10",
    proposition: "Open with an enormous 10%, then reveal the cup as the condition.",
    reason: "Reward-first hierarchy may win attention fastest.",
    messageFrameId: "reward-first",
    hookHypothesisId: "reward-scale-impact",
    directionId: "teal-service",
    assetStrategy: { hero: "10-percent-type", proof: "reusable-cup" },
    communicationStory: [
      { time: [0.0, 0.7], job: "Make the reward the first readable fact.", semanticAction: "stamp", message: "10% OFF" },
      { time: [0.7, 1.7], job: "Reveal the condition.", semanticAction: "reveal", message: "WITH YOUR OWN CUP" },
      { time: [1.7, 2.6], job: "Bind the condition to the object.", semanticAction: "attach" },
      { time: [2.6, 8.5], job: "Allow the complete proposition to be read.", semanticAction: "settle" },
      { time: [9.8, 12.0], job: "Clear while preserving the loop.", semanticAction: "clear" },
    ],
    successCriteria: [
      "The benefit is identifiable at 1.5 s.",
      "The action is identifiable by 2.5 s, not later.",
    ],
    risks: ["the condition and the action are forgotten"],
  },
  "illuminated-cup-hero": {
    id: "illuminated-cup-hero",
    campaignId: "reusable-cup-10",
    proposition: "Present the cup as a cinematic hero object under directional halo light.",
    reason: "A premium object treatment may increase attention while staying simple.",
    messageFrameId: "equation",
    hookHypothesisId: "spotlight-hero",
    directionId: "teal-service",
    assetStrategy: { hero: "reusable-cup", environment: ["teal-ground", "warm-halo"] },
    communicationStory: [
      { time: [0.0, 1.0], job: "Win attention by lighting the object rather than moving it.", semanticAction: "reveal" },
      { time: [1.0, 1.8], job: "Name the condition.", semanticAction: "reveal", message: "YOUR CUP" },
      { time: [1.8, 2.6], job: "Resolve the reward at peak reveal.", semanticAction: "attach", message: "10% OFF" },
      { time: [2.6, 8.5], job: "Hold the lit object and the statement.", semanticAction: "settle" },
      { time: [9.8, 12.0], job: "Clear while preserving the loop.", semanticAction: "clear" },
    ],
    successCriteria: [
      "The opening wins attention without any large travel.",
      "The treatment does not read as generic luxury product advertising.",
    ],
    risks: ["overly luxurious tone", "weak on bright screens"],
  },
};

// --------------------------------------------------------------------------- //
// hook hypotheses
// --------------------------------------------------------------------------- //

/**
 * A Hook is the first attention event, defined by its communication job rather than by its time.
 * Each entry carries the authored job and risk, the semantic verbs it spends, and the `plan` that
 * compiles it into a Timeline.
 *
 * The `plan` slots are:
 *
 *   hero    `.bn__media` - when the object arrives, from which edge, and at what scale
 *   reward  `.bn__fig`   - when the reward is emphasised, and how large it lands
 *   copy    the time the copy's own stagger starts from; the panel wipes just before it
 *   halo    an optional light bloom behind the object, for hypotheses that win attention with
 *           light rather than with travel
 *
 * `at` is in seconds from the loop's start. Nothing here may be reordered freely: the plan is what
 * makes the hypothesis visible, so a Hook whose plan is the same as another's is the same Hook.
 */
export const HOOK_HYPOTHESES = {
  "cinematic-arrival": {
    id: "cinematic-arrival",
    campaignId: "reusable-cup-10",
    family: "cinematic object arrival",
    job: "Make the cup impossible to ignore through depth, speed and landing.",
    opening: "The cup enters from the right with depth and travel, lands, and the reward stamps on.",
    trigger: "The landing triggers the reward.",
    targetDuration: 0.9,
    semantic: ["arrive", "stamp", "reveal"],
    risks: ["spectacle delays the offer", "generic product-ad feeling"],
    plan: {
      hero: { at: 0.10, from: "right", scale: 0.72, dur: 0.80, ease: "power3.out" },
      reward: { at: 0.86, scale: 1.35, dur: 0.40, ease: "back.out(3)" },
      copy: { at: 1.00 },
    },
  },

  "spotlight-hero": {
    id: "spotlight-hero",
    campaignId: "reusable-cup-10",
    family: "spotlight hero",
    job: "Win attention through lighting contrast rather than large travel.",
    opening: "The cup resolves from a blur as a warm halo blooms behind it.",
    trigger: "The reward appears at peak reveal.",
    targetDuration: 1.0,
    semantic: ["reveal", "attach", "settle"],
    risks: ["overly luxurious tone", "weak on bright screens"],
    plan: {
      halo: { at: 0.15, dur: 0.75, peak: 0.85, fade: 0.60 },
      hero: { at: 0.20, from: "none", scale: 1.06, blur: 14, dur: 0.80, ease: "power2.out" },
      reward: { at: 0.95, scale: 1.12, dur: 0.35, ease: "power2.out" },
      copy: { at: 1.05 },
    },
  },

  "reward-scale-impact": {
    id: "reward-scale-impact",
    campaignId: "reusable-cup-10",
    family: "reward scale impact",
    job: "Make the reward the first readable fact.",
    opening: "The reward fills the frame first and resolves to make room for the cup.",
    trigger: "The cup enters as the condition.",
    targetDuration: 0.7,
    semantic: ["stamp", "reveal", "attach"],
    risks: ["the condition and the action are forgotten"],
    plan: {
      copy: { at: 0.10 },
      reward: { at: 0.12, scale: 1.85, dur: 0.55, ease: "power4.out" },
      hero: { at: 0.90, from: "bottom", scale: 0.86, dur: 0.65, ease: "power3.out" },
    },
  },

  "quiet-stamp": {
    id: "quiet-stamp",
    campaignId: "reusable-cup-10",
    family: "quiet then impact",
    job: "Use restraint as the pattern interrupt, then one decisive event.",
    opening: "The field is quiet, the cup arrives small and still, and one hard stamp lands the reward.",
    trigger: "The stamp joins the cup and the typography.",
    targetDuration: 0.7,
    semantic: ["arrive", "stamp", "settle"],
    risks: ["too quiet to interrupt at a distance"],
    plan: {
      hero: { at: 0.45, from: "none", scale: 0.90, dur: 0.45, ease: "power2.out" },
      copy: { at: 0.80 },
      reward: { at: 0.95, scale: 1.50, dur: 0.22, ease: "back.out(4)" },
    },
  },

  /**
   * Declared and NOT dealt. The hypothesis is sound and the library lists it, but its Behavior
   * asset is a cropped hand placing the cup, and the lab has no such photograph. Rendering it with
   * the cup alone would be a different hypothesis wearing this one's name, and a Vote cast on it
   * would be evidence about neither. It is recorded here so the asset request is visible, and
   * `gtest.mjs` asserts that a blocked hypothesis is never dealt into a deck.
   */
  "action-reaction-hand": {
    id: "action-reaction-hand",
    campaignId: "reusable-cup-10",
    family: "cause then reaction",
    job: "Show the desired behavior causing a visible reward.",
    opening: "A cropped hand places the cup on the counter; contact produces a restrained pulse and the stamp.",
    trigger: "Contact produces the reward.",
    targetDuration: 1.2,
    semantic: ["arrive", "react", "stamp"],
    blocked: "no photograph of a hand placing a cup exists in the pool; the brief's Behavior asset is missing",
    plan: null,
  },
};

/** The Hook hypotheses a deck may deal: every one that can actually be compiled and rendered. */
export const HOOK_IDS = Object.keys(HOOK_HYPOTHESES).filter((id) => !HOOK_HYPOTHESES[id].blocked);

// --------------------------------------------------------------------------- //
// semantic actions
// --------------------------------------------------------------------------- //

/**
 * The verbs a beat is allowed to spend, from `../creative-strategy/09-semantic-actions.yaml`. A
 * beat that cannot name one of these is decoration, which is the thing the layer exists to remove.
 */
export const SEMANTIC_ACTIONS = {
  arrive: "Hero enters and claims attention.",
  reveal: "Hidden information becomes available.",
  attach: "One proposition visibly belongs to an object.",
  unlock: "An action visibly causes access to a benefit.",
  stamp: "A claim or reward becomes final.",
  fill: "Value or quantity accumulates.",
  count: "Communicate discrete quantity or progression.",
  compare: "Make two states visually comparable.",
  replace: "Old information becomes new information.",
  subtract: "Communicate a reduction or saving.",
  duplicate: "Communicate a free extra or increased quantity.",
  group: "Separate things become one bundle.",
  transform: "One meaningful state becomes another.",
  react: "Secondary response proves cause/effect.",
  settle: "Resolve into final readable composition.",
  clear: "Exit while preserving the recall cue and the loop.",
};
