import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionsApi, ApiError } from '../services/api';
import type { Prefill, SessionDetail, SessionExerciseDetail } from '../types';
import { SetRow } from '../components/SetRow';
import { ConfirmDialog } from '../components/ConfirmDialog';

type NumericField = 'reps' | 'weight' | 'duration' | 'distance';
type CompleteStage = 'closed' | 'confirm' | 'incomplete-warning';

// mm:ss, or h:mm:ss once it runs past an hour
function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function SessionLogger() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [prefill, setPrefill] = useState<Prefill>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [pendingAddFor, setPendingAddFor] = useState<number | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{ exerciseId: number; setId: number } | null>(null);
  const [completeStage, setCompleteStage] = useState<CompleteStage>('closed');
  const [isCompleting, setIsCompleting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    sessionsApi
      .getById(sessionId)
      .then((res) => {
        setSession(res.session);
        setPrefill(res.prefill);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load session'))
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  // anchored to session.date (set server-side at start/resume) rather than component-mount time,
  // so the timer shows real elapsed time and survives a refresh instead of resetting to zero
  useEffect(() => {
    if (!session) return;
    const startTime = new Date(session.date).getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.date]);

  function updateExercise(exerciseId: number, updater: (ex: SessionExerciseDetail) => SessionExerciseDetail) {
    setSession((prev) =>
      prev ? { ...prev, exercises: prev.exercises.map((ex) => (ex.id === exerciseId ? updater(ex) : ex)) } : prev
    );
  }

  function toggleExpand(exerciseId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }

  async function handleFieldCommit(exerciseId: number, setId: number, field: NumericField, value: number | null) {
    updateExercise(exerciseId, (ex) => ({
      ...ex,
      sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
    }));
    try {
      await sessionsApi.updateSet(sessionId, setId, { [field]: value ?? undefined });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save set');
    }
  }

  async function handleToggleComplete(
    exerciseId: number,
    setId: number,
    completed: boolean,
    fields?: Partial<Record<NumericField, number | null>>
  ) {
    const next = !completed;
    updateExercise(exerciseId, (ex) => ({
      ...ex,
      sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...(next ? fields : undefined), completed: next } : s)),
    }));
    try {
      await sessionsApi.updateSet(sessionId, setId, {
        ...(next ? fields : undefined),
        completed: next,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update set');
    }
  }

  async function handleConfirmAddSet() {
    if (pendingAddFor === null) return;
    const exerciseId = pendingAddFor;
    setPendingAddFor(null);
    try {
      const res = await sessionsApi.addSet(sessionId, exerciseId, {});
      updateExercise(exerciseId, (ex) => ({ ...ex, sets: [...ex.sets, res.set] }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add set');
    }
  }

  async function handleConfirmRemoveSet() {
    if (!pendingRemove) return;
    const { exerciseId, setId } = pendingRemove;
    setPendingRemove(null);
    try {
      await sessionsApi.removeSet(sessionId, setId);
      updateExercise(exerciseId, (ex) => ({ ...ex, sets: ex.sets.filter((s) => s.id !== setId) }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to remove set');
    }
  }

  async function handleCompleteConfirm() {
    if (!session) return;
    const allDone = session.exercises.every((ex) => ex.sets.every((s) => s.completed));

    if (allDone) {
      await finishSession();
      return;
    }

    setCompleteStage('incomplete-warning');
  }

  async function handleMarkAllAndComplete() {
    if (!session) return;
    setIsCompleting(true);
    try {
      const incomplete = session.exercises.flatMap((ex) =>
        ex.sets.filter((s) => !s.completed).map((s) => ({ exerciseId: ex.id, setId: s.id }))
      );
      await Promise.all(incomplete.map(({ setId }) => sessionsApi.updateSet(sessionId, setId, { completed: true })));
      await finishSession();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to complete session');
      setIsCompleting(false);
    }
  }

  async function finishSession() {
    setIsCompleting(true);
    try {
      await sessionsApi.complete(sessionId);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to complete session');
    } finally {
      setIsCompleting(false);
      setCompleteStage('closed');
    }
  }

  if (isLoading) return <p style={{ color: 'var(--muted)' }}>Loading session…</p>;
  if (!session) return <p style={{ color: 'var(--accent3)' }}>{error ?? 'Session not found'}</p>;

  return (
    <div>
      <div className="session-timer-label">Time elapsed</div>
      <div className="session-timer">{formatElapsed(elapsedSeconds)}</div>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>
        Week {session.weekNumber} · Day {session.dayNumber}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Log your sets as you go</p>

      {error && <p style={{ color: 'var(--accent3)', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {session.exercises.map((exercise) => {
          const isExpanded = expanded.has(exercise.id);
          const doneCount = exercise.sets.filter((s) => s.completed).length;
          const total = exercise.sets.length;
          const { programExercise } = exercise;

          return (
            <div key={exercise.id} className="block">
              <button
                className="program-row"
                onClick={() => toggleExpand(exercise.id)}
                aria-expanded={isExpanded}
              >
                <span className="program-row-name">{programExercise.exercise.name}</span>
                <span className={`badge ${doneCount === total && total > 0 ? 'green' : 'grey'}`}>
                  {doneCount}/{total}
                </span>
              </button>

              {isExpanded && (
                <div className="program-expanded">
                  {prefill?.[programExercise.id] && (
                    <p className="prefill-notice">Prefilled from your last session — check before marking done</p>
                  )}
                  {programExercise.exercise.description && (
                    <p className="ex-description">{programExercise.exercise.description}</p>
                  )}
                  <p className="target-line">
                    Target: {programExercise.targetSets ?? '–'}×{programExercise.targetReps ?? '–'}
                    {programExercise.targetWeight ? ` @ ${programExercise.targetWeight}kg` : ''}
                  </p>
                  {programExercise.notes && <p className="ex-note">{programExercise.notes}</p>}

                  <div className="set-list">
                    {exercise.sets
                      .slice()
                      .sort((a, b) => a.setNumber - b.setNumber)
                      .map((set) => (
                        <SetRow
                          key={set.id}
                          set={set}
                          unit={programExercise.unit}
                          target={{ targetReps: programExercise.targetReps, targetWeight: programExercise.targetWeight }}
                          previous={prefill?.[programExercise.id]?.find((p) => p.setNumber === set.setNumber)}
                          onFieldCommit={(field, value) => handleFieldCommit(exercise.id, set.id, field, value)}
                          onToggleComplete={(fields) => handleToggleComplete(exercise.id, set.id, set.completed, fields)}
                          onRemove={() => setPendingRemove({ exerciseId: exercise.id, setId: set.id })}
                        />
                      ))}
                  </div>

                  <button className="add-set-button" onClick={() => setPendingAddFor(exercise.id)}>
                    + Add set
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="start-button"
        style={{ marginTop: 28 }}
        onClick={() => setCompleteStage('confirm')}
        disabled={isCompleting}
      >
        {isCompleting ? 'Completing…' : 'Complete Session'}
      </button>

      <ConfirmDialog
        open={pendingAddFor !== null}
        title="Add a set"
        message="Add an extra set beyond the planned target?"
        confirmLabel="Add set"
        onConfirm={handleConfirmAddSet}
        onCancel={() => setPendingAddFor(null)}
      />

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Remove set"
        message="Remove this set row? This can't be undone."
        confirmLabel="Remove"
        onConfirm={handleConfirmRemoveSet}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmDialog
        open={completeStage === 'confirm'}
        title="Complete session?"
        message="This will mark today's workout as finished."
        confirmLabel="Complete"
        onConfirm={handleCompleteConfirm}
        onCancel={() => setCompleteStage('closed')}
      />

      <ConfirmDialog
        open={completeStage === 'incomplete-warning'}
        title="Some sets aren't done"
        message="Mark the remaining sets as done and complete the session?"
        confirmLabel="Mark all & complete"
        onConfirm={handleMarkAllAndComplete}
        onCancel={() => setCompleteStage('closed')}
      />
    </div>
  );
}
