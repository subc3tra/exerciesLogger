# Seed templates

Manual per-user setup during the testing phase — no self-registration or program
builder UI yet, so users and programs are added by hand with these.

All commands run from `server/`.

## Add a user

1. Copy `user.template.ts` (optional — keeps a record), or just edit it directly.
2. Set `USERNAME` / `PASSWORD`.
3. `npx tsx prisma/seeds/user.template.ts`

Re-running it for an existing username resets their password instead of erroring.
Set `WIPE_EXISTING_DATA = true` first if you also want to clear their programs and
session history (a full reset, not just a password change).

## Add a program

Every exercise in a program must resolve to a row in the `Exercise` bank (global,
`userId: null`) — the template no longer takes a bare exercise name, it takes a
name that gets looked up against the bank. `../../docs/exercise-list.md` is the
curated, human-readable catalog of every exercise currently in the bank.

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

**If an exercise the program needs isn't in the bank yet:**

1. Add it to the `EXERCISES` array in `add.exercises.ts`, and to
   `../../docs/exercise-list.md` too (keeps the doc in sync as the source of
   truth for the bank).
2. Re-run `npx tsx prisma/seeds/add.exercises.ts` — it's idempotent (skips
   anything that already exists by case-insensitive name), safe to re-run
   anytime.
3. Then run the program script from step 4 above.

## Delete a program (reset if something breaks)

1. Find the program's id — easiest way is `npx prisma studio`, open the Program
   table, copy the id. (Or `GET /api/programs` while logged in as that user.)
2. Set `PROGRAM_ID` in `delete-program.ts`.
3. `npx tsx prisma/seeds/delete-program.ts`

Wipes the program and everything under it — days, sections, exercises, and any
session history logged against it. Cannot be undone.

## Why not `prisma db seed`?

`prisma/seed.ts` (one level up) is wired to `prisma migrate reset` for the
original fixed test-program seed. These templates are separate, one-off,
run-by-hand scripts for adding real users/programs during testing — they're not
meant to run automatically.
