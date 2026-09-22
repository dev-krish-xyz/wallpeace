// Detent "tick" for the carousel, synthesized with Web Audio (no audio file to download):
// a short band-passed noise click over a soft low thump, like a rotary knob.

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let output: GainNode | null = null;
let lastTick = 0;

const VOLUME = 0.196;
const MIN_GAP_MS = 28; // fast spins don't turn into a buzz

function setup() {
  if (ctx || typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx = new Ctor();
  output = ctx.createGain();
  output.gain.value = VOLUME;
  output.connect(ctx.destination);
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

/**
 * Browsers only allow audio after a click/tap/keypress (scrolling doesn't count), so the audio
 * context is created and resumed on the first such gesture anywhere on the page. Listens in the
 * capture phase so controls that stop propagation (the carousel arrows) still unlock it.
 */
export function armTicks() {
  if (typeof window === "undefined") return () => {};
  const unlock = () => {
    setup();
    void ctx?.resume();
  };
  const events = ["pointerdown", "click", "keydown", "touchend"] as const;
  const options = { capture: true, passive: true };
  events.forEach((e) => window.addEventListener(e, unlock, options));
  return () => events.forEach((e) => window.removeEventListener(e, unlock, options));
}

/** Once the user has clicked/tapped/typed anywhere on the page, audio may start or resume at will. */
const hasInteracted = () =>
  typeof navigator !== "undefined" && (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive === true;

export function tick() {
  // Start lazily after any interaction, even if armTicks' listener missed it.
  if (!ctx && hasInteracted()) setup();
  if (!ctx || !noise || !output) return;
  const now = performance.now();
  if (now - lastTick < MIN_GAP_MS) return;
  lastTick = now;
  // Browsers suspend idle or background audio; resume (allowed after an interaction) and play.
  if (ctx.state !== "running") {
    void ctx.resume().then(play, () => {});
    return;
  }
  play();
}

function play() {
  if (!ctx || !noise || !output || ctx.state !== "running") return;
  const t = ctx.currentTime;
  // Click: 3.2 kHz band of noise, ~20 ms decay.
  const click = ctx.createBufferSource();
  click.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 3200;
  band.Q.value = 1.4;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.0001, t);
  clickGain.gain.exponentialRampToValueAtTime(0.9, t + 0.001);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
  click.connect(band).connect(clickGain).connect(output);
  click.start(t);
  click.stop(t + 0.03);

  // Body: a soft 170 Hz thump underneath.
  const thump = ctx.createOscillator();
  thump.frequency.setValueAtTime(170, t);
  thump.frequency.exponentialRampToValueAtTime(90, t + 0.03);
  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.0001, t);
  thumpGain.gain.exponentialRampToValueAtTime(0.35, t + 0.002);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  thump.connect(thumpGain).connect(output);
  thump.start(t);
  thump.stop(t + 0.04);
}
