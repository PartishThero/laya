// engines/roaming/roamingZone.js
// Random off-screen roaming drop zone engine with findability bearing indicator

import { CHUNK_WIDTH, CHUNK_HEIGHT } from '../canvas/chunks.js';
import { createPRNG } from '@/lib/math.js';

export class RoamingZoneEngine {
  constructor(seed = 'laya_roam') {
    this.seed = seed;
    this.rng = createPRNG(seed);
    this.position = { worldX: 1800, worldY: 1200 };
    this.targetPlaylist = null;
    this.spawnTime = Date.now();
    this.hintDelayMs = 60000; // 60 seconds safeguard
  }

  relocate(currentViewport) {
    // Pick 1 to 3 chunks away in a random direction
    const directions = [
      { cx: 2, cy: 1 },
      { cx: -2, cy: 1 },
      { cx: 1, cy: -2 },
      { cx: -2, cy: -2 },
      { cx: 3, cy: 0 },
      { cx: -3, cy: 1 }
    ];
    const pick = directions[Math.floor(this.rng() * directions.length)];
    
    // Viewport current chunk center
    const curCx = Math.floor((-currentViewport.x / currentViewport.scale) / CHUNK_WIDTH);
    const curCy = Math.floor((-currentViewport.y / currentViewport.scale) / CHUNK_HEIGHT);

    const targetCx = curCx + pick.cx;
    const targetCy = curCy + pick.cy;

    const offsetX = Math.floor(this.rng() * (CHUNK_WIDTH - 300)) + 150;
    const offsetY = Math.floor(this.rng() * (CHUNK_HEIGHT - 300)) + 150;

    this.position = {
      worldX: targetCx * CHUNK_WIDTH + offsetX,
      worldY: targetCy * CHUNK_HEIGHT + offsetY
    };
    this.spawnTime = Date.now();
    return this.position;
  }

  shouldShowHint() {
    return Date.now() - this.spawnTime >= this.hintDelayMs;
  }

  getBearingAngle(viewport, screenWidth, screenHeight) {
    // Screen coords of roaming zone
    const screenX = this.position.worldX * viewport.scale + viewport.x;
    const screenY = this.position.worldY * viewport.scale + viewport.y;

    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    const dx = screenX - centerX;
    const dy = screenY - centerY;

    return Math.atan2(dy, dx); // radians
  }
}

export const roamingZoneEngine = new RoamingZoneEngine();
