// engines/canvas/chunks.js
// Spatial chunk partition for the infinite canvas

export const CHUNK_WIDTH = 1300;
export const CHUNK_HEIGHT = 900;

export function getChunkCoord(worldX, worldY) {
  return {
    cx: Math.floor(worldX / CHUNK_WIDTH),
    cy: Math.floor(worldY / CHUNK_HEIGHT)
  };
}

export function chunkKey(cx, cy) {
  return `${cx},${cy}`;
}

export function parseChunkKey(key) {
  const [cx, cy] = key.split(',').map(Number);
  return { cx, cy };
}

export function getVisibleChunkCoords(bounds) {
  const minCx = Math.floor(bounds.minX / CHUNK_WIDTH);
  const maxCx = Math.floor(bounds.maxX / CHUNK_WIDTH);
  const minCy = Math.floor(bounds.minY / CHUNK_HEIGHT);
  const maxCy = Math.floor(bounds.maxY / CHUNK_HEIGHT);

  const coords = [];
  for (let cy = minCy; cy <= maxCy; cy++) {
    for (let cx = minCx; cx <= maxCx; cx++) {
      coords.push({ cx, cy, key: chunkKey(cx, cy) });
    }
  }

  return coords;
}
