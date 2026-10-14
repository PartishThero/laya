// engines/dnd/dragController.js
// Pointer-based Drag state machine: idle -> lifted -> over-target -> dropped(pending) -> confirmed | failed

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

  startLift(card, origin) {
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
    this.state = {
      ...this.state,
      status: DRAG_STATES.DROPPED_PENDING,
      target
    };
    this._notify();
  }

  confirm() {
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
    this.reset();
  }

  reset() {
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
