// engines/canvas/momentum.js
// Physics-inspired velocity tracking and soft deceleration momentum for panning

export class PanMomentumTracker {
  constructor() {
    this.history = [];
    this.maxHistory = 5;
  }

  addPoint(x, y) {
    const now = performance.now();
    this.history.push({ x, y, time: now });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getVelocity() {
    if (this.history.length < 2) return { vx: 0, vy: 0 };
    const latest = this.history[this.history.length - 1];
    const first = this.history[0];
    const dt = latest.time - first.time;
    if (dt === 0 || dt > 150) return { vx: 0, vy: 0 };

    return {
      vx: (latest.x - first.x) / dt,
      vy: (latest.y - first.y) / dt
    };
  }

  reset() {
    this.history = [];
  }
}
