/**
 * PROGRAM TEMPLATE — describes one full training program (days, sections, exercises)
 * as a plain data object, then creates it in the database.
 */

const PROGRAM_DATA = {
  username: 'miAmor' as string | null,

  name: 'Styrka & Underhåll – 5 veckor',
  totalWeeks: 5,
  daysPerWeek: 3,

  days: [
    {
      name: 'Pass A',
      dayLabel: null,
      duration: 'ca 40 min',
      sections: [
        {
          name: 'Prehab – Höft & Rygg',
          zone: null,
          sets: null,
          restSecs: null,
          exercises: [
            {
              name: '90/90 Hip Rotation',
              targetSets: 2,
              targetReps: '8',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Kontrollerad rotation i båda riktningar. Håll 2s i slutläge.',
            },
            {
              name: 'Deadbug',
              targetSets: 2,
              targetReps: '8',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Sträck motsatt arm och ben simultant. Ländryggen pressad mot golvet hela tiden.',
            },
          ],
        },
        {
          name: 'Huvudlyft',
          zone: null,
          sets: null,
          restSecs: 150,
          exercises: [
            {
              name: 'Marklyft',
              targetSets: 4,
              targetReps: '4',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'V1–2: RPE 7. V3–4: +2.5–5 kg om RPE < 7 på sista set. V5: toppsett.',
            },
          ],
        },
        {
          name: 'Accessory',
          zone: null,
          sets: null,
          restSecs: 90,
          exercises: [
            {
              name: 'Back Extension (viktad)',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Håll 2s i topp. Kontrollerat ned. Öka vikt när alla reps känns lätta.',
            },
            {
              name: 'Face Pulls',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Extern rotation i topp. Kabeln i ögonhöjd. Lätt–medel vikt.',
            },
            {
              name: 'KB Swing',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Explosivt höftdrev. Komplement till marklyftet – inte mer rygg utan mer höft.',
            },
          ],
        },
      ],
    },
    {
      name: 'Pass B',
      dayLabel: null,
      duration: 'ca 40 min',
      sections: [
        {
          name: 'Prehab – Höft & Core',
          zone: null,
          sets: null,
          restSecs: null,
          exercises: [
            {
              name: 'Pallof Press',
              targetSets: 2,
              targetReps: '10',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Antirotation. Håll 2s i utsträckt läge. Kör båda sidor.',
            },
            {
              name: 'Banded Lateral Walk',
              targetSets: 2,
              targetReps: '12',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: '12 steg per sida. Band runt knäna. Höften aktiv, inte knäna.',
            },
          ],
        },
        {
          name: 'Huvudlyft',
          zone: null,
          sets: null,
          restSecs: 120,
          exercises: [
            {
              name: 'Bänkpress',
              targetSets: 4,
              targetReps: '5',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'V1–2: RPE 7. V3–4: öka belastning. V5: toppsett.',
            },
          ],
        },
        {
          name: 'Accessory',
          zone: null,
          sets: null,
          restSecs: 75,
          exercises: [
            {
              name: 'DB / Cable Row (enarms)',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Balanserar bänken. Full ROM. Skulderblad ihop i topp.',
            },
            {
              name: 'Close Grip Bänkpress / Skull Crusher',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Triceps accessory. Välj det som känns bättre för armbågarna.',
            },
            {
              name: 'Face Pulls',
              targetSets: 3,
              targetReps: '15',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Skulder-prehab. Extern rotation i topp. Lätt vikt.',
            },
          ],
        },
      ],
    },
    {
      name: 'Pass C',
      dayLabel: null,
      duration: 'ca 40 min',
      sections: [
        {
          name: 'Prehab – Höft & Rörlighet',
          zone: null,
          sets: null,
          restSecs: null,
          exercises: [
            {
              name: 'Hip CARs (Controlled Articular Rotations)',
              targetSets: 2,
              targetReps: '5',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Långsam kontrollerad rotation i höftleden. Båda sidor. Håll resten av kroppen still.',
            },
            {
              name: 'Banded Clamshells',
              targetSets: 2,
              targetReps: '15',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Sidoliggande. Band runt knäna. Höftabduktion – komplement till copenhagen-arbetet.',
            },
          ],
        },
        {
          name: 'Huvudlyft',
          zone: null,
          sets: null,
          restSecs: 120,
          exercises: [
            {
              name: 'Militärpress (stående)',
              targetSets: 4,
              targetReps: '5',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'V1–2: RPE 7. V3–4: öka belastning. V5: toppsett. Kärna aktiv hela rörelsen.',
            },
          ],
        },
        {
          name: 'Accessory',
          zone: null,
          sets: null,
          restSecs: 75,
          exercises: [
            {
              name: 'Lat Pulldown',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Vertikal drag. Skulderblad nedåt och ihop i botten. Full sträckning i topp.',
            },
            {
              name: 'Lateral Raises',
              targetSets: 3,
              targetReps: '12',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Lätt–medel vikt. Kontrollerat ned. Armbågen lätt böjd.',
            },
            {
              name: 'Back Extension (viktad)',
              targetSets: 3,
              targetReps: '10',
              targetWeight: null,
              unit: 'reps' as 'reps' | 's' | 'm',
              notes: 'Samma som Pass A. Håll konsistent vikt för att spåra progression.',
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
                  name: exercise.name,
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