import prisma from "../lib/prisma";

// get all sessions
export async function getAllSessions(userId:number) {
  return await prisma.session.findMany({
    where: { userId },
    select: {
      exercises: {
        select: {
          id: true,
          sets: {
            select: {
              id: true,
              setNumber: true,
              reps: true,
              weight: true,
              duration: true,
              distance: true,
              completed: true,
              notes: true
            }
          }
        }
      }
    }
  });
}

// previous session's actual set values for this program day, keyed by programExerciseId — used to
// prefill the session logger with real carry-forward numbers instead of the template again
export async function getPrefillForProgramDay(userId: number, programDayId: number, excludeSessionId?: number) {
  const lastCompletedSession = await prisma.session.findFirst({
    where: {
      userId,
      programDayId,
      completed: true,
      ...(excludeSessionId ? { id: { not: excludeSessionId } } : {})
    },
    orderBy: { date: 'desc' },
    select: {
      exercises: {
        select: {
          programExerciseId: true,
          sets: {
            orderBy: { setNumber: 'asc' },
            select: { setNumber: true, reps: true, weight: true, duration: true, distance: true }
          }
        }
      }
    }
  });

  if (!lastCompletedSession) return null;

  const prefill: Record<number, typeof lastCompletedSession.exercises[number]['sets']> = {};
  for (const exercise of lastCompletedSession.exercises) {
    prefill[exercise.programExerciseId] = exercise.sets;
  }
  return prefill;
}

// get session with id
export async function getSessionById(id: number, userId: number) {
  return await prisma.session.findFirst({
    where: {id, userId },
    select: {
      id: true,
      date: true,
      weekNumber: true,
      dayNumber: true,
      completed: true,
      notes: true,
      programDayId: true,
      exercises: {
        select: {
          id: true,
          programExercise: {
            select: {
              id: true,
              exerciseId: true,
              targetSets: true,
              targetReps: true,
              targetWeight: true,
              notes: true,
              order: true,
              sectionId: true,
              section: {
                select: { id: true, name: true, zone: true, order: true }
              },
              exercise: {
                select: { id: true, name: true, category: true, description: true, trackedFields: true }
              }
            }
          },
          sets: {
          select: {
            id: true,
            setNumber: true,
            reps: true,
            weight: true,
            duration: true,
            distance: true,
            completed: true,
            notes: true
          }
        }
        }
      }
    }
  })
}

// start a new session
export async function startSession(userId: number, programId: number) {
  // get the pogram day with included daysPerWeek from program
  const program = await prisma.program.findFirst({
    where: {
      id: programId,
      userId
    },
    select: {
      status: true,
      daysPerWeek: true,
      days: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          sections: {
            orderBy: { order: 'asc' },
            select: {
              exercises: {
                orderBy: { order: 'asc' },
                select: {
                id: true,
                targetSets: true,
                targetReps: true,
                targetWeight: true,
                notes: true
                }
              }
            }
          }
        }
      }
    }  
  });

  // null check for programDay
  if (!program) throw new Error('Program not found!');

  // check if the is a in progress session
  const activeSession = await prisma.session.findFirst({
    where: { userId, completed: false },
    select: { id: true, programDay: { select: { programId: true } } }
  });

  if (activeSession) {
    if (activeSession.programDay.programId !== programId) {
      throw new Error('Active session in progress for a different program');
    }
    return {
      session: await getSessionById(activeSession.id, userId),
      prefill: null
    }
  }

  if (program.status === 'ARCHIVED') {
    throw new Error('Program complete');
  }

  // count the number of session for that program day
  const sessionCount = await prisma.session.count({
    where: { userId, programDay: { programId } }
  });

  // calculate the weeknumber and day number
  const weekNumber = Math.ceil((sessionCount + 1) / program.daysPerWeek);
  const dayIndex = sessionCount % program.daysPerWeek;
  const dayNumber = dayIndex + 1;
  const nextProgramDay = program.days[dayIndex];
  const programDayId = nextProgramDay.id;


  // real carry-forward values from the last completed session on this day, or null if this is the first time
  const prefill = await getPrefillForProgramDay(userId, programDayId);

  // build the session exercise rows and set rows
  const sessionExercisesData = nextProgramDay.sections.flatMap(section =>
    section.exercises.map(exercise => ({
      programExerciseId: exercise.id,
      sets: {
        create: Array.from({ length: exercise.targetSets ?? 0 }, (_, i) =>
        ({ 
          setNumber: i + 1,
          completed: false
        }))
      }
    }))
  );

  const draftSession = await prisma.session.create({
    data: {
      weekNumber,
      dayNumber,
      userId,
      programDayId,
      exercises: {
        create: sessionExercisesData
      }
    }
  });
  
  return { 
    session: await getSessionById(draftSession.id, userId),
    prefill
  };
}

