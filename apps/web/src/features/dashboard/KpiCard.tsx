import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/Card';
import { compactNumber } from '../../lib/format';
import type { Metric } from '../../lib/types';

type KpiCardProps = {
  metric: Metric;
};

export function KpiCard({ metric }: KpiCardProps) {
  const positive = metric.trend >= 0;
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="lo-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--lo-muted)]">{metric.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{compactNumber(metric.value, metric.unit)}</p>
        </div>
        <span
          className={`lo-mono inline-flex items-center gap-1 border px-2 py-1 text-[0.7rem] uppercase tracking-[0.06em] ${
            positive
              ? 'border-[var(--lo-ok)] bg-[#ecfdf3] text-[var(--lo-ok)]'
              : 'border-[var(--lo-danger)] bg-[#fef3f2] text-[var(--lo-danger)]'
          }`}
        >
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(metric.trend)}%
        </span>
      </div>
    </Card>
  );
}
