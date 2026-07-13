import prisma from "../lib/prisma";

// get stats overview
export async function getStatsOverview(userId:number) {
  const sets = await prisma.sessionSet.findMany({
    where: {
      completed: true,
      sessionExercise: { session: { userId, completed: true} },
    },
    select: {
      weight: true,
      reps: true,
      sessionExercise: {
        select: {
          programExercise: { select: { exercise: { select: { name: true } } } },
          session: { select: { date: true } }
        },
      },
    },
  });

  // caluclated the total volume
  const totalVolumeKg = sets.reduce((total, set) => {
    if (set.weight == null || set.reps == null) {
      return total;
    }
    return total + set.weight * set.reps; 
  }, 0)

  // calculate the heaviest lift
  const heaviestLift = sets.reduce((heaviest, set) => {
    if (set.weight == null) {
      return heaviest;
    }

    if (heaviest === null || set.weight > heaviest.weight) {
      return {
        weight: set.weight,
        exerciseName: set.sessionExercise.programExercise.exercise.name,
        date: set.sessionExercise.session.date,
      };
    }
    return heaviest;
  }, null as { weight: number, exerciseName: string, date: Date } | null);

  const totalSessionsCompleted = await prisma.session.count({
    where: { userId, completed: true}
  });

  return {
    totalVolumeKg,
    heaviestLift,
    totalSessionsCompleted
  }
}