// engines/canvas/placement.js
import { createPRNG, seededRandomRange } from '../../utils/seededRandom.js';
import { CHUNK_WIDTH, CHUNK_HEIGHT } from './chunks.js';
import { cardSize } from '../../models/card.model.js';

export function placeCardsInChunk(cards, cx, cy, sessionSeed = 'laya') {
  if (!cards || cards.length === 0) return [];

  const rng = createPRNG(`${sessionSeed}_chunk_${cx}_${cy}`);
  
  // Arrange in a soft organic 3x3 or 4x3 grid with jitter
  const cols = 3;
  const rows = Math.ceil(cards.length / cols);
  const cellW = CHUNK_WIDTH / cols;
  const cellH = CHUNK_HEIGHT / Math.max(rows, 2);

  return cards.map((card, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const size = cardSize(card.kind);

    // Jitter within cell boundaries
    const maxJitterX = (cellW - size.width) * 0.35;
    const maxJitterY = (cellH - size.height) * 0.35;

    const jitterX = seededRandomRange(rng, -maxJitterX, maxJitterX);
    const jitterY = seededRandomRange(rng, -maxJitterY, maxJitterY);

    // Slight organic tilt between -4.5 and +4.5 degrees
    const tilt = seededRandomRange(rng, -4.5, 4.5);

    const baseX = col * cellW + (cellW - size.width) / 2;
    const baseY = row * cellH + (cellH - size.height) / 2;

    const localX = Math.round(baseX + jitterX);
    const localY = Math.round(baseY + jitterY);

    return {
      card,
      localX,
      localY,
      worldX: cx * CHUNK_WIDTH + localX,
      worldY: cy * CHUNK_HEIGHT + localY,
      tilt: Math.round(tilt * 10) / 10,
      zIndex: idx + 1
    };
  });
}
