import { PrismaClient, ExerciseCategory } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// EXERCISE DATA — append new entries here over time, never delete old ones.
// Pull the first batch straight out of mattias.program.ts / miAmor.program.ts.
// ============================================================================
const EXERCISES: {
  name: string;
  category: ExerciseCategory;
  description?: string;
  link?: string;
}[] = [
  { name: 'Bänkpress', category: 'CHEST' },
  // ... add the rest here
];

// ============================================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================================
async function main() {
  let created: number = 0;
  let skipped: number = 0;
  for (const ex of EXERCISES) {
    const exists = await prisma.exercise.findFirst({
      where: { userId: null, name: { equals: ex.name, mode : 'insensitive'} }
    });
    if (exists) {
      skipped ++;
      continue;
    } else {
      await prisma.exercise.create({ data: { ...ex, userId: null }});
      created++;
    }
  }
  console.log(`created: ${created}, skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());