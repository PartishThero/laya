// utils/seededRandom.js
// Mulberry32 PRNG for deterministic, stable canvas card placement & angles

export function createPRNG(seed) {
  let s = 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    }
  } else if (typeof seed === 'number') {
    s = seed >>> 0;
  } else {
    s = 1337;
  }

  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandomRange(rng, min, max) {
  return min + rng() * (max - min);
}
