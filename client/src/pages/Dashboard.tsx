import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { InfoBanner } from '../components/InfoBanner';
import { StatsSummary } from '../components/StatsSummary';
import { programsApi, sessionsApi, ApiError } from '../services/api';
import type { Program, ProgramDay, ProgramDetail, ProgramExerciseTemplate, ProgramProgress } from '../types';

type SlotStatus = 'done' | 'active' | 'next' | 'upcoming';

interface ScheduleSlot {
  week: number;
  day: ProgramDay;
  status: SlotStatus;
}

function buildSchedule(detail: ProgramDetail, progress: ProgramProgress): ScheduleSlot[][] {
  const total = detail.totalWeeks * detail.daysPerWeek;
  const slots: ScheduleSlot[] = [];

  for (let i = 0; i < total; i++) {
    const week = Math.floor(i / detail.daysPerWeek) + 1;
    const day = detail.days[i % detail.daysPerWeek];

    let status: SlotStatus;
    if (i < progress.completedCount) status = 'done';
    else if (i === progress.completedCount) status = progress.activeSession ? 'active' : 'next';
    else status = 'upcoming';

    slots.push({ week, day, status });
  }

  const weeks: ScheduleSlot[][] = [];
  for (const slot of slots) {
    (weeks[slot.week - 1] ??= []).push(slot);
  }
  return weeks;
}

function exerciseSummary(day: ProgramDay): string {
  return day.sections.flatMap((s) => s.exercises.map((e) => e.exercise.name)).join(', ');
}

