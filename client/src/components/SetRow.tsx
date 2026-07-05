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

// first time this exact set has ever been logged: default the input to the plan's target instead
// of leaving it blank, so tapping done without typing anything still saves real numbers
function initialValue(actual: number | null, hasPriorHistory: boolean, target: number | null): string {
  if (actual != null) return actual.toString();
  if (hasPriorHistory) return '';
  return target != null ? target.toString() : '';
}

export function SetRow({ set, unit, target, previous, onFieldCommit, onToggleComplete, onRemove }: SetRowProps) {
  const targetNumber = parseTargetNumber(target.targetReps);

  const [reps, setReps] = useState(initialValue(set.reps, previous?.reps != null, targetNumber));
  const [weight, setWeight] = useState(initialValue(set.weight, previous?.weight != null, target.targetWeight));
  const [duration, setDuration] = useState(initialValue(set.duration, previous?.duration != null, targetNumber));
  const [distance, setDistance] = useState(initialValue(set.distance, previous?.distance != null, targetNumber));

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
        <input
          className="set-input"
          type="number"
          inputMode="numeric"
          placeholder={previous?.duration != null ? `${previous.duration}s last time` : 'sec'}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          onBlur={() => commit('duration', duration)}
        />
      ) : unit === 'm' ? (
        <input
          className="set-input"
          type="number"
          inputMode="decimal"
          placeholder={previous?.distance != null ? `${previous.distance}m last time` : 'meters'}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          onBlur={() => commit('distance', distance)}
        />
      ) : (
        <>
          <input
            className="set-input"
            type="number"
            inputMode="numeric"
            placeholder={previous?.reps != null ? `${previous.reps} last time` : 'reps'}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onBlur={() => commit('reps', reps)}
          />
          <input
            className="set-input"
            type="number"
            inputMode="decimal"
            placeholder={previous?.weight != null ? `${previous.weight}kg last time` : 'kg'}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => commit('weight', weight)}
          />
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
