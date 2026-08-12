export function compactNumber(value: number, unit = '') {
  const formatted = new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value);
  return `${formatted}${unit}`;
}

export function formatDuration(ms: number) {
  if (!ms) return '—';
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}
