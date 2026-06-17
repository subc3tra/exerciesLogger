import { Program, ProgramStatus } from "@prisma/client";
import prisma from "../lib/prisma";

// get all programs for logged-in user (active + archived)
export async function getAllPrograms(userId: number): Promise<Program[]> {
  return await prisma.program.findMany({
    where: { userId }
  });
}

// get program + days + sections + exercises (full nested)
export async function getProgramById(id: number) {
  return await prisma.program.findUnique({
    where: { id },
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
                  name: true,
                  targetSets: true,
                  targetReps: true,
                  targetWeight: true,
                  unit: true,
                  notes: true,
                  order: true
                }
              }
            }
          }
        }
      }
    }
  })
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
export async function updateProgram(id: number, name?: string, totalWeeks?: number, daysPerWeek?: number, status?: ProgramStatus) {
  return await prisma.program.update({
    where: { id },
    data: { name, totalWeeks, daysPerWeek, status}
  })
}

// delete program
export async function deleteProgram(id: number): Promise<Program> {
  return await prisma.program.delete({
    where: { id }
  })  
}

// get all days for a program
export async function getDaysByProgramId(programId: number) {
  return await prisma.programDay.findMany({
    where: { programId },
    orderBy: { order: 'asc' }
  })
}

// get single day + sections + exercises (full nested)
export async function getDayById(id: number) {
  return await prisma.programDay.findUnique({
    where: { id },
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
              name: true,
              targetSets: true,
              targetReps: true,
              targetWeight: true,
              unit: true,
              notes: true,
              order: true
            }
          }
        }
      }
    }
  })
}