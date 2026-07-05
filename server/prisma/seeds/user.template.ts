/**
 * USER TEMPLATE — create a new user, or reset an existing one's password (and
 * optionally wipe their data too).
 *
 * How to run (from server/):
 *   1. Fill in USERNAME / PASSWORD below.
 *   2. npx tsx prisma/seeds/user.template.ts
 *
 * Safe to keep a filled-in copy of this file lying around for your own records —
 * the plaintext PASSWORD only ever exists in this file and your terminal; it's
 * bcrypt-hashed before anything is written to the database.
 *
 * If the username already exists, this resets their password instead of erroring.
 * Set WIPE_EXISTING_DATA = true if you also want to delete every program and all
 * session history for that user (full reset). Leave it false for a plain password
 * reset that keeps their programs and history intact.
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../src/utils/hash';
import { deleteProgramCascade } from './lib/deleteProgram';

const prisma = new PrismaClient();

// ---- EDIT ME ----
const USERNAME = 'REPLACE_ME';
const PASSWORD = 'REPLACE_ME';
const WIPE_EXISTING_DATA = false; // true = also delete all their programs + session history
// -----------------

async function main() {
  if (USERNAME === 'REPLACE_ME' || PASSWORD === 'REPLACE_ME') {
    throw new Error('Set USERNAME and PASSWORD at the top of this file first.');
  }

  const hashed = await hashPassword(PASSWORD);
  const existing = await prisma.user.findFirst({ where: { username: USERNAME } });

  if (!existing) {
    const user = await prisma.user.create({ data: { username: USERNAME, password: hashed } });
    console.log(`✅ Created user "${user.username}" (id ${user.id})`);
    return;
  }

  if (WIPE_EXISTING_DATA) {
    const programs = await prisma.program.findMany({ where: { userId: existing.id }, select: { id: true } });
    for (const program of programs) {
      await deleteProgramCascade(prisma, program.id);
    }
  }

  await prisma.user.update({ where: { id: existing.id }, data: { password: hashed } });
  console.log(`✅ Reset password for "${USERNAME}"${WIPE_EXISTING_DATA ? ' and wiped their programs/history' : ''}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
