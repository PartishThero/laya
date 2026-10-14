// engines/dnd/hitTest.js
// Zone registry and proximity hit detection for drag & drop

class HitTester {
  constructor() {
    this.zones = new Map(); // id -> { id, type, payload, getBounds: () => DOMRect }
  }

  registerZone(id, zone) {
    this.zones.set(id, zone);
    return () => this.zones.delete(id);
  }

  testPoint(screenX, screenY, proximityRadius = 60) {
    let directHit = null;
    let closestZone = null;
    let minDistance = Infinity;

    for (const [id, zone] of this.zones.entries()) {
      const rect = zone.getBounds ? zone.getBounds() : null;
      if (!rect) continue;

      // Inside zone rect
      if (
        screenX >= rect.left &&
        screenX <= rect.right &&
        screenY >= rect.top &&
        screenY <= rect.bottom
      ) {
        directHit = { id, zone, rect, distance: 0 };
        break;
      }

      // Calculate distance to rect
      const dx = Math.max(rect.left - screenX, 0, screenX - rect.right);
      const dy = Math.max(rect.top - screenY, 0, screenY - rect.bottom);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < proximityRadius && dist < minDistance) {
        minDistance = dist;
        closestZone = { id, zone, rect, distance: dist };
      }
    }

    return {
      hit: directHit,
      near: directHit || closestZone
    };
  }
}

export const hitTester = new HitTester();
