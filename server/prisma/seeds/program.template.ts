/**
 * PROGRAM TEMPLATE — describes one full training program (days, sections, exercises)
 * as a plain data object, then creates it in the database.
 *
 * ============================================================================
 * FOR MATTIAS
 * ============================================================================
 * Workflow:
 *   1. Copy this file (e.g. `alice-strength.ts`) so you keep a record of what
 *      you generated for each user.
 *   2. Hand the copy to an AI along with the user's preferences (goals, days
 *      per week, equipment, injuries, etc). Tell it to fill in PROGRAM_DATA
 *      only, following the rules in the "FOR THE AI" block below.
 *   3. Set `username` to the target user (the AI won't know this — it's your job).
 *   4. Sanity-check the filled-in file, then run it from server/:
 *        npx tsx prisma/seeds/<your-file>.ts
 *   5. Made a mistake or the user wants a redo? See delete-program.ts — it wipes
 *      one program cleanly (grab the id from `npx prisma studio` first).
 *
 * ============================================================================
 * FOR THE AI FILLING THIS IN
 * ============================================================================
 * - Only edit the PROGRAM_DATA object below. Everything after the
 *   "DO NOT EDIT BELOW THIS LINE" marker talks to the database directly —
 *   changing it risks writing to the wrong table or the wrong user.
 * - Do not set `username` — leave it as-is. Mattias fills that in himself.
 * - `daysPerWeek` MUST equal `days.length`, exactly. The app picks which day to
 *   run next as `days[sessionCount % daysPerWeek]`, so a mismatch either skips
 *   a day forever or crashes the app when it indexes past the end of the array.
 * - `targetReps` is always a STRING, even for a single number: write '8', not 8.
 *   It supports ranges ('6-8') and unit-suffixed values ('30s', '20m') for
 *   timed/distance work.
 * - `unit` must be exactly one of: 'reps', 's', 'm' — nothing else.
 *     'reps' -> normal strength work, logged as reps + weight.
 *     's'    -> timed work (plank, sprint), logged as a duration in seconds.
 *     'm'    -> distance work (farmer's carry), logged as a distance in meters.
 *   Match `targetReps`'s suffix to `unit`, e.g. unit: 's' with targetReps: '30s'.
 * - Every field can be `null` except `name` fields and `unit`/`targetSets` on an
 *   exercise. Use `null`, not an empty string or a placeholder like "TBD".
 * - Don't add fields beyond what's shown here — anything extra is silently
 *   ignored, it won't error, so a typo'd field name just quietly does nothing.
 * - Don't set `order` anywhere — it's computed automatically from each item's
 *   position in its array, so the array order IS the workout order.
 * - An exercise's `name` must match an entry in `server/docs/exercise-list.md`
 *   (the seeded global exercise bank) exactly, case-insensitive — the script
 *   resolves each name to its `Exercise.id` before writing anything. If a name
 *   doesn't match, it fails fast and lists every unmatched name, rather than
 *   creating a partial program. If the exercise genuinely doesn't exist yet,
 *   add it to `add.exercises.ts` and re-run that seed first.
 * ============================================================================
 */

const PROGRAM_DATA = {
  username: null as string | null, // MATTIAS: set this — the AI leaves it null on purpose

  name: 'Example Program', // e.g. "Styrka & Form"
  totalWeeks: 4, // how many weeks this program runs before it's considered complete
  daysPerWeek: 2, // MUST equal days.length below

  days: [
    {
      name: 'Day A', // e.g. "Push Day", "Workout 1"
      dayLabel: null as string | null, // optional short label, e.g. "Mån + Fre"
      duration: null as string | null, // optional, e.g. "ca 50 min"
      sections: [
        {
          name: 'Main Workout', // e.g. "Superset 1 - Uppvärmning"
          zone: null as string | null, // optional, e.g. "Zon 1 - TRX-stationen"
          sets: null as number | null, // optional target sets for the whole section
          restSecs: null as number | null, // optional rest between sets, in seconds
          exercises: [
            {
              name: 'Barbell Squat',
              targetSets: 3,
              targetReps: '8', // string — see rules above
              targetWeight: null as number | null, // starting weight baseline, or null
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: null as string | null, // optional coaching note, e.g. "go slow on the way down"
            },
            {
              name: 'Plank',
              targetSets: 3,
              targetReps: '30s',
              targetWeight: null as number | null,
              unit: 's' as 'reps' | 's' | 'm',
              notes: null as string | null,
            },
          ],
        },
      ],
    },
    {
      name: 'Day B',
      dayLabel: null as string | null,
      duration: null as string | null,
      sections: [
        {
          name: 'Main Workout',
          zone: null as string | null,
          sets: null as number | null,
          restSecs: null as number | null,
          exercises: [
            {
              name: 'Deadlift',
              targetSets: 3,
              targetReps: '6',
              targetWeight: null as number | null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: null as string | null,
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
                  unit: exercise.unit,
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
