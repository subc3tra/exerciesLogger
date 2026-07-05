import { useState } from 'react';
import type { PrefillSetEntry, SessionSet } from '../types';

type NumericField = 'reps' | 'weight' | 'duration' | 'distance';

interface SetRowProps {
  set: SessionSet;
  unit: string | null;
  previous?: PrefillSetEntry;
  onFieldCommit: (field: NumericField, value: number | null) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
}

export function SetRow({ set, unit, previous, onFieldCommit, onToggleComplete, onRemove }: SetRowProps) {
  const [reps, setReps] = useState(set.reps?.toString() ?? '');
  const [weight, setWeight] = useState(set.weight?.toString() ?? '');
  const [duration, setDuration] = useState(set.duration?.toString() ?? '');
  const [distance, setDistance] = useState(set.distance?.toString() ?? '');

  function commit(field: NumericField, raw: string) {
    const current = set[field];
    const parsed = raw === '' ? null : Number(raw);
    if (parsed === current) return;
    onFieldCommit(field, parsed);
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
        onClick={onToggleComplete}
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
