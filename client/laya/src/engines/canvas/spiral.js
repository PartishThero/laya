// engines/canvas/spiral.js
// Maps 2D chunk coordinates (cx, cy) to a 1D spiral index (page number)
// (0,0) -> 1, (1,0) -> 2, (1,1) -> 3, (0,1) -> 4, etc.

export function chunkCoordToSpiralIndex(cx, cy) {
  if (cx === 0 && cy === 0) return 1;

  const d = Math.max(Math.abs(cx), Math.abs(cy));
  const base = (2 * d - 1) * (2 * d - 1);

  let offset = 0;
  if (cx === d && cy > -d) {
    offset = d + cy;
  } else if (cy === d && cx < d) {
    offset = 3 * d - cx;
  } else if (cx === -d && cy < d) {
    offset = 5 * d - cy;
  } else {
    offset = 7 * d + cx;
  }

  return base + offset;
}
