import { useEffect, useRef, useState } from 'react';
import type { FocusEvent } from 'react';
import type { NumericField, PrefillSetEntry, SessionSet, TrackField } from '../types';
import { parseTargetNumber, resolveFieldDefault } from '../utils/setDefaults';
import { playBeep } from '../utils/beep';

type FieldValues = Partial<Record<NumericField, number | null>>;
type TimerPhase = 'idle' | 'countdown' | 'running';
// 'target' = pick a duration, count down to it, auto-stop + beep when it hits 0 (holds like
// planks). 'stopwatch' = count up freely, stop manually whenever (the original behavior).
type TimerMode = 'target' | 'stopwatch';

function formatTimerSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

// display-only formatting for the duration stepper — "40" stays "40s", "900" becomes "15:00"
function formatDurationDisplay(raw: string): string {
  if (raw === '') return '';
  const n = Number(raw);
  return Number.isNaN(n) ? raw : formatTimerSeconds(n);
}

const HOLD_REPEAT_DELAY_MS = 400;
const HOLD_REPEAT_INTERVAL_MS = 120;

interface StepperProps {
  value: string; // raw stored value, e.g. seconds for duration, plain number for everything else
  step: number;
  min?: number;
  disabled?: boolean;
  format?: (raw: string) => string; // display-only transform, e.g. seconds -> "1:10"
  parse?: (raw: string) => string; // typed text -> raw stored value
  // edit mode shows separate MM / SS numeric inputs instead of one text field — mobile's
  // numeric keypad (inputMode="decimal") has no colon key, so a single "type m:ss" field
  // is only enterable on desktop in practice. Ignored when the single-field path isn't used.
  dualEdit?: boolean;
  onChange: (raw: string) => void; // fires live, on every step and on typed commit
  onCommit: (raw: string) => void; // fires once, when the interaction (hold or edit) ends
}

// +/- stepper with tap-to-type fallback — built for mobile, where dragging a number-input's
// tiny spinner arrows or fighting the on-screen keyboard for a one-rep change is annoying.
// Holding +/- auto-repeats after a short delay; tapping the value swaps in a real text input
// for jumping straight to a specific number (e.g. typing "15:00" for a long stretch hold).
function Stepper({ value, step, min = 0, disabled, format, parse, dualEdit, onChange, onCommit }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [editMin, setEditMin] = useState('');
  const [editSec, setEditSec] = useState('');
  const valueRef = useRef(value);
  const secInputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function applyStep(delta: number) {
    const current = Number(valueRef.current) || 0;
    const next = Math.max(min, Math.round((current + delta) * 100) / 100);
    valueRef.current = String(next);
    onChange(valueRef.current);
  }

  function startHold(delta: number) {
    if (disabled) return;
    activeRef.current = true;
    applyStep(delta);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => applyStep(delta), HOLD_REPEAT_INTERVAL_MS);
    }, HOLD_REPEAT_DELAY_MS);
  }

  function stopHold() {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    onCommit(valueRef.current);
  }

  function startEditing() {
    if (disabled) return;
    if (dualEdit) {
      const total = value === '' ? null : Number(value) || 0;
      setEditMin(total === null ? '' : String(Math.floor(total / 60)));
      setEditSec(total === null ? '' : String(total % 60).padStart(2, '0'));
    } else {
      setDraft(value);
    }
    setEditing(true);
  }

  function finishEditing() {
    const normalized = parse ? parse(draft) : draft;
    setEditing(false);
    onChange(normalized);
    onCommit(normalized);
  }

  function finishDualEditing() {
    const normalized = editMin === '' && editSec === ''
      ? ''
      : String((Number(editMin) || 0) * 60 + (Number(editSec) || 0));
    setEditing(false);
    onChange(normalized);
    onCommit(normalized);
  }

  // fires when focus leaves the MM/SS pair entirely (not when it just moves between the two
  // inputs) — same "commit on blur" behavior as the single-field path
  function handleDualBlur(e: FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    finishDualEditing();
  }

  const display = format ? format(value) : value;

  return (
    <div className="set-stepper">
      <button
        type="button"
        className="set-stepper-btn"
        disabled={disabled}
        aria-label="Decrease"
        onPointerDown={() => startHold(-step)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        −
      </button>

      {editing && dualEdit ? (
        <div className="set-stepper-duration-edit" onBlur={handleDualBlur}>
          <input
            className="set-stepper-input set-stepper-input-duration"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            placeholder="mm"
            autoFocus
            value={editMin}
            onChange={(e) => setEditMin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); secInputRef.current?.focus(); } }}
          />
          <span className="set-stepper-duration-sep">:</span>
          <input
            ref={secInputRef}
            className="set-stepper-input set-stepper-input-duration"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="ss"
            value={editSec}
            onChange={(e) => setEditSec(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        </div>
      ) : editing ? (
        <input
          className="set-stepper-input"
          type="text"
          inputMode="decimal"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        />
      ) : (
        <span
          className="set-stepper-value"
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={startEditing}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEditing(); } }}
        >
          {display === '' ? '–' : display}
        </span>
      )}

      <button
        type="button"
        className="set-stepper-btn"
        disabled={disabled}
        aria-label="Increase"
        onPointerDown={() => startHold(step)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        +
      </button>
    </div>
  );
}

