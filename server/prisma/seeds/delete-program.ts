/**
 * DELETE A PROGRAM — wipes one program and everything under it: days, sections,
 * exercises, and any session history logged against it. Cannot be undone.
 *
 * How to find the program's id first:
 *   - Easiest: `npx prisma studio` (from server/), opens a DB browser in your
 *     browser — click the Program table, find the row, copy its id.
 *   - Or: log in as that user in the app / Swagger UI and call GET /api/programs.
 *
 * How to run (from server/):
 *   npx tsx prisma/seeds/delete-program.ts <programId>
 */

// ---- DO NOT EDIT ANYTHING BELLOW THIS LINE ----

import { PrismaClient } from '@prisma/client';
import { deleteProgramCascade } from './lib/deleteProgram';

const prisma = new PrismaClient();

const PROGRAM_ID = Number(process.argv[2]);

async function main() {
  if (!PROGRAM_ID) {
    throw new Error('Usage: npx tsx prisma/seeds/delete-program.ts <programId>');
  }

  const program = await prisma.program.findUnique({ where: { id: PROGRAM_ID } });
  if (!program) {
    console.log(`No program with id ${PROGRAM_ID} — nothing to delete.`);
    return;
  }

  await deleteProgramCascade(prisma, PROGRAM_ID);
  console.log(`🗑️  Deleted program "${program.name}" (id ${PROGRAM_ID}) and all its data.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
