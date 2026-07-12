import { useState } from 'react';
import type { PrefillSetEntry, SessionSet } from '../types';

type NumericField = 'reps' | 'weight' | 'duration' | 'distance';
type FieldValues = Partial<Record<NumericField, number | null>>;

interface SetRowProps {
  set: SessionSet;
  unit: string | null;
  target: { targetReps: string | null; targetWeight: number | null };
  previous?: PrefillSetEntry;
  onFieldCommit: (field: NumericField, value: number | null) => void;
  onToggleComplete: (fields?: FieldValues) => void;
  onRemove: () => void;
}

// targetReps is a flexible display string ("6–8", "20s", "30m") — pull the first number out of it
function parseTargetNumber(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

// default the input to a real, editable value instead of leaving it blank: the actual value already
// saved for this set, else last session's actual number for this same set, else the plan's target.
// Always a real value the user consciously confirms or edits — never a silent placeholder-only guess.
function initialValue(actual: number | null, previousValue: number | null, target: number | null): string {
  if (actual != null) return actual.toString();
  if (previousValue != null) return previousValue.toString();
  return target != null ? target.toString() : '';
}

export function SetRow({ set, unit, target, previous, onFieldCommit, onToggleComplete, onRemove }: SetRowProps) {
  const targetNumber = parseTargetNumber(target.targetReps);

  const [reps, setReps] = useState(initialValue(set.reps, previous?.reps ?? null, targetNumber));
  const [weight, setWeight] = useState(initialValue(set.weight, previous?.weight ?? null, target.targetWeight));
  const [duration, setDuration] = useState(initialValue(set.duration, previous?.duration ?? null, targetNumber));
  const [distance, setDistance] = useState(initialValue(set.distance, previous?.distance ?? null, targetNumber));

  function commit(field: NumericField, raw: string) {
    const current = set[field];
    const parsed = raw === '' ? null : Number(raw);
    if (parsed === current) return;
    onFieldCommit(field, parsed);
  }

  function handleTick() {
    if (set.completed) {
      onToggleComplete();
      return;
    }

    const fields: FieldValues =
      unit === 's'
        ? { duration: duration === '' ? null : Number(duration) }
        : unit === 'm'
          ? { distance: distance === '' ? null : Number(distance) }
          : { reps: reps === '' ? null : Number(reps), weight: weight === '' ? null : Number(weight) };

    onToggleComplete(fields);
  }

  return (
    <div className={`set-row ${set.completed ? 'completed' : ''}`}>
      <span className="set-number">#{set.setNumber}</span>

      {unit === 's' ? (
        <div className="set-field">
          <label className="set-field-label">sec</label>
          <input
            className="set-input"
            type="number"
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            onBlur={() => commit('duration', duration)}
          />
        </div>
      ) : unit === 'm' ? (
        <div className="set-field">
          <label className="set-field-label">meters</label>
          <input
            className="set-input"
            type="number"
            inputMode="decimal"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            onBlur={() => commit('distance', distance)}
          />
        </div>
      ) : (
        <>
          <div className="set-field">
            <label className="set-field-label">reps</label>
            <input
              className="set-input"
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              onBlur={() => commit('reps', reps)}
            />
          </div>
          <div className="set-field">
            <label className="set-field-label">kg</label>
            <input
              className="set-input"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={() => commit('weight', weight)}
            />
          </div>
        </>
      )}

      <button
        className={`set-tick ${set.completed ? 'active' : ''}`}
        onClick={handleTick}
        aria-label="Mark set complete"
      >
        ✓
      </button>
      <button className="set-remove" onClick={onRemove} aria-label="Remove set">
        −
      </button>
    </div>
  );
}
