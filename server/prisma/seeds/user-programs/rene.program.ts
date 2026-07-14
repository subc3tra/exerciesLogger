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
 *   add it to `add.exercises.ts` and re-run that seed first.
 * ============================================================================
 *
 * NOTE (Claude, 2026-07-14): this file requires two bank additions that don't
 * exist yet — "Cardio (Walk/Bike/Swim)" (CARDIO) and "Mobility & Stretching"
 * (RECOVERY, a brand-new ExerciseCategory value not yet in schema.prisma).
 * Do not run this seed until both the RECOVERY enum migration and the two new
 * Exercise rows exist in the DB — it will fail fast on the name-resolution
 * check otherwise. See session note for the full proposal.
 */

const PROGRAM_DATA = {
  username: null as string | null, // MATTIAS: set this — the AI leaves it null on purpose

  name: 'Styrka & Kondition 5-dagar', // ADJUST if you want a different display name
  totalWeeks: 4, // ADJUST — not specified in rene.program.md, defaulted to match the base template
  daysPerWeek: 5,

  days: [
    {
      name: 'Dag A – Överkropp Push & Pull',
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
              name: 'Bench Press',
              targetSets: 4,
              targetReps: '6-8',
              targetWeight: null as number | null,
              notes: 'Kör med kontrollerad sänkning, ca 2 sek ner. Fokus på att känna bröstmuskeln – inte bara trycka upp vikten.',
            },
            {
              name: 'Seated Cable Row',
              targetSets: 4,
              targetReps: '8-10',
              targetWeight: null as number | null,
              notes: 'Dra med armbågarna nära kroppen, håll axlarna nere. Håll en sekund i slutläget och känn kontraktionen i ryggen.',
            },
            {
              name: 'Incline Dumbbell Chest Press',
              targetSets: 3,
              targetReps: '10-12',
              targetWeight: null as number | null,
              notes: 'Max 30–45° vinkel på bänken – högre vinkel belastar axeln onödigt. Hantelpress ger bättre rörelsefrihet än stång här.',
            },
            {
              name: 'Face Pulls',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null as number | null,
              notes: 'Viktig övning för axelstabilitet – hoppa inte över den. Dra mot ansiktet, armbågarna högt, avsluta med händerna utåt.',
            },
            {
              name: 'Dips',
              targetSets: 3,
              targetReps: '8-12',
              targetWeight: null as number | null,
              notes: 'Luta dig något framåt för mer bröst, stanna rak för mer tricep. Skippa om axeln protesterar.',
            },
            {
              name: 'Dumbbell Bicep Curl',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Håll armbågarna stilla vid sidan. Ingen svikt – om du behöver svänga är vikten för tung.',
            },
            {
              name: 'Triceps Pushdown',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Håll armbågarna vid kroppen. Pressa hela vägen ner och kontrollera tillbaka.',
            },
          ],
        },
      ],
    },
    {
      name: 'Dag B – Ben',
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
              targetSets: 4,
              targetReps: '10-12',
              targetWeight: null as number | null,
              notes: 'Placera fötterna högt upp på plattan – det avlastar knäna och aktiverar mer bakben. Gå inte så djupt att ländryggen lossar från ryggstödet.',
            },
            {
              name: 'Romanian Deadlift',
              targetSets: 4,
              targetReps: '8-10',
              targetWeight: null as number | null,
              notes: 'Håll ryggen rak och sänk stången längs benen. Du ska känna dragning i baksidan av låret – inte i ländryggen.',
            },
            {
              name: 'Seated Leg Curl',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Kontrollera hela rörelsen, särskilt på väg upp. Sittande variant är skonsam för knäleden.',
            },
            {
              name: 'Leg Extension',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null as number | null,
              notes: 'Kör med lätt–medel vikt och full rörelse. Bra för att stärka upp knäna successivt.',
            },
            {
              name: 'Dumbbell Step-Up',
              targetSets: 3,
              targetReps: '10/ben',
              targetWeight: null as number | null,
              notes: 'Knäsnällare än lunges. Håll överkroppen rak och tryck upp genom hälen – inte tårna.',
            },
            {
              name: 'Standing Calf Raise',
              targetSets: 4,
              targetReps: '15',
              targetWeight: null as number | null,
              notes: 'Full rörelse – hela vägen ner för stretch, hela vägen upp. Kan göras stående eller i benpressmaskin.',
            },
          ],
        },
      ],
    },
    {
      name: 'Dag C – Kondition & Core',
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
              name: 'Sled Push/Pull',
              targetSets: 6,
              targetReps: '35m',
              targetWeight: null as number | null,
              notes: 'Kontrollerat tempo – det här är inte sprint, det är uthållighet. Vila tills pulsen lugnat sig något mellan seten.',
            },
            {
              name: 'Rowing Machine',
              targetSets: 3,
              targetReps: '500m',
              targetWeight: null as number | null,
              notes: 'Håll jämnt tempo hela vägen, undvik att gå ut för hårt. Skonsam för knän och axlar.',
            },
            {
              name: 'Farmers Carry',
              targetSets: 4,
              targetReps: '30m',
              targetWeight: null as number | null,
              notes: 'Gå med rak rygg, axlarna bakåt och ner. Tränar core, grepp och kondition samtidigt – underskattat.',
            },
            {
              name: 'Plank',
              targetSets: 3,
              targetReps: '40s',
              targetWeight: null as number | null,
              notes: 'Håll kroppen rak – ingen höft upp eller ner. Andas lugnt.',
            },
            {
              name: 'Cable Crunch',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null as number | null,
              notes: 'Kör från knästående, dra neråt med buken – inte med nacken. Håll spänningen hela vägen.',
            },
          ],
        },
      ],
    },
    {
      name: 'Dag D – Överkropp Pull & Marklyft',
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
              targetSets: 4,
              targetReps: '4-6',
              targetWeight: null as number | null,
              notes: 'Stång nära kroppen hela vägen, låt höfterna driva upp i toppläget. Ta ordentligt med vila mellan seten (2–3 min).',
            },
            {
              name: 'Chin-Up',
              targetSets: 4,
              targetReps: '8-10',
              targetWeight: null as number | null,
              notes: 'Underhandsgrepp. Om du kör fast, ta kortare vila eller gör färre reps per set snarare än att fuska med teknik.',
            },
            {
              name: 'Single-Arm Dumbbell Row',
              targetSets: 3,
              targetReps: '10/sida',
              targetWeight: null as number | null,
              notes: 'Stöd dig ordentligt. Dra med armbågen, inte med handen – tänk att du startar rörelsen med ryggen.',
            },
            {
              name: 'Rear Delt Fly',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null as number | null,
              notes: 'Lätt vikt, kontrollerat. Viktigt för axelbalansen – kompenserar för allt horisontalt tryck i dag A.',
            },
            {
              name: 'Shrugs',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Rakt upp och ner – ingen rotation. Håll en sekund i toppläget.',
            },
            {
              name: 'Hammer Curl',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null as number | null,
              notes: 'Neutralt grepp (tummen upp). Tränar underarmen och bicep på ett sätt som är direkt användbart för grappling.',
            },
          ],
        },
      ],
    },
    {
      name: 'Dag E – Aktiv Återhämtning',
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
              name: 'Cardio (Walk/Bike/Swim)',
              targetSets: 1,
              targetReps: '30-45min',
              targetWeight: null as number | null,
              notes: 'Lugnt tempo, ingen press. Syftet är blodcirkulation och återhämtning – inte träning.',
            },
            {
              name: 'Mobility & Stretching',
              targetSets: 1,
              targetReps: '15min',
              targetWeight: null as number | null,
              notes: 'Fokus på höfter och axlar. Särskilt viktigt med BJJ i schemat – rörliga höfter är ett direkt verktyg på mattan.',
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
