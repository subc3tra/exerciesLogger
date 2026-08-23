import { useMemo, useState } from 'react';
import type { SessionDetail, SessionPR } from '../types';
import { formatElapsed } from '../utils/time';
import { getCompletionMessage } from '../utils/completionMessage';
import { groupBySection } from '../utils/groupBySection';
import { formatSessionAsText, formatSetLine } from '../utils/sessionText';
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

  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = formatSessionAsText(session, elapsedSeconds);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard permission denied or unsupported — nothing to fall back to silently, leave
      // the button as-is rather than claiming success
    }
  }

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

        <div className="summary-exercise-list">
          <span className="block-label">Full session</span>
          {groupBySection(session.exercises).map((group) =>
            group.exercises.map((exercise) => {
              const completedSets = exercise.sets.filter((s) => s.completed);
              if (completedSets.length === 0) return null;
              return (
                <div className="summary-exercise" key={exercise.id}>
                  <span className="summary-exercise-name">{exercise.programExercise.exercise.name}</span>
                  <div className="summary-set-list">
                    {completedSets.map((set) => (
                      <div className="summary-set-line" key={set.id}>
                        <span className="summary-set-number">{set.setNumber}</span>
                        <span>{formatSetLine(set, exercise.programExercise.exercise.trackedFields)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="dialog-actions">
          <button className="dialog-button secondary" onClick={handleCopy}>
            {copied ? 'Copied ✓' : 'Copy as text'}
          </button>
          <button className="dialog-button primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
