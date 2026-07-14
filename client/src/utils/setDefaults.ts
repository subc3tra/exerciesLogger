import type { NumericField, PrefillSetEntry, TrackField } from '../types';

// targetReps is a flexible display string ("6–8", "20s", "30m") — pull the first number out of it
export function parseTargetNumber(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

// the default for an untouched field: the actual value already saved for this set, else last
// session's actual number for this same set, else the plan's target, else 0. Always a real,
// editable number — never a silent null, so a set can never get completed with a blank field
// that quietly breaks downstream math (e.g. total volume needing weight * reps).
export function resolveFieldDefault(actual: number | null, previousValue: number | null, target: number | null): number {
  if (actual != null) return actual;
  if (previousValue != null) return previousValue;
  return target ?? 0;
}

interface SetLike {
  reps: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
}

// resolves the same defaults SetRow shows for each tracked field on a set — used both for SetRow's
// initial input state and for bulk-completing sets the user never individually ticked, so both
// paths agree on "what would have been saved" instead of the bulk path silently dropping fields.
export function resolveSetDefaults(
  trackedFields: TrackField[],
  set: SetLike,
  previous: PrefillSetEntry | undefined,
  target: { targetReps: string | null; targetWeight: number | null }
): Partial<Record<NumericField, number>> {
  const targetNumber = parseTargetNumber(target.targetReps);
  const fields: Partial<Record<NumericField, number>> = {};
  if (trackedFields.includes('REPS')) fields.reps = resolveFieldDefault(set.reps, previous?.reps ?? null, targetNumber);
  if (trackedFields.includes('WEIGHT')) fields.weight = resolveFieldDefault(set.weight, previous?.weight ?? null, target.targetWeight);
  if (trackedFields.includes('DURATION')) fields.duration = resolveFieldDefault(set.duration, previous?.duration ?? null, targetNumber);
  if (trackedFields.includes('DISTANCE')) fields.distance = resolveFieldDefault(set.distance, previous?.distance ?? null, targetNumber);
  return fields;
}
