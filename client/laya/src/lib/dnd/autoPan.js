// engines/dnd/autoPan.js
// Edge auto-pan while dragging a card near viewport edges

export function calculateEdgeAutoPan(screenX, screenY, screenWidth, screenHeight, edgeThreshold = 80, maxSpeed = 16) {
  let panX = 0;
  let panY = 0;

  // Left edge
  if (screenX < edgeThreshold) {
    const factor = (edgeThreshold - screenX) / edgeThreshold;
    panX = maxSpeed * factor;
  }
  // Right edge
  else if (screenX > screenWidth - edgeThreshold) {
    const factor = (screenX - (screenWidth - edgeThreshold)) / edgeThreshold;
    panX = -maxSpeed * factor;
  }

  // Top edge
  if (screenY < edgeThreshold) {
    const factor = (edgeThreshold - screenY) / edgeThreshold;
    panY = maxSpeed * factor;
  }
  // Bottom edge
  else if (screenY > screenHeight - edgeThreshold) {
    const factor = (screenY - (screenHeight - edgeThreshold)) / edgeThreshold;
    panY = -maxSpeed * factor;
  }

  return { panX, panY };
}
