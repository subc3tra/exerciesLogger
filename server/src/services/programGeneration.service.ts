import prisma from "../lib/prisma";
import { z } from "zod";

const IntakeSubmissionInput = z.object({
  firstName: z.string(),
  goal: z.string(),
  experienceLevel: z.string(),
  age: z.number().optional(),
  weight: z.number().optional(),
  height: z.number().optional(),
  injuriesOrLimitations: z.string().optional(),
  availableTime: z.string(),
  equipmentAccess: z.string().optional(),
  otherParallelTraining: z.string().optional(),
  preferredExercises: z.string().optional(),
  programLengthWeeks: z.number().optional()
})

// form submission
export async function createIntakeSubmission(input: unknown) {
  const parsed = IntakeSubmissionInput.parse(input);
  return await prisma.intakeSubmission.create({
    data: parsed
  })
}