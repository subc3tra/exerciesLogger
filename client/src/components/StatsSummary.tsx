import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { StatsOverview, StatsRange } from '../types';

const RANGES: { value: StatsRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'lifetime', label: 'Lifetime' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

interface StatsSummaryProps {
  exerciseId?: number;
}

export function StatsSummary({ exerciseId }: StatsSummaryProps = {}) {
  const [range, setRange] = useState<StatsRange>('week');
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    statsApi
      .getOverview(range, exerciseId)
      .then(setStats)
      .catch(() => {
        // stats are a nice-to-have — a failure here shouldn't block the rest of the dashboard
      });
  }, [range, exerciseId]);

  if (!stats) return null;

  return (
    <div className="block stats-block">
      <div className="block-header">
        <span className="block-label">Your Stats</span>
        <div className="tab-nav tab-nav-sm">
          {RANGES.map((r) => (
            <button
              key={r.value}
              className={r.value === range ? 'active' : ''}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="stats-body">
        <div className="stat-row">
          <span className="stat-label">Total weight lifted</span>
          <span className="stat-value">{Math.round(stats.totalVolumeKg).toLocaleString()} kg</span>
        </div>

        <div className="stat-row">
          <span className="stat-label">Heaviest lift</span>
          {stats.heaviestLift ? (
            <div className="stat-value-group">
              <span className="stat-value">{stats.heaviestLift.weight} kg</span>
              <span className="stat-sub">
                {stats.heaviestLift.exerciseName} · {formatDate(stats.heaviestLift.date)}
              </span>
            </div>
          ) : (
            <span className="stat-value stat-value-empty">–</span>
          )}
        </div>

        <div className="stat-row">
          <span className="stat-label">Sessions completed</span>
          <span className="stat-value">{stats.totalSessionsCompleted}</span>
        </div>
      </div>
    </div>
  );
}
