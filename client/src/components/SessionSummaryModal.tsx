import { useMemo } from 'react';
import type { SessionDetail, SessionPR } from '../types';
import { formatElapsed } from '../utils/time';
import { getCompletionMessage } from '../utils/completionMessage';
import { Fireworks } from './Fireworks';

interface SessionSummaryModalProps {
  session: SessionDetail;
  elapsedSeconds: number;
  prs: SessionPR[];
  onClose: () => void;
}

export function SessionSummaryModal({ session, elapsedSeconds, prs, onClose }: SessionSummaryModalProps) {
  const totalVolumeKg = session.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets.reduce((sum, set) => {
        if (!set.completed || set.weight == null || set.reps == null) return sum;
        return sum + set.weight * set.reps;
      }, 0),
    0
  );

  const totalSetsCompleted = session.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  );

  const exercisesDone = session.exercises.filter((ex) => ex.sets.some((s) => s.completed)).length;

  // picked once per mount — this component re-renders every second while the parent's elapsed
  // timer keeps ticking, and an inline call here would re-roll on every one of those re-renders
  const completionMessage = useMemo(() => getCompletionMessage(), []);

  return (
    <div className="dialog-overlay">
      <div className="session-summary-card">
        <span className="whats-new-badge">Session Complete</span>
        <h3 className="dialog-title">
          Week {session.weekNumber} · Day {session.dayNumber}
        </h3>

        <div className="summary-stats-grid">
          <div className="summary-stat">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{formatElapsed(elapsedSeconds)}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Volume</span>
            <span className="stat-value">{Math.round(totalVolumeKg).toLocaleString()} kg</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Exercises</span>
            <span className="stat-value">{exercisesDone}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Sets completed</span>
            <span className="stat-value">{totalSetsCompleted}</span>
          </div>
        </div>

        {prs.length > 0 && (
          <div className="summary-prs">
            <span className="block-label">New PRs</span>
            <ul className="summary-pr-list">
              {prs.map((pr) => (
                <li key={pr.exerciseId}>
                  <span className="pr-badge-anchor">
                    <span className="badge blue">PR</span>
                    <Fireworks />
                  </span>
                  <span className="summary-pr-name">{pr.exerciseName}</span>
                  <span className="summary-pr-weight">
                    {pr.weight} kg <span className="stat-sub">(prev {pr.previousBest} kg)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="summary-message">{completionMessage}</p>

        <div className="dialog-actions">
          <button className="dialog-button primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
