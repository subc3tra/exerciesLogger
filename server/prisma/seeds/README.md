# Seed templates

Manual per-user setup during the testing phase — no self-registration or program
builder UI yet, so users and programs are added by hand with these.

All commands run from `server/`.

## Add a user

`npx tsx prisma/seeds/user.template.ts <username> <password> [wipeExistingData=true|false]`

No file editing needed — it's a plain CLI script. Re-running it for an existing
username resets their password instead of erroring. Pass `true` as the third
arg if you also want to wipe their existing programs and session history (a
full reset, not just a password change).

## Add a program

Every exercise in a program must resolve to a row in the `Exercise` bank (global,
`userId: null`). `../../docs/exercise-list.md` is the curated, human-readable
catalog of every exercise currently in the bank.

**Preferred path — AI-generated, via the `generate-program` skill:** produces a
`Program`-shaped JSON file (validated against `server/src/services/program.schema.ts`)
following the persona/guardrails in `../../docs/program-generation-instructions.md`,
saved to `user-programs/<username>.program.json`. Once you have that file:

`npx tsx prisma/seeds/create-program-from-json.ts <username> <path-to-json>`

Before writing anything, it resolves every exercise name to its bank id
(case-insensitive) and calls `createProgramFromData` — same fail-fast behavior
as below, nothing partial gets created if a name doesn't match.

**Older, manual path — hand-filled TS template (still works):**

1. Copy `program.template.ts` to something like `alice-strength.ts`.
2. Hand the copy to an AI along with the user's goals/preferences **and
   `../../docs/exercise-list.md`** — tell it explicitly to only use exercise names
   that appear in that doc, verbatim. It should only touch the `PROGRAM_DATA`
   object at the top (the file has its own rules for the AI baked into the
   comments).
3. Set `PROGRAM_DATA.username` yourself to the target user — the AI leaves this
   `null` on purpose, since it has no way to know your usernames.
4. `npx tsx prisma/seeds/<your-file>.ts` — before writing anything, it resolves
   every exercise name to its bank id (case-insensitive match). If any name
   doesn't match, it throws and lists every unmatched name up front — nothing
   partial gets created.

**If an exercise the program needs isn't in the bank yet, or an existing one needs correcting:**

1. Update `../../docs/exercise-list.md` first — it's the source of truth for the
   bank, not the script. Add a new entry, or fix an existing description/category.
2. Mirror the same change into the `EXERCISES` array in `sync-exercises.ts`.
3. Re-run `npx tsx prisma/seeds/sync-exercises.ts` — it's idempotent and handles
   both cases: a name that doesn't exist yet gets created, a name that already
   exists gets its fields (category/description/trackedFields/link) overwritten
   to match the array. Safe to re-run anytime, against any environment.
4. Then run the program script from step 4 above.

`add.exercises.ts` is now frozen (2026-07-13) as a historical record of the
original 45-exercise bootstrap — don't add to it anymore, use `sync-exercises.ts`
for everything going forward.

## Delete a program (reset if something breaks)

1. Find the program's id — easiest way is `npx prisma studio`, open the Program
   table, copy the id. (Or `GET /api/programs` while logged in as that user.)
2. `npx tsx prisma/seeds/delete-program.ts <programId>`

Wipes the program and everything under it — days, sections, exercises, and any
session history logged against it. Cannot be undone.

## Why not `prisma db seed`?

`prisma/seed.ts` (one level up) is wired to `prisma migrate reset` for the
original fixed test-program seed. These templates are separate, one-off,
run-by-hand scripts for adding real users/programs during testing — they're not
meant to run automatically.
