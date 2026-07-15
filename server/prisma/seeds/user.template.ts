/**
 * USER TEMPLATE — create a new user, or reset an existing one's password (and
 * optionally wipe their data too).
 *
 * How to run (from server/):
 *   npx tsx prisma/seeds/user.template.ts <username> <password> [wipeExistingData=true|false]
 *
 * wipeExistingData is optional — omit it (or pass anything other than "true") to leave
 * the user's existing programs and session history untouched.
 *
 * The plaintext password only ever exists on your command line/terminal history;
 * it's bcrypt-hashed before anything is written to the database.
 *
 * If the username already exists, this resets their password instead of erroring.
 */

// ---- DO NOT EDIT ANYTHING BELLOW THIS LINE ----

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../src/utils/hash';
import { deleteProgramCascade } from './lib/deleteProgram';

const prisma = new PrismaClient();

const USERNAME: string = process.argv[2];
const PASSWORD: string = process.argv[3];
const WIPE_EXISTING_DATA = process.argv[4] === 'true'; // true = also delete all their programs + session history

async function main() {
  if (USERNAME === undefined || PASSWORD === undefined) {
    throw new Error(
      'Usage: npx tsx prisma/seeds/user.template.ts <username> <password> [wipeExistingData=true|false]'
    );
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