// click-to-edit persistent note on a program exercise (e.g. "use the red band") — carries forward
// every time this exercise comes up in the program, independent of any one session
function ExerciseNote({
  exercise,
  onSave,
}: {
  exercise: ProgramExerciseTemplate;
  onSave: (notes: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(exercise.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isEditing) {
    return (
      <button
        type="button"
        className="ex-note-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(exercise.notes ?? '');
          setIsEditing(true);
        }}
      >
        {exercise.notes ? (
          <span className="ex-note">{exercise.notes}</span>
        ) : (
          <span className="ex-note ex-note-placeholder">+ Add note</span>
        )}
      </button>
    );
  }

  return (
    <div className="ex-note-edit" onClick={(e) => e.stopPropagation()}>
      <textarea
        className="ex-note-textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="e.g. red band, felt heavy…"
        rows={2}
        autoFocus
      />
      <div className="ex-note-edit-actions">
        <button
          type="button"
          className="ex-note-save"
          disabled={isSaving}
          onClick={async () => {
            setIsSaving(true);
            try {
              await onSave(draft.trim());
              setIsEditing(false);
            } finally {
              setIsSaving(false);
            }
          }}
        >
          {isSaving ? '…' : 'Save'}
        </button>
        <button type="button" className="ex-note-cancel" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, ProgramDetail>>({});
  const [progress, setProgress] = useState<Record<number, ProgramProgress>>({});
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [expandedSlots, setExpandedSlots] = useState<Record<number, Set<string>>>({});

  useEffect(() => {
    programsApi
      .getAll()
      .then((res) => setPrograms(res.programs))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load programs'))
      .finally(() => setIsLoading(false));
  }, []);

  async function toggleExpand(program: Program) {
    if (expandedId === program.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(program.id);
    setStartError(null);

    if (!details[program.id]) {
      setDetailLoadingId(program.id);
      try {
        const [detailRes, progressRes] = await Promise.all([
          programsApi.getById(program.id),
          programsApi.getProgress(program.id),
        ]);
        setDetails((prev) => ({ ...prev, [program.id]: detailRes.program }));
        setProgress((prev) => ({ ...prev, [program.id]: progressRes }));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load program details');
      } finally {
        setDetailLoadingId(null);
      }
    }
  }

  async function handleSaveExerciseNotes(programId: number, exerciseId: number, notes: string) {
    const res = await programsApi.updateExerciseNotes(programId, exerciseId, notes);
    setDetails((prev) => {
      const detail = prev[programId];
      if (!detail) return prev;
      return {
        ...prev,
        [programId]: {
          ...detail,
          days: detail.days.map((day) => ({
            ...day,
            sections: day.sections.map((section) => ({
              ...section,
              exercises: section.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, notes: res.programExercise.notes } : ex
              ),
            })),
          })),
        },
      };
    });
  }

  function toggleSlot(programId: number, slotKey: string) {
    setExpandedSlots((prev) => {
      const next = new Set(prev[programId] ?? []);
      if (next.has(slotKey)) next.delete(slotKey);
      else next.add(slotKey);
      return { ...prev, [programId]: next };
    });
  }

  async function handleStart(program: Program) {
    setStartingId(program.id);
    setStartError(null);
    try {
      const res = await sessionsApi.start(program.id);
      if (!res.session) {
        setStartError('Could not start a session for this program.');
        return;
      }
      navigate(`/session/${res.session.id}`);
    } catch (err) {
      setStartError(err instanceof ApiError ? err.message : 'Failed to start session');
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div>
      <InfoBanner />

      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Welcome back, {user?.username}</h1>

      <div style={{ marginBottom: 28 }}>
        <StatsSummary />
      </div>

      <h2 className="section-heading">Your Programs</h2>

      {isLoading && <p style={{ color: 'var(--muted)' }}>Loading programs…</p>}
      {error && <p style={{ color: 'var(--accent3)' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {programs.map((program) => {
          const isExpanded = expandedId === program.id;
          const detail = details[program.id];
          const progressData = progress[program.id];
          const weeks = detail && progressData ? buildSchedule(detail, progressData) : null;
          const isComplete = progressData ? progressData.completedCount >= detail!.totalWeeks * detail!.daysPerWeek : false;

          return (
            <div key={program.id} className="block">
              <button
                className="program-row"
                onClick={() => toggleExpand(program)}
                aria-expanded={isExpanded}
              >
                <span className="program-row-name">{program.name}</span>
                <span className={`badge ${program.status === 'ACTIVE' ? 'green' : 'grey'}`}>
                  {program.status}
                </span>
              </button>

              {isExpanded && (
                <div className="program-expanded">
                  {detailLoadingId === program.id && (
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading details…</p>
                  )}

                  {detail && weeks && (
                    <>
                      <p className="program-summary">
                        {detail.totalWeeks} weeks · {detail.daysPerWeek} days/week
                      </p>

                      {isComplete && <p style={{ color: 'var(--muted)', fontSize: 13 }}>This program is complete.</p>}

                      {startError && expandedId === program.id && (
                        <p style={{ color: 'var(--accent3)', fontSize: 12, marginBottom: 12 }}>{startError}</p>
                      )}

                      <div className="schedule">
                        {weeks.map((weekSlots, weekIdx) => (
                          <div key={weekIdx} className="schedule-week">
                            <span className="schedule-week-label">Week {weekIdx + 1}</span>
                            <div className="schedule-week-days">
                              {weekSlots.map((slot, dayIdx) => {
                                const slotKey = `${slot.week}-${slot.day.id}`;
                                const isSlotExpanded = expandedSlots[program.id]?.has(slotKey) ?? false;

                                return (
                                  <div
                                    key={dayIdx}
                                    className={`schedule-chip ${slot.status}`}
                                    onClick={() => toggleSlot(program.id, slotKey)}
                                  >
                                    <div className="schedule-chip-header">
                                      <span className="schedule-chip-name">
                                        {slot.status === 'done' && '✓ '}
                                        {slot.day.name}
                                      </span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {(slot.status === 'next' || slot.status === 'active') && (
                                          <button
                                            className="schedule-continue"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStart(program);
                                            }}
                                            disabled={startingId === program.id}
                                          >
                                            {startingId === program.id
                                              ? '…'
                                              : slot.status === 'active'
                                                ? 'Continue'
                                                : 'Start'}
                                          </button>
                                        )}
                                        <span className="schedule-chip-caret">{isSlotExpanded ? '▾' : '▸'}</span>
                                      </div>
                                    </div>

                                    {isSlotExpanded ? (
                                      <div className="schedule-chip-detail">
                                        {slot.day.sections.map((section) => (
                                          <div key={section.id} className="schedule-chip-section">
                                            <div className="schedule-chip-section-name">
                                              {section.name}
                                              {section.zone ? ` · ${section.zone}` : ''}
                                            </div>
                                            {section.exercises.map((exercise) => (
                                              <div key={exercise.id} className="exercise">
                                                <div>
                                                  <div className="ex-name">{exercise.exercise.name}</div>
                                                  <ExerciseNote
                                                    exercise={exercise}
                                                    onSave={(notes) =>
                                                      handleSaveExerciseNotes(program.id, exercise.id, notes)
                                                    }
                                                  />
                                                </div>
                                                <div>
                                                  <div className="ex-reps-num">
                                                    {exercise.targetSets ?? '–'}×{exercise.targetReps ?? '–'}
                                                  </div>
                                                  <div className="ex-reps-label">
                                                    {exercise.exercise.trackedFields.length > 0
                                                      ? exercise.exercise.trackedFields.join(' + ')
                                                      : 'REPS'}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="schedule-chip-exercises">{exerciseSummary(slot.day)}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
