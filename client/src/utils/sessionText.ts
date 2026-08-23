import type { SessionDetail, SessionSet, TrackField } from '../types';
import { groupBySection } from './groupBySection';
import { formatElapsed } from './time';

// One line per set, only the fields that exercise actually tracks, only completed sets — matches
// what the summary modal's own totals count. Joined with " · " rather than fussing over "@" vs
// "·" per field combo; reads fine either way and stays simple.
export function formatSetLine(set: SessionSet, trackedFields: TrackField[]): string {
  const parts: string[] = [];
  if (trackedFields.includes('REPS') && set.reps != null) parts.push(`${set.reps} reps`);
  if (trackedFields.includes('WEIGHT') && set.weight != null) parts.push(`${set.weight}kg`);
  if (trackedFields.includes('DURATION') && set.duration != null) parts.push(formatElapsed(set.duration));
  if (trackedFields.includes('DISTANCE') && set.distance != null) parts.push(`${set.distance}m`);
  return parts.length > 0 ? parts.join(' · ') : '–';
}

// Plain-text export of a full session — every exercise, every completed set, reps/weight/
// duration/distance as applicable. Built for pasting into a third-party tracker (Whoop etc.) that
// wants the raw workout content, not this app's own formatting.
export function formatSessionAsText(session: SessionDetail, elapsedSeconds: number): string {
  const lines: string[] = [
    `Week ${session.weekNumber} · Day ${session.dayNumber}`,
    `Duration: ${formatElapsed(elapsedSeconds)}`,
    '',
  ];

  for (const group of groupBySection(session.exercises)) {
    for (const exercise of group.exercises) {
      const completedSets = exercise.sets.filter((s) => s.completed);
      if (completedSets.length === 0) continue;

      lines.push(exercise.programExercise.exercise.name);
      for (const set of completedSets) {
        lines.push(`  ${set.setNumber}: ${formatSetLine(set, exercise.programExercise.exercise.trackedFields)}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}
