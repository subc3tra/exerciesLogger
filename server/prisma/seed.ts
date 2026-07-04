import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- User ---
  const user = await prisma.user.findFirst({
    where: { username: 'Mattias' },
  });

  if (!user) throw new Error('User not found. Create the user first.');

  // --- Program ---
  const program = await prisma.program.create({
    data: {
      name: 'Test Program',
      totalWeeks: 4,
      daysPerWeek: 2,
      userId: user.id,
    },
  });

  // --- Day A ---
  const dayA = await prisma.programDay.create({
    data: {
      name: 'Day A',
      order: 0,
      programId: program.id,
    },
  });

  const sectionA = await prisma.section.create({
    data: {
      name: 'Main Workout',
      order: 0,
      programDayId: dayA.id,
    },
  });

  const dayAExercises = [
    'Exercise A1',
    'Exercise A2',
    'Exercise A3',
    'Exercise A4',
    'Exercise A5',
  ];

  for (let i = 0; i < dayAExercises.length; i++) {
    await prisma.programExercise.create({
      data: {
        name: dayAExercises[i],
        targetSets: 3,
        targetReps: '8',
        unit: 'reps',
        order: i,
        sectionId: sectionA.id,
      },
    });
  }

  // --- Day B ---
  const dayB = await prisma.programDay.create({
    data: {
      name: 'Day B',
      order: 1,
      programId: program.id,
    },
  });

  const sectionB = await prisma.section.create({
    data: {
      name: 'Main Workout',
      order: 0,
      programDayId: dayB.id,
    },
  });

  const dayBExercises = [
    'Exercise B1',
    'Exercise B2',
    'Exercise B3',
    'Exercise B4',
    'Exercise B5',
  ];

  for (let i = 0; i < dayBExercises.length; i++) {
    await prisma.programExercise.create({
      data: {
        name: dayBExercises[i],
        targetSets: 3,
        targetReps: '8',
        unit: 'reps',
        order: i,
        sectionId: sectionB.id,
      },
    });
  }

  console.log('✅ Seed complete — Test Program with Day A and Day B created.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());