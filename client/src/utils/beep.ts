// Shared Web Audio "done" sound — used by any timer that needs to signal completion (the
// between-sets rest timer, the duration countdown-to-target). One implementation so the two
// don't drift into slightly different sounds over time.
//
// A two-note bell/chime (descending "ding-dong") rather than a flat beep. The "bell" quality
// comes from additive synthesis: each note is a sine fundamental plus two quieter harmonic
// overtones (2x and a very slightly detuned ~3x, which is what gives a real bell its faint
// "shimmer"), each with a fast attack and a slower exponential decay — a square wave with a
// hard on/off edge is what makes something sound like an arcade beep, so sine + decay avoids
// that entirely.
export function playBeep(ctx: AudioContext | null) {
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    playChime(ctx, 880, now, 0.55); // A5
    playChime(ctx, 659.25, now + 0.16, 0.65); // E5 — lower, slightly longer tail
  } catch {
    // Web Audio unsupported — timer still works visually
  }
}

function playChime(ctx: AudioContext, freq: number, start: number, duration: number) {
  const partials = [
    { mult: 1, gain: 0.35 },
    { mult: 2, gain: 0.12 },
    { mult: 3.01, gain: 0.06 }, // slightly detuned — the "shimmer" a pure 3x overtone wouldn't have
  ];
  for (const { mult, gain: peak } of partials) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
}
