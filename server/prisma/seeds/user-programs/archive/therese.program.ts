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
 * - Every field can be `null` except `name` fields and `targetSets` on an
 *   exercise. Use `null`, not an empty string or a placeholder like "TBD".
 * - Don't add fields beyond what's shown here — anything extra is silently
 *   ignored, it won't error, so a typo'd field name just quietly does nothing.
 * - Don't set `order` anywhere — it's computed automatically from each item's
 *   position in its array, so the array order IS the workout order.
 * - An exercise's `name` must match an entry in `docs/exercise-list.md`
 *   (the seeded global exercise bank) exactly, case-insensitive — the script
 *   resolves each name to its `Exercise.id` before writing anything. If a name
 *   doesn't match, it fails fast and lists every unmatched name, rather than
 *   creating a partial program. If the exercise genuinely doesn't exist yet,
 *   add it to `docs/exercise-list.md` + `sync-exercises.ts`'s `EXERCISES` array
 *   and re-run that seed first (`add.exercises.ts` is frozen, see DECISIONS.md).
 * ============================================================================
 *
 * NOTE (Claude, generated from docs/user-programs-raw/therese.program.md):
 * source doc had no `totalWeeks` — defaulted to 4 to match the base template,
 * same as rene.program.ts. ADJUST if Therese's plan runs a different length.
 *
 * Seven exercises this program needed didn't exist in the bank and have since
 * been added (docs/exercise-list.md + sync-exercises.ts) — Terminal Knee
 * Extension, Seated Calf Raise, Single-Leg Glute Bridge, Side-Lying Hip
 * Abduction, Copenhagen Adductor, Hip Flexor Stretch, Standing Hip Flexor
 * Stretch. Run `npx tsx prisma/seeds/sync-exercises.ts` against the target
 * environment (if not already done there) before running this file.
 *
 * Two source exercises were matched to the closest existing bank entry rather
 * than an exact name (flag if this substitution isn't acceptable):
 *   - "Step-up (lågt steg 15–20 cm)" → Dumbbell Step-Up
 *   - "Hip Abduction maskin" → Cable Hip Abduction (machine vs. cable — same
 *     movement pattern, different equipment)
 *   - "Leg Curl (liggande eller sittande)" → Seated Leg Curl (source doc
 *     allows either variant; seated picked for consistency with the pattern
 *     already used in rene.program.ts)
 */

const PROGRAM_DATA = {
  username: 'therese' as string | null, // MATTIAS: set this — the AI leaves it null on purpose

  name: 'Ben & Rumpa 3 dagar/vecka',
  totalWeeks: 4, // ADJUST — not specified in therese.program.md, defaulted to match the base template
  daysPerWeek: 3,

  days: [
    {
      name: 'Dag A – Quad & knästabilitet',
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
              name: 'Leg Press',
              targetSets: 3,
              targetReps: '10-12',
              targetWeight: null as number | null,
              notes: 'Högt fotläge ger mer glutes/hamstrings och minskar knästress.',
            },
            {
              name: 'Terminal Knee Extension',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null as number | null,
              notes: 'Med band. VMO-aktivering, klassisk övning efter knäprotes.',
            },
            {
              name: 'Dumbbell Step-Up',
              targetSets: 3,
              targetReps: '8/ben',
              targetWeight: null as number | null,
              notes: 'Lågt steg 15–20 cm. Kontrollerad knäbelastning – höj steget när smärtfritt.',
            },
            {
              name: 'Cable Hip Abduction',
              targetSets: 3,
              targetReps: '12-15',
              targetWeight: null as number | null,
              notes: 'Stärker glute med och stödjer höftstabilitet.',
            },
            {
              name: 'Seated Calf Raise',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Skyddar knät och stärker underbenet.',
            },
          ],
        },
      ],
    },
    {
      name: 'Dag B – Glute & höft',
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
              name: 'Hip Thrust',
              targetSets: 3,
              targetReps: '10-12',
              targetWeight: null as number | null,
              notes: 'Primär gluteövning med minimal knäkompression.',
            },
            {
              name: 'Romanian Deadlift',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null as number | null,
              notes: 'Höftgångjärn och hamstrings – börja lätt och känn in.',
            },
            {
              name: 'Single-Leg Glute Bridge',
              targetSets: 3,
              targetReps: '10/ben',
              targetWeight: null as number | null,
              notes: 'Tränar glute med och min, stödjer höftstabilitet.',
            },
            {
              name: 'Side-Lying Hip Abduction',
              targetSets: 3,
              targetReps: '15/sida',
              targetWeight: null as number | null,
              notes: 'Enkel dosering direkt på höften.',
            },
            {
              name: 'Hip Flexor Stretch',
              targetSets: 3,
              targetReps: '45s/sida',
              targetWeight: null as number | null,
              notes: 'Hållen. Strama höftböjare bidrar ofta till höftsmärta – ta tid på den.',
            },
          ],
        },
      ],
    },
    {
      name: 'Dag C – Kombination & funktionell styrka',
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
              name: 'Goblet Squat',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null as number | null,
              notes: 'Lågt djup – kontrollerat, hon avgör range efter känsla.',
            },
            {
              name: 'Hip Thrust',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null as number | null,
              notes: 'Möjlighet att öka vikt från pass B.',
            },
            {
              name: 'Seated Leg Curl',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Liggande eller sittande fungerar. Isolerad hamstring, knävänlig.',
            },
            {
              name: 'Copenhagen Adductor',
              targetSets: 3,
              targetReps: '8-10/sida',
              targetWeight: null as number | null,
              notes: 'Modifierad. Adduktorer och höftstabilitet – enklare variant på knä om det behövs.',
            },
            {
              name: 'Standing Hip Flexor Stretch',
              targetSets: 3,
              targetReps: '45s/sida',
              targetWeight: null as number | null,
              notes: 'Avsluta passet med rörlighet i höftböjarna.',
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
