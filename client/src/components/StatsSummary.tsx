import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { StatsOverview } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function StatsSummary() {
  const [stats, setStats] = useState<StatsOverview | null>(null);

  useEffect(() => {
    statsApi
      .getOverview()
      .then(setStats)
      .catch(() => {
        // stats are a nice-to-have — a failure here shouldn't block the rest of the dashboard
      });
  }, []);

  if (!stats) return null;

  return (
    <div className="block stats-block">
      <div className="block-header">
        <span className="block-label">Your Stats</span>
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
