/**
 * DELETE A PROGRAM — wipes one program and everything under it: days, sections,
 * exercises, and any session history logged against it. Cannot be undone.
 *
 * How to find the program's id first:
 *   - Easiest: `npx prisma studio` (from server/), opens a DB browser in your
 *     browser — click the Program table, find the row, copy its id.
 *   - Or: log in as that user in the app / Swagger UI and call GET /api/programs.
 *
 * How to run:
 *   1. Set PROGRAM_ID below to the real id.
 *   2. From server/:  npx tsx prisma/seeds/delete-program.ts
 */

import { PrismaClient } from '@prisma/client';
import { deleteProgramCascade } from './lib/deleteProgram';

const prisma = new PrismaClient();

// ---- EDIT ME ----
const PROGRAM_ID = 0; // replace with the program's real id
// -----------------

async function main() {
  if (!PROGRAM_ID) throw new Error('Set PROGRAM_ID at the top of this file to the program you want to delete.');

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
