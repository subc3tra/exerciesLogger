import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { programsApi, sessionsApi, ApiError } from '../services/api';
import type { Program, ProgramDay, ProgramDetail, ProgramProgress } from '../types';

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
  return day.sections.flatMap((s) => s.exercises.map((e) => e.name)).join(', ');
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
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Welcome back, {user?.username}</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 13 }}>Your training programs</p>

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
                              {weekSlots.map((slot, dayIdx) => (
                                <div key={dayIdx} className={`schedule-chip ${slot.status}`}>
                                  <div className="schedule-chip-header">
                                    <span className="schedule-chip-name">
                                      {slot.status === 'done' && '✓ '}
                                      {slot.day.name}
                                    </span>
                                    {(slot.status === 'next' || slot.status === 'active') && (
                                      <button
                                        className="schedule-continue"
                                        onClick={() => handleStart(program)}
                                        disabled={startingId === program.id}
                                      >
                                        {startingId === program.id
                                          ? '…'
                                          : slot.status === 'active'
                                            ? 'Continue'
                                            : 'Start'}
                                      </button>
                                    )}
                                  </div>
                                  <p className="schedule-chip-exercises">{exerciseSummary(slot.day)}</p>
                                </div>
                              ))}
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
