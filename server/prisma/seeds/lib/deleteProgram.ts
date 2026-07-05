import { PrismaClient } from '@prisma/client';

/**
 * Deletes a program and everything under it: days, sections, exercises, and any
 * sessions/session data ever logged against it. Cannot be undone.
 *
 * There's no cascade delete set up in schema.prisma, so this walks the foreign-key
 * chain by hand, in the only order that won't hit a constraint error:
 *   SessionSet -> SessionExercise -> Session -> ProgramExercise -> Section -> ProgramDay -> Program
 *
 * Shared by delete-program.ts and user.template.ts's wipe option — if this order
 * ever needs to change (e.g. a new related table gets added), fix it here once.
 */
export async function deleteProgramCascade(prisma: PrismaClient, programId: number): Promise<void> {
  const sessions = await prisma.session.findMany({
    where: { programDay: { programId } },
    select: { id: true },
  });
  const sessionIds = sessions.map((s) => s.id);

  const sessionExercises = await prisma.sessionExercise.findMany({
    where: { sessionId: { in: sessionIds } },
    select: { id: true },
  });
  const sessionExerciseIds = sessionExercises.map((se) => se.id);

  await prisma.sessionSet.deleteMany({ where: { sessionExerciseId: { in: sessionExerciseIds } } });
  await prisma.sessionExercise.deleteMany({ where: { id: { in: sessionExerciseIds } } });
  await prisma.session.deleteMany({ where: { id: { in: sessionIds } } });

  const days = await prisma.programDay.findMany({ where: { programId }, select: { id: true } });
  const dayIds = days.map((d) => d.id);

  const sections = await prisma.section.findMany({ where: { programDayId: { in: dayIds } }, select: { id: true } });
  const sectionIds = sections.map((s) => s.id);

  await prisma.programExercise.deleteMany({ where: { sectionId: { in: sectionIds } } });
  await prisma.section.deleteMany({ where: { id: { in: sectionIds } } });
  await prisma.programDay.deleteMany({ where: { id: { in: dayIds } } });
  await prisma.program.deleteMany({ where: { id: programId } });
}
