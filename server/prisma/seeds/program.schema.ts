import { z } from 'zod';

// Describes the SHAPE of a program only (name, days, sections, exercises).
// `username`/`userId` is deliberately NOT part of this schema — it comes from
// the authenticated session (or Mattias, in the manual seed workflow today),
// never from AI output.

// `.strict()` rejects any extra/unknown key — the equivalent of JSON Schema's
// `additionalProperties: false`, required for Claude's `strict: true`
// structured-output mode. It does not inherit from a parent schema, so every
// object below needs its own `.strict()` call, not just the outer one.

const ExerciseSchema = z.object({
  name: z.string(),
  targetSets: z.number(),
  targetReps: z.string(),
  // `.nullable()`, not `.optional()`: strict mode requires every key to be
  // listed in JSON Schema's `required` array, so "this field is optional" is
  // modeled as "always present, but its value may be null" instead.
  targetWeight: z.number().nullable(),
  notes: z.string().nullable(),
}).strict();

const SectionSchema = z.object({
  name: z.string(),
  zone: z.string().nullable(),
  sets: z.number().nullable(),
  restSecs: z.number().nullable(),
  exercises: z.array(ExerciseSchema),
}).strict();

const DaySchema = z.object({
  name: z.string(),
  dayLabel: z.string().nullable(),
  duration: z.string().nullable(),
  sections: z.array(SectionSchema),
}).strict();

// Plain object shape, no cross-field rule attached yet — kept separate so
// `z.toJSONSchema()` below has something it can actually convert. Zod's
// native converter THROWS on `.refine()` (it's arbitrary code, no JSON
// Schema equivalent exists), so the JSON Schema is generated from this
// pre-refine shape rather than from `ProgramSchema` itself.
const ProgramShape = z.object({
  name: z.string(),
  totalWeeks: z.number(),
  daysPerWeek: z.number(),
  days: z.array(DaySchema),
}).strict();

// `.refine()` checks a rule ACROSS two fields, which a plain object shape
// can't express: `daysPerWeek` must equal `days.length`, because the app
// schedules the next workout as `days[sessionCount % daysPerWeek]` — a
// mismatch either skips a day forever or crashes by indexing past the array.
//
// This rule has no JSON Schema equivalent (see `ProgramShape` above), so the
// schema Claude sees can't enforce it. `ProgramSchema.parse()`/`.safeParse()`
// (this one, refine included) must still run server-side on every draft/edit
// response, before anything reaches the database.
export const ProgramSchema = ProgramShape.refine(
  (data) => data.daysPerWeek === data.days.length,
  { message: 'daysPerWeek must equal days.length', path: ['daysPerWeek'] }
);

// Free TS type derived from the schema above — one definition, not two.
export type Program = z.infer<typeof ProgramSchema>;

// JSON Schema form of the same shape, for Claude's structured-output /
// strict tool-schema contract. Converted from `ProgramShape` (pre-refine) —
// does NOT enforce the daysPerWeek/days.length rule, see note above.
export const programJsonSchema = z.toJSONSchema(ProgramShape);
