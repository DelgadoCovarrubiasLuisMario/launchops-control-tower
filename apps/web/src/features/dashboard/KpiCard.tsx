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
          <p className="text-sm text-slate-400">{metric.label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">{compactNumber(metric.value, metric.unit)}</p>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${positive ? 'bg-emerald-500/10 text-emerald-200' : 'bg-rose-500/10 text-rose-200'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(metric.trend)}%
        </span>
      </div>
    </Card>
  );
}
