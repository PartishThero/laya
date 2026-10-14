// lib/time.js
// Canonical time formatting and date helpers

export function formatTime(seconds, spaced = false) {
  if (seconds == null || isNaN(seconds) || seconds < 0) return spaced ? '0 : 00' : '0:00';
  const sec = Math.floor(seconds);
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return spaced ? `${m} : ${s}` : `${m}:${s}`;
}

export const formatDuration = formatTime;

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function truncate(str, max = 30) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '…' : str;
}
