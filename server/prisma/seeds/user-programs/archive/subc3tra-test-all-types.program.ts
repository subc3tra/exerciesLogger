/**
 * TEST PROGRAM for subc3tra — covers reps+weight, duration, and distance tracked
 * fields in one day so the rest timer / duration Start-Stop timer / session logger
 * can all be exercised without touching real program data. Which fields an exercise
 * tracks is now determined by the shared Exercise's `trackedFields` (not a per-program
 * `unit` — that field was removed from ProgramExercise in the v0.1.4 schema change).
 * Copied from program.template.ts.
 *
 * Run from server/:
 *   npx tsx prisma/seeds/user-programs/subc3tra-test-all-types.program.ts
 *
 * Delete afterward with delete-program.ts (grab the id from `npx prisma studio`).
 */

const PROGRAM_DATA = {
  username: 'subc3tra',

  name: '🧪 Test — All Set Types',
  totalWeeks: 4,
  daysPerWeek: 1,

  days: [
    {
      name: 'Test Day',
      dayLabel: null as string | null,
      duration: null as string | null,
      sections: [
        {
          name: 'All Types',
          zone: null as string | null,
          sets: null as number | null,
          restSecs: null as number | null,
          exercises: [
            {
              name: 'Barbell Squat',
              targetSets: 3,
              targetReps: '8',
              targetWeight: 60,
              notes: null as string | null,
            },
            {
              name: 'Bench Press',
              targetSets: 3,
              targetReps: '8',
              targetWeight: 40,
              notes: null as string | null,
            },
            {
              name: 'Treadmill',
              targetSets: 1,
              targetReps: '300s',
              targetWeight: null as number | null,
              notes: 'Duration-type test exercise — use the Start/Stop timer here (Treadmill tracks duration + distance).',
            },
            {
              name: 'Rowing Machine',
              targetSets: 1,
              targetReps: '500m',
              targetWeight: null as number | null,
              notes: 'Distance-type test exercise.',
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (!PROGRAM_DATA.username) {
    throw new Error('Set PROGRAM_DATA.username to the target user before running this.');
  }

  if (PROGRAM_DATA.days.length !== PROGRAM_DATA.daysPerWeek) {
    throw new Error(
      `daysPerWeek (${PROGRAM_DATA.daysPerWeek}) must equal days.length (${PROGRAM_DATA.days.length}).`
    );
  }

  const user = await prisma.user.findFirst({ where: { username: PROGRAM_DATA.username } });
  if (!user) {
    throw new Error(`User "${PROGRAM_DATA.username}" not found — create them first with user.template.ts.`);
  }

  // resolve every exercise name to its global bank id — fail fast, before writing anything,
  // if any name doesn't match the seeded exercise bank exactly (case-insensitive)
  const allNames = PROGRAM_DATA.days.flatMap((day) =>
    day.sections.flatMap((section) => section.exercises.map((exercise) => exercise.name))
  );
  const bankExercises = await prisma.exercise.findMany({
    where: { userId: null },
    select: { id: true, name: true },
  });
  const exerciseIdByName = new Map(bankExercises.map((e) => [e.name.toLowerCase(), e.id]));

  const missing = [...new Set(allNames)].filter((name) => !exerciseIdByName.has(name.toLowerCase()));
  if (missing.length > 0) {
    throw new Error(
      `Exercise(s) not found in the bank: ${missing.join(', ')}. Add them to add.exercises.ts and re-run that seed first, or fix the name to match exactly.`
    );
  }

  const program = await prisma.program.create({
    data: {
      name: PROGRAM_DATA.name,
      totalWeeks: PROGRAM_DATA.totalWeeks,
      daysPerWeek: PROGRAM_DATA.daysPerWeek,
      userId: user.id,
      days: {
        create: PROGRAM_DATA.days.map((day, dayIndex) => ({
          name: day.name,
          dayLabel: day.dayLabel,
          duration: day.duration,
          order: dayIndex,
          sections: {
            create: day.sections.map((section, sectionIndex) => ({
              name: section.name,
              zone: section.zone,
              sets: section.sets,
              restSecs: section.restSecs,
              order: sectionIndex,
              exercises: {
                create: section.exercises.map((exercise, exerciseIndex) => ({
                  exerciseId: exerciseIdByName.get(exercise.name.toLowerCase())!,
                  targetSets: exercise.targetSets,
                  targetReps: exercise.targetReps,
                  targetWeight: exercise.targetWeight,
                  notes: exercise.notes,
                  order: exerciseIndex,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  console.log(`✅ Created program "${program.name}" (id ${program.id}) for "${PROGRAM_DATA.username}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
