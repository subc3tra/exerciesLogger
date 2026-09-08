import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { programDraftApi, ApiError } from '../services/api';
import type { ProgramDraft } from '../types';

type ViewState = 'loading' | 'none' | 'ready' | 'confirmed';

export function DraftReview() {
  const navigate = useNavigate();

  const [state, setState] = useState<ViewState>('loading');
  const [draft, setDraft] = useState<ProgramDraft | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    programDraftApi
      .getMine()
      .then((res) => {
        setDraft(res.draft);
        setState(res.draft.confirmed ? 'confirmed' : 'ready');
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setState('none');
          return;
        }
        setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again.');
        setState('none');
      });
  }, []);

  async function handleConfirm() {
    setError(null);
    setIsSubmitting(true);
    try {
      await programDraftApi.confirm();
      setState('confirmed');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestEdit() {
    if (notes.trim() === '') return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await programDraftApi.requestEdit(notes);
      setDraft(res.draft);
      setNotes('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (state === 'loading') {
    return null;
  }

  if (state === 'none') {
    return (
      <div className="draft-empty">
        <h1 className="draft-title">No draft yet</h1>
        <p className="draft-subtitle">
          {error ?? "Nothing to review here yet. Check back once your program's ready."}
        </p>
      </div>
    );
  }

  if (state === 'confirmed') {
    return (
      <div className="draft-empty">
        <h1 className="draft-title">Program confirmed</h1>
        <p className="draft-subtitle">Your program is live.</p>
        <button className="intake-button" onClick={() => navigate('/')}>
          Go to dashboard
        </button>
      </div>
    );
  }

  const program = draft!.programData;

  return (
    <div className="draft-page">
      <h1 className="draft-title">{program.name}</h1>
      <p className="draft-subtitle">
        {program.totalWeeks} weeks · {program.daysPerWeek} days/week
      </p>

      {draft!.editNotes && (
        <p className="draft-pending-note">
          You've already asked for a change on this draft: "{draft!.editNotes}". Leaving another
          note below will replace it.
        </p>
      )}

      {program.days.map((day, dayIndex) => (
        <div className="draft-day" key={dayIndex}>
          <h2 className="draft-day-title">
            {day.name}
            {day.dayLabel ? ` · ${day.dayLabel}` : ''}
          </h2>
          {day.duration && <p className="draft-day-duration">{day.duration}</p>}

          {day.sections.map((section, sectionIndex) => (
            <div className="draft-section" key={sectionIndex}>
              <h3 className="draft-section-title">{section.name}</h3>
              <ul className="draft-exercise-list">
                {section.exercises.map((exercise, exerciseIndex) => (
                  <li className="draft-exercise" key={exerciseIndex}>
                    <span className="draft-exercise-name">{exercise.name}</span>
                    <span className="draft-exercise-meta">
                      {exercise.targetSets}×{exercise.targetReps ?? '—'}
                      {exercise.targetWeight ? ` @ ${exercise.targetWeight}kg` : ''}
                    </span>
                    {exercise.notes && <p className="draft-exercise-notes">{exercise.notes}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      {error && <p className="intake-error">{error}</p>}

      <div className="draft-actions">
        <button className="intake-button" onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Confirming…' : 'Confirm program'}
        </button>

        <label className="intake-label" htmlFor="editNotes">
          Or ask for a change
        </label>
        <textarea
          id="editNotes"
          className="intake-textarea"
          placeholder="e.g. swap the Monday leg day for something lighter on my knee"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          className="draft-secondary-button"
          onClick={handleRequestEdit}
          disabled={isSubmitting || notes.trim() === ''}
        >
          {isSubmitting ? 'Sending…' : 'Request change'}
        </button>
      </div>
    </div>
  );
}
