/**
 * CREATE A PROGRAM FROM A JSON FILE — takes a Program-shaped JSON file (the
 * confirmed draft from the AI-generation flow) and a username, and creates
 * the program via createProgramFromData.
 *
 * How to run (from server/):
 *   npx tsx prisma/seeds/create-program-from-json.ts <username> <path-to-json-file>
 */

import { readFileSync } from 'fs';
import prisma from '../../src/lib/prisma';
import { createProgramFromData } from '../../src/services/program.service';

const USERNAME = process.argv[2];
const FILE_PATH = process.argv[3];

async function main() {
  if (!USERNAME || !FILE_PATH) {
    throw new Error('Usage: npx tsx prisma/seeds/create-program-from-json.ts <username> <path-to-json-file>');
  }

  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    throw new Error(`User "${USERNAME}" not found.`);
  }

  const data = JSON.parse(readFileSync(FILE_PATH, 'utf-8'));

  const program = await createProgramFromData(data, user.id);
  console.log(`✅ Created program "${program.name}" (id ${program.id}) for "${USERNAME}"`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
