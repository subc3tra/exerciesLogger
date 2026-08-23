import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionsApi, programsApi, ApiError } from '../services/api';
import type { NumericField, Prefill, SessionDetail, SessionExerciseDetail, SessionPR } from '../types';
import { SetRow } from '../components/SetRow';
import { ExerciseNote } from '../components/ExerciseNote';
import { ExerciseVideo } from '../components/ExerciseVideo';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RestTimer } from '../components/RestTimer';
import { SessionSummaryModal } from '../components/SessionSummaryModal';
import { useRestTimer } from '../hooks/useRestTimer';
import { resolveSetDefaults } from '../utils/setDefaults';
import { formatElapsed } from '../utils/time';
import { groupBySection } from '../utils/groupBySection';

type CompleteStage = 'closed' | 'confirm' | 'incomplete-warning';

export function SessionLogger() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [prefill, setPrefill] = useState<Prefill>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [descExpanded, setDescExpanded] = useState<Set<number>>(new Set());
  const [lastToggledId, setLastToggledId] = useState<number | null>(null);
  const exerciseHeaderRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [pendingAddFor, setPendingAddFor] = useState<number | null>(null);
  const [pendingRemove, setPendingRemove] = useState<{ exerciseId: number; setId: number } | null>(null);
  const [completeStage, setCompleteStage] = useState<CompleteStage>('closed');
  const [isCompleting, setIsCompleting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summary, setSummary] = useState<{ prs: SessionPR[]; elapsedSeconds: number } | null>(null);
  const restTimer = useRestTimer();

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

  async function handleSaveExerciseNotes(sessionExerciseId: number, programExerciseId: number, notes: string) {
    const res = await programsApi.updateExerciseNotes(programExerciseId, notes);
    updateExercise(sessionExerciseId, (ex) => ({
      ...ex,
      programExercise: { ...ex.programExercise, notes: res.programExercise.notes },
    }));
  }

  function toggleExpand(exerciseId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
    // Scroll-to-center happens in the effect below, once the state above has actually
    // committed/rendered — not here.
    setLastToggledId(exerciseId);
  }

  // Center the exercise's header in the viewport on every open *and* close — opening lands you on
  // what you just tapped instead of it staying wherever it was pre-expand; closing re-centers it
  // too, so you're not left hunting for a now-collapsed row that shifted position on screen.
  useEffect(() => {
    if (lastToggledId === null) return;
    exerciseHeaderRefs.current[lastToggledId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setLastToggledId(null);
  }, [lastToggledId]);

  function toggleDescription(exerciseId: number) {
    setDescExpanded((prev) => {
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
    if (next) restTimer.start();
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
      // sets finished via the individual checkmark already carry their real values (see SetRow's
      // handleTick) — but a set left untouched here has nothing on it beyond what's pre-created, so
      // resolve the same actual/previous/target default SetRow is currently displaying for it,
      // rather than saving `completed: true` with everything else still null.
      const incomplete = session.exercises.flatMap((ex) =>
        ex.sets
          .filter((s) => !s.completed)
          .map((s) => ({
            setId: s.id,
            fields: resolveSetDefaults(
              ex.programExercise.exercise.trackedFields,
              s,
              prefill?.[ex.programExercise.id]?.find((p) => p.setNumber === s.setNumber),
              { targetReps: ex.programExercise.targetReps, targetWeight: ex.programExercise.targetWeight }
            ),
          }))
      );

      // mirror the resolved defaults into local state too — sessionsApi.updateSet below only
      // persists them server-side, but the summary modal reads from this state, so without this
      // it'd show these sets as still incomplete with no weight/reps
      setSession((prev) =>
        prev
          ? {
              ...prev,
              exercises: prev.exercises.map((ex) => ({
                ...ex,
                sets: ex.sets.map((s) => {
                  const match = incomplete.find((i) => i.setId === s.id);
                  return match ? { ...s, ...match.fields, completed: true } : s;
                }),
              })),
            }
          : prev
      );

      await Promise.all(
        incomplete.map(({ setId, fields }) => sessionsApi.updateSet(sessionId, setId, { ...fields, completed: true }))
      );
      await finishSession();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to complete session');
      setIsCompleting(false);
    }
  }

  async function finishSession() {
    setIsCompleting(true);
    try {
      const result = await sessionsApi.complete(sessionId);
      setSummary({ prs: result.prs, elapsedSeconds });
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

      <div className="rest-duration-editor">
        <label className="rest-duration-label" htmlFor="rest-duration-input">
          Rest timer
        </label>
        <input
          id="rest-duration-input"
          className="rest-duration-input"
          type="number"
          inputMode="numeric"
          min={5}
          step={5}
          value={restTimer.duration}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (Number.isFinite(value) && value > 0) restTimer.setDuration(value);
          }}
        />
        <span className="rest-duration-suffix">sec</span>
      </div>

      <h1 style={{ fontSize: 24, marginBottom: 4 }}>
        Week {session.weekNumber} · Day {session.dayNumber}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>Log your sets as you go</p>

      {error && <p style={{ color: 'var(--accent3)', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {groupBySection(session.exercises).map((group) => (
          <div key={group.section.id}>
            <div className="schedule-chip-section-name" style={{ marginBottom: 8 }}>
              {group.section.name}
              {group.section.zone ? ` · ${group.section.zone}` : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.exercises.map((exercise) => {
          const isExpanded = expanded.has(exercise.id);
          const isDescExpanded = descExpanded.has(exercise.id);
          const doneCount = exercise.sets.filter((s) => s.completed).length;
          const total = exercise.sets.length;
          const { programExercise } = exercise;

          return (
            <div key={exercise.id} className="block">
              <button
                ref={(el) => {
                  exerciseHeaderRefs.current[exercise.id] = el;
                }}
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
                  {programExercise.exercise.description ? (
                    <div className="ex-description-block">
                      <button
                        className="ex-description-toggle"
                        onClick={() => toggleDescription(exercise.id)}
                        aria-expanded={isDescExpanded}
                      >
                        <span className="block-label">Description</span>
                        <span className="ex-description-caret">{isDescExpanded ? '▾' : '▸'}</span>
                      </button>
                      {isDescExpanded && (
                        <>
                          <p className="ex-description">{programExercise.exercise.description}</p>
                          <ExerciseVideo link={programExercise.exercise.link} nested />
                        </>
                      )}
                    </div>
                  ) : (
                    // no description to nest under — fall back to a top-level toggle so the
                    // video link is still reachable
                    <ExerciseVideo link={programExercise.exercise.link} />
                  )}
                  <p className="target-line">
                    Target: {programExercise.targetSets ?? '–'}×{programExercise.targetReps ?? '–'}
                    {programExercise.targetWeight ? ` @ ${programExercise.targetWeight}kg` : ''}
                  </p>

                  <div className="set-list">
                    {exercise.sets
                      .slice()
                      .sort((a, b) => a.setNumber - b.setNumber)
                      .map((set) => (
                        <SetRow
                          key={set.id}
                          set={set}
                          trackedFields={programExercise.exercise.trackedFields}
                          target={{ targetReps: programExercise.targetReps, targetWeight: programExercise.targetWeight }}
                          previous={prefill?.[programExercise.id]?.find((p) => p.setNumber === set.setNumber)}
                          onFieldCommit={(field, value) => handleFieldCommit(exercise.id, set.id, field, value)}
                          onToggleComplete={(fields) => handleToggleComplete(exercise.id, set.id, set.completed, fields)}
                          onRemove={() => setPendingRemove({ exerciseId: exercise.id, setId: set.id })}
                        />
                      ))}
                  </div>

                  <div className="ex-note-block">
                    <span className="block-label">Notes</span>
                    <ExerciseNote
                      notes={programExercise.notes}
                      onSave={(notes) => handleSaveExerciseNotes(exercise.id, programExercise.id, notes)}
                    />
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
          </div>
        ))}
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

      {restTimer.isRunning && <RestTimer secondsLeft={restTimer.secondsLeft} onDismiss={restTimer.dismiss} />}

      {summary && (
        <SessionSummaryModal
          session={session}
          elapsedSeconds={summary.elapsedSeconds}
          prs={summary.prs}
          onClose={() => navigate('/')}
        />
      )}
    </div>
  );
}
