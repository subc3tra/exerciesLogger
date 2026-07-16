import { z } from 'zod';

const ExerciseSchema = z.object({
  name: z.string(),
  targetSets: z.number(),
  targetReps: z.string(),
  targetWeight: z.number().nullable(),
  notes: z.string().nullable(),
}).strict();

const SectionSchema = z.object({
  name: z.string(),                  // required string
  zone: z.string().nullable(),       // nullable string
  sets: z.number().nullable(),       // nullable number
  restSecs: z.number().nullable(),   // nullable number
  exercises: z.array(ExerciseSchema),  // a list of... what schema did we just build?
}).strict();

const DaySchema = z.object({
  name: z.string(),
  dayLabel: z.string().nullable(),
  duration: z.string().nullable(),
  sections: z.array(SectionSchema),
}).strict();

const ProgramSchema = z.object({
  name: z.string(),
  totalWeeks: z.number(),
  daysPerWeek: z.number(),
  days: z.array(DaySchema),
}).strict().refine(
  (data) => data.daysPerWeek === data.days.length,
  { message: 'days per week must equal to days length', path: ['daysPerWeek'] }
);