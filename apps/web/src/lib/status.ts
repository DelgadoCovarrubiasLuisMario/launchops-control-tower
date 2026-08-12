export const deploymentStatusStyles = {
  queued: 'text-[var(--lo-muted)] bg-[var(--lo-panel-2)] border-[var(--lo-line)]',
  running: 'text-[var(--lo-info)] bg-[#eff8ff] border-[var(--lo-info)]',
  success: 'text-[var(--lo-ok)] bg-[#ecfdf3] border-[var(--lo-ok)]',
  failed: 'text-[var(--lo-danger)] bg-[#fef3f2] border-[var(--lo-danger)]',
  rolled_back: 'text-[var(--lo-warn)] bg-[#fffaeb] border-[var(--lo-warn)]'
};

export const severityStyles = {
  low: 'text-[var(--lo-muted)] bg-[var(--lo-panel-2)] border-[var(--lo-line)]',
  medium: 'text-[var(--lo-warn)] bg-[#fffaeb] border-[var(--lo-warn)]',
  high: 'text-[#b54708] bg-[#fffaeb] border-[#b54708]',
  critical: 'text-[var(--lo-danger)] bg-[#fef3f2] border-[var(--lo-danger)]'
};
