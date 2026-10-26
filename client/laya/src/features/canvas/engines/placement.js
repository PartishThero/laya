// engines/canvas/placement.js
import { createPRNG, seededRandomRange } from '@/lib/math.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from '@/features/canvas/engines/chunks.js';
import { cardSize } from '@/models/card.model.js';

export function placeCardsInChunk(cards, cx, cy, sessionSeed = 'laya') {
  if (!cards || cards.length === 0) return [];

  const rng = createPRNG(`${sessionSeed}_chunk_${cx}_${cy}`);
  
  // Organic, free-plane spatial scattering across the continuous canvas
  const count = cards.length;
  const paddingX = 70;
  const paddingY = 70;
  const usableW = CHUNK_WIDTH - paddingX * 2;
  const usableH = CHUNK_HEIGHT - paddingY * 2;

  const cols = Math.min(count, 3);
  const rows = Math.ceil(count / cols);
  const stepX = usableW / cols;
  const stepY = usableH / Math.max(rows, 1);

  return cards.map((card, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const size = cardSize(card.kind);

    // Organic displacement across the plane
    const jitterFactorX = (stepX - size.width) * 0.45;
    const jitterFactorY = (stepY - size.height) * 0.45;

    const jitterX = seededRandomRange(rng, -jitterFactorX, jitterFactorX);
    const jitterY = seededRandomRange(rng, -jitterFactorY, jitterFactorY);

    const anchorX = paddingX + col * stepX + (stepX - size.width) / 2;
    const anchorY = paddingY + row * stepY + (stepY - size.height) / 2;

    const localX = Math.round(anchorX + jitterX);
    const localY = Math.round(anchorY + jitterY);

    return {
      card,
      localX,
      localY,
      worldX: cx * CHUNK_WIDTH + localX,
      worldY: cy * CHUNK_HEIGHT + localY,
      tilt: 0,
      zIndex: idx + 1
    };
  });
}
