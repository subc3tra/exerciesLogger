import prisma from "../lib/prisma";

// get all exercises
export async function getAllExercises(userId:number) {
  return await prisma.exercise.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      trackedFields: true
    },
    orderBy: { name: 'asc'}
  })
};