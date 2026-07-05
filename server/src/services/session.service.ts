import prisma from "../lib/prisma";

// get all sessions
export async function getAllSessions(userId:number) {
  return await prisma.session.findMany({
    where: { userId },
    select: {
      exercises: {
        select: {
          sets: {
            select: {
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
          programExercise: true,
          sets: {
          select: {
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
export async function startSession(userId: number, programDayId: number) {
  // get the pogram day with included daysPerWeek from program
  const programDay = await prisma.programDay.findFirst({
    where: {
      id: programDayId,
      program: { userId }
    },
    select: {
      program: {
        select: {
          id: true,
          daysPerWeek: true
        }
      },
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
  });

  // null check for programDay
  if (!programDay) throw new Error('Program day not found!');

  // check if the is a in progress session
  const activeSession = await prisma.session.findFirst({
    where: { userId, programDayId, completed: false },
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
    where: { userId, programDay: { programId: programDay.program.id } }
  });

  // calculate the weeknumber and day number
  const weekNumber = Math.ceil((sessionCount + 1) / programDay.program.daysPerWeek);
  const dayNumber = (sessionCount % programDay.program.daysPerWeek) + 1;


  // get the latest session, if there isnt any get the template from the program Exercice. T
  let prefill;
  let lastCompletedSession = await prisma.session.findFirst({
    where: { userId, programDayId, completed: true },
    orderBy: { date: 'desc' }
  })

  if (!lastCompletedSession) {
    prefill = programDay.sections;
  } else {
    prefill = lastCompletedSession;
  }

  // build the session exercise rows and set rows
  const sessionExercisesData = programDay.sections.flatMap(section =>
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
      } },
      data: { reps, weight, duration, completed, notes }
  })
}

// remove set row
