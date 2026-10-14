// engines/canvas/viewport.js
// 2D Canvas viewport coordinate conversions and math (strictly 2D: translate & scale only)

export const MIN_ZOOM = 0.4;
export const MAX_ZOOM = 1.6;

export function screenToWorld(screenX, screenY, viewport) {
  return {
    x: (screenX - viewport.x) / viewport.scale,
    y: (screenY - viewport.y) / viewport.scale
  };
}

export function worldToScreen(worldX, worldY, viewport) {
  return {
    x: worldX * viewport.scale + viewport.x,
    y: worldY * viewport.scale + viewport.y
  };
}

export function zoomAtPoint(viewport, factor, centerScreenX, centerScreenY) {
  const nextScale = Math.min(Math.max(viewport.scale * factor, MIN_ZOOM), MAX_ZOOM);
  if (nextScale === viewport.scale) return viewport;

  // Keep screen point fixed in world space during zoom
  const worldPoint = screenToWorld(centerScreenX, centerScreenY, viewport);
  const nextX = centerScreenX - worldPoint.x * nextScale;
  const nextY = centerScreenY - worldPoint.y * nextScale;

  return {
    x: nextX,
    y: nextY,
    scale: nextScale
  };
}

export function getVisibleWorldBounds(viewport, screenWidth, screenHeight, margin = 400) {
  const topLeft = screenToWorld(-margin, -margin, viewport);
  const bottomRight = screenToWorld(screenWidth + margin, screenHeight + margin, viewport);

  return {
    minX: topLeft.x,
    minY: topLeft.y,
    maxX: bottomRight.x,
    maxY: bottomRight.y
  };
}
