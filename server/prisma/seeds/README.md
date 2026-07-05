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

1. Copy `program.template.ts` to something like `alice-strength.ts`.
2. Hand the copy to an AI along with the user's goals/preferences — it should only
   touch the `PROGRAM_DATA` object at the top (the file has its own rules for the
   AI baked into the comments).
3. Set `PROGRAM_DATA.username` yourself to the target user — the AI leaves this
   `null` on purpose, since it has no way to know your usernames.
4. `npx tsx prisma/seeds/<your-file>.ts`

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
