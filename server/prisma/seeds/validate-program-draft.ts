/**
 * VALIDATE A DRAFT PROGRAM JSON — checks a Program-shaped JSON file against `ProgramSchema`
 * without creating anything. Used mid-draft, before a program is confirmed and actually created
 * (see the `generate-program` skill's Draft step).
 *
 * How to run (from server/):
 *   npx tsx prisma/seeds/validate-program-draft.ts <path-to-json>
 */

import { readFileSync } from 'fs';
import { ProgramSchema } from '../../src/services/program.schema';

const FILE_PATH = process.argv[2];

function main() {
  if (!FILE_PATH) {
    throw new Error('Usage: npx tsx prisma/seeds/validate-program-draft.ts <path-to-json>');
  }

  const data = JSON.parse(readFileSync(FILE_PATH, 'utf-8'));
  const result = ProgramSchema.safeParse(data);

  console.log(result.success ? 'VALID' : JSON.stringify(result.error.issues, null, 2));
}

main();
