import fs from 'fs';
import path from 'path';

/**
 * Validates audio file existence and gets byte stats.
 */
export const getAudioStats = (audioPath) => {
  const resolved = path.isAbsolute(audioPath) ? audioPath : path.resolve(process.cwd(), audioPath);
  if (!fs.existsSync(resolved)) {
    return null;
  }
  const stat = fs.statSync(resolved);
  return {
    filePath: resolved,
    size: stat.size
  };
};

export default { getAudioStats };
