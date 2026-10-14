// lib/dnd/dragController.js
// Pointer-based Drag state machine with integrated edge auto-pan loop
import { calculateEdgeAutoPan } from '@/lib/dnd/autoPan.js';

export const DRAG_STATES = {
  IDLE: 'idle',
  LIFTED: 'lifted',
  OVER_TARGET: 'over-target',
  DROPPED_PENDING: 'dropped-pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

export class DragController {
  constructor() {
    this.listeners = new Set();
    this.autoPanRaf = null;
    this.onPanCanvas = null;

    this.state = {
      status: DRAG_STATES.IDLE,
      card: null,
      origin: null, // { screenX, screenY, worldX, worldY, tilt }
      current: null, // { screenX, screenY }
      target: null, // zone info if over target
      isNearTarget: false,
      error: null
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('DragController listener error:', e);
      }
    }
  }

  startLift(card, origin, onPanCanvas = null) {
    this.stopAutoPan();
    this.onPanCanvas = onPanCanvas;

    this.state = {
      status: DRAG_STATES.LIFTED,
      card,
      origin,
      current: { screenX: origin.screenX, screenY: origin.screenY },
      target: null,
      isNearTarget: false,
      error: null
    };
    this._notify();

    if (this.onPanCanvas) {
      this._startAutoPan();
    }
  }

  _startAutoPan() {
    this.stopAutoPan();

    const loop = () => {
      if (
        this.state.status === DRAG_STATES.IDLE ||
        this.state.status === DRAG_STATES.CONFIRMED ||
        this.state.status === DRAG_STATES.FAILED
      ) {
        this.stopAutoPan();
        return;
      }

      const cur = this.state.current;
      if (cur && this.onPanCanvas && typeof window !== 'undefined') {
        const { panX, panY } = calculateEdgeAutoPan(
          cur.screenX,
          cur.screenY,
          window.innerWidth,
          window.innerHeight
        );
        if (panX !== 0 || panY !== 0) {
          this.onPanCanvas(panX, panY);
        }
      }

      this.autoPanRaf = requestAnimationFrame(loop);
    };

    this.autoPanRaf = requestAnimationFrame(loop);
  }

  stopAutoPan() {
    if (this.autoPanRaf) {
      cancelAnimationFrame(this.autoPanRaf);
      this.autoPanRaf = null;
    }
    this.onPanCanvas = null;
  }

  updatePosition(screenX, screenY, hitResult = null) {
    if (this.state.status === DRAG_STATES.IDLE) return;

    const hit = hitResult?.hit || null;
    const isNear = Boolean(hitResult?.near);

    this.state = {
      ...this.state,
      status: hit ? DRAG_STATES.OVER_TARGET : DRAG_STATES.LIFTED,
      current: { screenX, screenY },
      target: hit?.zone || null,
      isNearTarget: isNear
    };
    this._notify();
  }

  dropPending(target) {
    this.stopAutoPan();
    this.state = {
      ...this.state,
      status: DRAG_STATES.DROPPED_PENDING,
      target
    };
    this._notify();
  }

  confirm() {
    this.stopAutoPan();
    this.state = {
      ...this.state,
      status: DRAG_STATES.CONFIRMED
    };
    this._notify();

    setTimeout(() => {
      this.reset();
    }, 400);
  }

  fail(errorMsg = 'Action failed') {
    this.stopAutoPan();
    this.state = {
      ...this.state,
      status: DRAG_STATES.FAILED,
      error: errorMsg
    };
    this._notify();

    setTimeout(() => {
      this.reset();
    }, 600);
  }

  cancel() {
    this.stopAutoPan();
    this.reset();
  }

  reset() {
    this.stopAutoPan();
    this.state = {
      status: DRAG_STATES.IDLE,
      card: null,
      origin: null,
      current: null,
      target: null,
      isNearTarget: false,
      error: null
    };
    this._notify();
  }
}

export const dragController = new DragController();
