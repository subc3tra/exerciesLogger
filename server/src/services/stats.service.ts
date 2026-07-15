import prisma from "../lib/prisma";

// get stats overview
export async function getStatsOverview(userId:number, range: 'week' | 'month' | 'lifetime', exerciseId?: number) {
  let fromDate: Date | undefined;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  switch (range) {
    case 'week':
      fromDate = new Date(Date.now() - 7 * millisecondsPerDay);
      break;
    case 'month':
      fromDate = new Date(Date.now() - 30 * millisecondsPerDay);
      break;
    case 'lifetime':
      break;
  }

  const sets = await prisma.sessionSet.findMany({
    where: {
      completed: true,
      sessionExercise: {
        session: { userId, completed: true, ...(fromDate && { date: { gte: fromDate } })},
        ...(exerciseId && { programExercise: { exerciseId } }),
      },
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
    where: {
      userId,
      completed: true,
      ...(fromDate && { date: { gte: fromDate } }),
      ...(exerciseId && { exercises: { some: { programExercise: { exerciseId } } } }),
    },
  });

  return {
    totalVolumeKg,
    heaviestLift,
    totalSessionsCompleted
  }
}

// get stats for users exercise
export async function getExerciseProgression(userId:number, exerciseId: number, range: 'week' | 'month' | 'lifetime' ) {
  let fromDate: Date | undefined;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  switch (range) {
    case 'week':
      fromDate = new Date(Date.now() - 7 * millisecondsPerDay);
      break;
    case 'month':
      fromDate = new Date(Date.now() - 30 * millisecondsPerDay);
      break;
    case 'lifetime':
      break;
  }
  
  const exercises = await prisma.sessionSet.findMany({
    where: {
      completed: true,
      sessionExercise: {
        programExercise: {
          exerciseId
        },
        session: {
          userId, ...(fromDate && { date: { gte: fromDate } })
        }
      }
    },
    select: {
      weight: true,
      sessionExercise: {
        select: {
          session: { select: { date: true } }
        },
      },
    },
  })

  const grouped = exercises.reduce((map, set) => {
    if (set.weight == null) {
      return map;
    }

    const key = set.sessionExercise.session.date.getTime();
    const existing = map.get(key);
    if (!existing || set.weight > existing.weight) {
      map.set(key, { date: set.sessionExercise.session.date, weight: set.weight });
    }
    return map;
  }, new Map<number, { date: Date; weight: number }>());

  return Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}