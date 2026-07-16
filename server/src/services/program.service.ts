import { Program, ProgramStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { ProgramSchema, Program as ProgramInput } from './program.schema';

// get all programs for logged-in user (active + archived)
export async function getAllPrograms(userId: number): Promise<Program[]> {
  return await prisma.program.findMany({
    where: { userId }
  });
}

// get program + days + sections + exercises (full nested)
export async function getProgramById(id: number, userId: number) {
  return await prisma.program.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      status: true,
      totalWeeks: true,
      daysPerWeek: true,
      days: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          dayLabel: true,
          duration: true,
          order: true,
          sections: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              name: true,
              zone: true,
              sets: true,
              restSecs: true,
              exercises: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  targetSets: true,
                  targetReps: true,
                  targetWeight: true,
                  notes: true,
                  order: true,
                  exercise: {
                    select: { id: true, name: true, category: true, trackedFields: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
}

// how far along a program is — completed session count + the current in-progress one, if any.
// The whole week/day schedule is derivable client-side from totalWeeks/daysPerWeek/days, so this
// is the only piece that actually needs a live DB read.
export async function getProgramProgress(id: number, userId: number) {
  const program = await prisma.program.findFirst({ where: { id, userId }, select: { id: true } });
  if (!program) return null;

  const completedCount = await prisma.session.count({
    where: { userId, completed: true, programDay: { programId: id } }
  });

  const activeSession = await prisma.session.findFirst({
    where: { userId, completed: false, programDay: { programId: id } },
    select: { id: true, weekNumber: true, dayNumber: true }
  });

  return { completedCount, activeSession };
}

// create program { name, totalWeeks, daysPerWeek }
export async function createProgram(name: string, totalWeeks: number, daysPerWeek: number, userId: number, ): Promise<Program> {
  return await prisma.program.create({
    data: {
      name,
      totalWeeks,
      daysPerWeek,
      userId
    }
  })
}

// update name / week count
export async function updateProgram(id: number, userId: number, name?: string, totalWeeks?: number, daysPerWeek?: number, status?: ProgramStatus) {
  return await prisma.program.update({
    where: { id, userId },
    data: { name, totalWeeks, daysPerWeek, status}
  })
}

// delete program
export async function deleteProgram(id: number, userId: number): Promise<Program> {
  return await prisma.program.delete({
    where: { id, userId }
  })  
}

// get all days for a program
export async function getDaysByProgramId(programId: number, userId: number) {
  return await prisma.programDay.findMany({
    where: { programId, program: { userId} },
    orderBy: { order: 'asc' }
  })
}

// get single day + sections + exercises (full nested)
export async function getDayById(id: number, userId: number) {
  return await prisma.programDay.findFirst({
    where: { id, program: { userId} },
    select: {
      id: true,
      name: true,
      dayLabel: true,
      duration: true,
      order: true,
      sections: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          zone: true,
          sets: true,
          restSecs: true,
          exercises: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              targetSets: true,
              targetReps: true,
              targetWeight: true,
              notes: true,
              order: true,
              exercise: {
                select: { id: true, name: true, category: true, trackedFields: true }
              }
            }
          }
        }
      }
    }
  })
}

// create new program from data
export async function createProgramFromData(data: unknown, userId: number) {
  const parsed = ProgramSchema.parse(data);

  const allNames = parsed.days.flatMap((day) =>
    day.sections.flatMap((section) => section.exercises.map((exercise) => exercise.name))
  );

  const bankExercises = await prisma.exercise.findMany({
    where: { userId: null },
    select: { id: true, name: true },
  });
  const exerciseIdByName = new Map(bankExercises.map((e) => [e.name.toLocaleLowerCase(), e.id]));

  const missing = [...new Set(allNames)].filter((name) => !exerciseIdByName.has(name.toLocaleLowerCase()));
  if (missing.length > 0) {
    throw new Error(`Exercise(s) not found in the bank: ${missing.join(', ')}`)
  };

  const program = await prisma.program.create({
    data: {
      name: parsed.name,
      totalWeeks: parsed.totalWeeks,
      daysPerWeek: parsed.daysPerWeek,
      userId: userId,   // no `user.id` lookup anymore — it's already a parameter
      days: {
        create: parsed.days.map((day, dayIndex) => ({
          name: day.name,
          dayLabel: day.dayLabel,
          duration: day.duration,
          order: dayIndex,
          sections: {
            create: day.sections.map((section, sectionIndex) => ({
              name: section.name,
              zone: section.zone,
              sets: section.sets,
              restSecs: section.restSecs,
              order: sectionIndex,
              exercises: {
                create: section.exercises.map((exercise, exerciseIndex) => ({
                  exerciseId: exerciseIdByName.get(exercise.name.toLocaleLowerCase())!,  // match whichever casing you picked when you fixed the bug
                  targetSets: exercise.targetSets,
                  targetReps: exercise.targetReps,
                  targetWeight: exercise.targetWeight,
                  notes: exercise.notes,
                  order: exerciseIndex,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  return program;
}