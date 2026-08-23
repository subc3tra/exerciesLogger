import { useState } from 'react';

interface ExerciseNoteProps {
  notes: string | null;
  onSave: (notes: string) => Promise<void>;
}

// click-to-edit persistent note on a program exercise (e.g. "use the red band") — carries forward
// every time this exercise comes up in the program, independent of any one session. Lives in the
// Session Logger (not the Dashboard) — mid-workout is when you actually notice something needs
// updating, e.g. skipping the band today means editing the note for next time.
export function ExerciseNote({ notes, onSave }: ExerciseNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(notes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isEditing) {
    return (
      <button
        type="button"
        className="ex-note-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(notes ?? '');
          setIsEditing(true);
        }}
      >
        {notes ? <span className="ex-note">{notes}</span> : <span className="ex-note ex-note-placeholder">+ Add note</span>}
        <span className="ex-note-edit-icon">✎</span>
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