interface SetRowProps {
  set: SessionSet;
  trackedFields: TrackField[];
  target: { targetReps: string | null; targetWeight: number | null };
  previous?: PrefillSetEntry;
  onFieldCommit: (field: NumericField, value: number | null) => void;
  onToggleComplete: (fields?: FieldValues) => void;
  onRemove: () => void;
}

export function SetRow({ set, trackedFields, target, previous, onFieldCommit, onToggleComplete, onRemove }: SetRowProps) {
  const targetNumber = parseTargetNumber(target.targetReps);

  const [reps, setReps] = useState(String(resolveFieldDefault(set.reps, previous?.reps ?? null, targetNumber)));
  const [weight, setWeight] = useState(String(resolveFieldDefault(set.weight, previous?.weight ?? null, target.targetWeight)));
  const [duration, setDuration] = useState(String(resolveFieldDefault(set.duration, previous?.duration ?? null, targetNumber)));
  const [distance, setDistance] = useState(String(resolveFieldDefault(set.distance, previous?.distance ?? null, targetNumber)));

  const [timerPhase, setTimerPhase] = useState<TimerPhase>('idle');
  const [timerMode, setTimerMode] = useState<TimerMode>('target');
  const [countdownValue, setCountdownValue] = useState(3);
  const [timerElapsed, setTimerElapsed] = useState(0); // stopwatch mode: seconds counted up
  const [remaining, setRemaining] = useState(0); // target mode: seconds counted down
  const timerStartRef = useRef<number | null>(null);
  const targetSecondsRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  function commit(field: NumericField, raw: string) {
    const current = set[field];
    const parsed = raw === '' ? null : Number(raw);
    if (parsed === current) return;
    onFieldCommit(field, parsed);
  }

  useEffect(() => {
    if (timerPhase === 'countdown') {
      if (countdownValue <= 0) {
        timerStartRef.current = Date.now();
        setTimerPhase('running');
        return;
      }
      const timeout = setTimeout(() => setCountdownValue((v) => v - 1), 1000);
      return () => clearTimeout(timeout);
    }
    if (timerPhase === 'running' && timerMode === 'stopwatch') {
      const interval = setInterval(() => {
        if (timerStartRef.current) {
          setTimerElapsed(Math.floor((Date.now() - timerStartRef.current) / 1000));
        }
      }, 250);
      return () => clearInterval(interval);
    }
    if (timerPhase === 'running' && timerMode === 'target') {
      if (remaining <= 0) {
        // hit zero on its own — done, log the full target duration and signal completion
        setTimerPhase('idle');
        setDuration(String(targetSecondsRef.current));
        commit('duration', String(targetSecondsRef.current));
        playBeep(audioCtxRef.current);
        if ('vibrate' in navigator) navigator.vibrate(200);
        return;
      }
      const timeout = setTimeout(() => setRemaining((r) => r - 1), 1000);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerPhase, countdownValue, timerMode, remaining]);

  function handleTimerClick() {
    if (timerPhase === 'idle') {
      if (timerMode === 'target') {
        const target = Number(duration);
        if (!target || target <= 0) return; // set a duration on the stepper first
        targetSecondsRef.current = target;
        setRemaining(target);
      }
      // create the AudioContext on this same tap so it's already unlocked by the time the
      // beep needs to fire later, when there's no user gesture to piggyback on
      if (!audioCtxRef.current) {
        try {
          audioCtxRef.current = new AudioContext();
        } catch {
          // Web Audio unsupported — timer still works visually
        }
      }
      setCountdownValue(3);
      setTimerElapsed(0);
      setTimerPhase('countdown');
      return;
    }
    if (timerPhase === 'countdown') {
      setTimerPhase('idle');
      return;
    }
    // running -> manual stop, log whatever time was actually spent
    timerStartRef.current = null;
    setTimerPhase('idle');
    const actual = timerMode === 'stopwatch' ? timerElapsed : targetSecondsRef.current - remaining;
    setDuration(String(actual));
    commit('duration', String(actual));
  }

  function handleTick() {
    if (set.completed) {
      onToggleComplete();
      return;
    }

    const fields: FieldValues = {};
    if (trackedFields.includes('REPS')) fields.reps = reps === '' ? null : Number(reps);
    if (trackedFields.includes('WEIGHT')) fields.weight = weight === '' ? null : Number(weight);
    if (trackedFields.includes('DURATION')) fields.duration = duration === '' ? null : Number(duration);
    if (trackedFields.includes('DISTANCE')) fields.distance = distance === '' ? null : Number(distance);

    onToggleComplete(fields);
  }

  function renderField(field: TrackField) {
    if (field === 'DURATION') {
      const noTarget = timerMode === 'target' && (!duration || Number(duration) <= 0);
      return (
        <div className="set-field" key={field}>
          <label className="set-field-label">min:sec</label>
          <Stepper
            value={duration}
            step={5}
            disabled={timerPhase !== 'idle'}
            format={formatDurationDisplay}
            dualEdit
            onChange={setDuration}
            onCommit={(next) => commit('duration', next)}
          />
          <div className="set-timer-mode" role="group" aria-label="Timer mode">
            <button
              type="button"
              className={`set-timer-mode-btn ${timerMode === 'target' ? 'active' : ''}`}
              disabled={timerPhase !== 'idle'}
              onClick={() => setTimerMode('target')}
            >
              Set time
            </button>
            <button
              type="button"
              className={`set-timer-mode-btn ${timerMode === 'stopwatch' ? 'active' : ''}`}
              disabled={timerPhase !== 'idle'}
              onClick={() => setTimerMode('stopwatch')}
            >
              Stopwatch
            </button>
          </div>
          <button
            type="button"
            className={`set-timer-button ${timerPhase}`}
            disabled={timerPhase === 'idle' && noTarget}
            title={noTarget ? 'Set a duration above first' : undefined}
            onClick={handleTimerClick}
          >
            {timerPhase === 'idle' && 'Start'}
            {timerPhase === 'countdown' && countdownValue}
            {timerPhase === 'running' && timerMode === 'stopwatch' && `Stop · ${formatTimerSeconds(timerElapsed)}`}
            {timerPhase === 'running' && timerMode === 'target' && `Stop · ${formatTimerSeconds(remaining)}`}
          </button>
        </div>
      );
    }

    if (field === 'DISTANCE') {
      return (
        <div className="set-field" key={field}>
          <label className="set-field-label">meters</label>
          <Stepper
            value={distance}
            step={5}
            onChange={setDistance}
            onCommit={(next) => commit('distance', next)}
          />
        </div>
      );
    }

    if (field === 'WEIGHT') {
      return (
        <div className="set-field" key={field}>
          <label className="set-field-label">kg</label>
          <Stepper
            value={weight}
            step={2.5}
            onChange={setWeight}
            onCommit={(next) => commit('weight', next)}
          />
        </div>
      );
    }

    // REPS
    return (
      <div className="set-field" key={field}>
        <label className="set-field-label">reps</label>
        <Stepper
          value={reps}
          step={1}
          onChange={setReps}
          onCommit={(next) => commit('reps', next)}
        />
      </div>
    );
  }

  return (
    <div className={`set-row ${set.completed ? 'completed' : ''}`}>
      <span className="set-number">#{set.setNumber}</span>

      <div className="set-fields">{trackedFields.map((field) => renderField(field))}</div>

      <div className="set-actions">
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
    </div>
  );
}
