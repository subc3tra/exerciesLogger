import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { programsApi, sessionsApi, ApiError } from '../services/api';
import type { Program, ProgramDetail } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, ProgramDetail>>({});
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
        const res = await programsApi.getById(program.id);
        setDetails((prev) => ({ ...prev, [program.id]: res.program }));
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

                  {detail && (
                    <>
                      <p className="program-summary">
                        {detail.totalWeeks} weeks · {detail.daysPerWeek} days/week
                      </p>

                      {program.status === 'ARCHIVED' ? (
                        <p style={{ color: 'var(--muted)', fontSize: 13 }}>This program is complete.</p>
                      ) : (
                        <button
                          className="start-button"
                          onClick={() => handleStart(program)}
                          disabled={startingId === program.id}
                        >
                          {startingId === program.id ? 'Starting…' : 'Start / Continue'}
                        </button>
                      )}

                      {startError && expandedId === program.id && (
                        <p style={{ color: 'var(--accent3)', fontSize: 12, marginTop: 8 }}>{startError}</p>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                        {detail.days.map((day) => (
                          <div key={day.id} className="block">
                            <div className="block-header">
                              <span className="block-label">
                                {day.name}
                                {day.dayLabel ? ` · ${day.dayLabel}` : ''}
                              </span>
                              {day.duration && <span className="badge blue">{day.duration}</span>}
                            </div>

                            {day.sections.map((section) => (
                              <div key={section.id}>
                                <div className="block-header" style={{ background: 'transparent' }}>
                                  <span className="block-label">
                                    {section.name}
                                    {section.zone ? ` · ${section.zone}` : ''}
                                  </span>
                                  {(section.sets || section.restSecs) && (
                                    <span className="badge orange">
                                      {section.sets ? `${section.sets} sets` : ''}
                                      {section.sets && section.restSecs ? ' · ' : ''}
                                      {section.restSecs ? `${section.restSecs}s rest` : ''}
                                    </span>
                                  )}
                                </div>

                                {section.exercises.map((exercise) => (
                                  <div key={exercise.id} className="exercise">
                                    <div>
                                      <div className="ex-name">{exercise.name}</div>
                                      {exercise.notes && <div className="ex-note">{exercise.notes}</div>}
                                    </div>
                                    <div>
                                      <div className="ex-reps-num">
                                        {exercise.targetSets ?? '–'}×{exercise.targetReps ?? '–'}
                                      </div>
                                      <div className="ex-reps-label">{(exercise.unit ?? 'reps').toUpperCase()}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
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
