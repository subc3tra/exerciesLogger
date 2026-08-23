import type { SectionRef, SessionExerciseDetail } from '../types';

export interface ExerciseSectionGroup {
  section: SectionRef;
  exercises: SessionExerciseDetail[];
}

// groups session exercises by their program section (e.g. "Uppvärmning" / "Huvudpast") — mirrors
// the same grouping the Program overview page shows. Shared by the live Session Logger, the
// post-session summary, and the plain-text export, so all three present exercises in the same
// order the user actually saw them in.
export function groupBySection(exercises: SessionExerciseDetail[]): ExerciseSectionGroup[] {
  const groups = new Map<number, ExerciseSectionGroup>();
  for (const exercise of exercises) {
    const { section } = exercise.programExercise;
    if (!groups.has(section.id)) groups.set(section.id, { section, exercises: [] });
    groups.get(section.id)!.exercises.push(exercise);
  }
  return Array.from(groups.values()).sort((a, b) => a.section.order - b.section.order);
}
