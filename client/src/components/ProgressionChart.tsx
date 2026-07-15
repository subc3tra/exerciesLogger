import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { StatsProgressionPoint, StatsRange } from '../types';

const RANGES: { value: StatsRange; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'lifetime', label: 'Lifetime' },
];

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 24, left: 40 };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

interface ProgressionChartProps {
  exerciseId?: number;
}

export function ProgressionChart({ exerciseId }: ProgressionChartProps) {
  const [range, setRange] = useState<StatsRange>('week');
  const [points, setPoints] = useState<StatsProgressionPoint[] | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setPoints(null);
      return;
    }
    statsApi
      .getProgression(exerciseId, range)
      .then(setPoints)
      .catch(() => {
        // chart is a nice-to-have — a failure here shouldn't block the page
      });
  }, [range, exerciseId]);

  return (
    <div className="block chart-block">
      <div className="block-header">
        <span className="block-label">Progression</span>
        <div className="tab-nav tab-nav-sm">
          {RANGES.map((r) => (
            <button key={r.value} className={r.value === range ? 'active' : ''} onClick={() => setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-body">
        {!exerciseId ? (
          <p className="chart-empty">Select an exercise to see progression.</p>
        ) : !points ? null : points.length === 0 ? (
          <p className="chart-empty">No logged weight for this exercise in this range yet.</p>
        ) : (
          <ProgressionSvg points={points} />
        )}
      </div>
    </div>
  );
}

function ProgressionSvg({ points }: { points: StatsProgressionPoint[] }) {
  const weights = points.map((p) => p.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  // pad the range so a flat line (or a single point) isn't glued to the top/bottom edge
  const weightPad = maxWeight === minWeight ? Math.max(maxWeight * 0.1, 1) : (maxWeight - minWeight) * 0.1;
  const yMin = minWeight - weightPad;
  const yMax = maxWeight + weightPad;

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const x = (i: number) =>
    PADDING.left + (points.length === 1 ? innerWidth / 2 : (i / (points.length - 1)) * innerWidth);
  const y = (weight: number) => PADDING.top + innerHeight - ((weight - yMin) / (yMax - yMin)) * innerHeight;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.weight)}`).join(' ');
  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="progression-svg" preserveAspectRatio="none">
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line x1={PADDING.left} x2={CHART_WIDTH - PADDING.right} y1={y(tick)} y2={y(tick)} className="chart-gridline" />
          <text x={PADDING.left - 8} y={y(tick)} className="chart-axis-label" textAnchor="end" dominantBaseline="middle">
            {Math.round(tick)}
          </text>
        </g>
      ))}

      {points.length > 1 && <path d={linePath} className="chart-line" fill="none" />}

      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.weight)} r={4} className="chart-dot" />
      ))}

      <text x={PADDING.left} y={CHART_HEIGHT - 4} className="chart-axis-label" textAnchor="start">
        {formatDate(points[0].date)}
      </text>
      <text x={CHART_WIDTH - PADDING.right} y={CHART_HEIGHT - 4} className="chart-axis-label" textAnchor="end">
        {formatDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}
