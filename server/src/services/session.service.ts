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
      exercises: {
        select: {
          id: true,
          programExercise: true,
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
      daysPerWeek: true,
      days: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          sections: {
            select: {
              exercises: {
                select: {
                id: true,
                name: true,
                targetSets: true,
                targetReps: true,
                targetWeight: true,
                unit: true,
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
    select: { id: true }
  });

  if (activeSession) {
    return {
      session: await getSessionById(activeSession.id, userId),
      prefill: null
    }
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


  // get the latest session, if there isnt any get the template from the program Exercice. T
  let prefill;
  let lastCompletedSession = await prisma.session.findFirst({
    where: { userId, programDayId, completed: true },
    orderBy: { date: 'desc' }
  })

  if (!lastCompletedSession) {
    prefill = nextProgramDay.sections;
  } else {
    prefill = lastCompletedSession;
  }

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
export async function updateSetById(userId: number, sessionSetId: number, reps: number, weight: number, duration: number, completed: boolean, notes: string) {
  return await prisma.sessionSet.update({
    where: { id: sessionSetId, 
      sessionExercise: {
        session: { userId }
      }},
      data: { reps, weight, duration, completed, notes }
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
export async function addNewSetRow(userId:number, sessionExerciseId: number, reps: number, weight: number, duration: number, completed: boolean, notes: string) {
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
    data: { setNumber: maxSet, reps, weight, duration, completed, notes, sessionExerciseId}
  })
}