// update sets by id
export async function updateSetById(userId: number, sessionSetId: number, reps: number, weight: number, duration: number, distance: number, completed: boolean, notes: string) {
  return await prisma.sessionSet.update({
    where: { id: sessionSetId,
      sessionExercise: {
        session: { userId }
      }},
      data: { reps, weight, duration, distance, completed, notes }
  })
}

// remove set row
export async function removeSetRow(userId: number, sessionSetId: number) {
  return await prisma.sessionSet.delete({
    where: { id: sessionSetId,
    sessionExercise: {
      session: { userId }
    }}
  })
}

// add new set row
export async function addNewSetRow(userId:number, sessionExerciseId: number, reps: number, weight: number, duration: number, distance: number, completed: boolean, notes: string) {
  // first get the setNumber to find the max sets
  const sessionExercise = await prisma.sessionExercise.findFirst({
    where: { id: sessionExerciseId,
      session: { userId }
    },
    select: {
      sets: {
        select: {
          setNumber: true
        }
      }
    }
  });

  if (!sessionExercise) throw new Error('No sessionExercise found!');

  const setNumbers = sessionExercise.sets.map(set => set.setNumber);
  const maxSet = Math.max(0, ...setNumbers) + 1;

  // add new set row with new data
  return await prisma.sessionSet.create({
    data: { setNumber: maxSet, reps, weight, duration, distance, completed, notes, sessionExerciseId}
  });
}

// for each exercise done this session, compare this session's max completed-set weight against
// the user's best from every OTHER completed session — only a genuine beat counts as a PR, a
// first-time exercise has nothing to beat yet so it's not flagged
async function getSessionPRs(
  userId: number,
  sessionId: number,
  exercises: { programExercise: { exerciseId: number; exercise: { name: string } }; sets: { weight: number | null }[] }[]
) {
  const thisSessionMax = new Map<number, { weight: number; exerciseName: string }>();
  for (const se of exercises) {
    const exerciseId = se.programExercise.exerciseId;
    for (const set of se.sets) {
      if (set.weight == null) continue;
      const existing = thisSessionMax.get(exerciseId);
      if (!existing || set.weight > existing.weight) {
        thisSessionMax.set(exerciseId, { weight: set.weight, exerciseName: se.programExercise.exercise.name });
      }
    }
  }

  if (thisSessionMax.size === 0) return [];

  const priorSets = await prisma.sessionSet.findMany({
    where: {
      completed: true,
      weight: { not: null },
      sessionExercise: {
        programExercise: { exerciseId: { in: Array.from(thisSessionMax.keys()) } },
        session: { userId, completed: true, id: { not: sessionId } }
      }
    },
    select: {
      weight: true,
      sessionExercise: { select: { programExercise: { select: { exerciseId: true } } } }
    }
  });

  const priorMax = new Map<number, number>();
  for (const set of priorSets) {
    if (set.weight == null) continue;
    const exerciseId = set.sessionExercise.programExercise.exerciseId;
    const existing = priorMax.get(exerciseId);
    if (existing == null || set.weight > existing) {
      priorMax.set(exerciseId, set.weight);
    }
  }

  const prs: { exerciseId: number; exerciseName: string; weight: number; previousBest: number }[] = [];
  for (const [exerciseId, { weight, exerciseName }] of thisSessionMax) {
    const previousBest = priorMax.get(exerciseId);
    if (previousBest !== undefined && weight > previousBest) {
      prs.push({ exerciseId, exerciseName, weight, previousBest });
    }
  }
  return prs;
}

// complete session — auto-archives the program if this was its final scheduled session
export async function completeSession(userId: number, sessionId: number) {
  const session = await prisma.session.update({
    where: { id: sessionId, userId },
    data: { completed: true },
    select: {
      id: true,
      date: true,
      weekNumber: true,
      dayNumber: true,
      completed: true,
      notes: true,
      userId: true,
      programDayId: true,
      createdAt: true,
      programDay: {
        select: {
          program: { select: { id: true, totalWeeks: true, daysPerWeek: true } }
        }
      },
      exercises: {
        select: {
          programExercise: { select: { exerciseId: true, exercise: { select: { name: true } } } },
          sets: { where: { completed: true }, select: { weight: true } }
        }
      }
    }
  });

  const { programDay, exercises, ...sessionFields } = session;
  const { program } = programDay;
  const absoluteDayNumber = (sessionFields.weekNumber - 1) * program.daysPerWeek + sessionFields.dayNumber;

  if (absoluteDayNumber >= program.totalWeeks * program.daysPerWeek) {
    await prisma.program.update({ where: { id: program.id }, data: { status: 'ARCHIVED' } });
  }

  const prs = await getSessionPRs(userId, sessionId, exercises);

  return { session: sessionFields, prs };
}