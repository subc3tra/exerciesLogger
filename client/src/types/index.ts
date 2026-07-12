// Pinned to actual controller/service response shapes in server/src — not the Prisma schema.
// Re-verify against server source if a service function's `select` changes.

export type ProgramStatus = 'ACTIVE' | 'ARCHIVED';

export type ExerciseCategory = 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE' | 'CARDIO';

export interface ExerciseRef {
  id: number;
  name: string;
  category: ExerciseCategory;
  description: string | null;
}

export interface User {
  id: number;
  username: string;
}

// GET /api/programs list item — full Program row, no relations loaded
export interface Program {
  id: number;
  name: string;
  status: ProgramStatus;
  totalWeeks: number;
  daysPerWeek: number;
  clonedFromId: number | null;
  userId: number;
  createdAt: string;
}

export interface ProgramExerciseTemplate {
  id: number;
  exercise: ExerciseRef;
  targetSets: number | null;
  targetReps: string | null;
  targetWeight: number | null;
  unit: string | null;
  notes: string | null;
  order: number;
}

export interface Section {
  id: number;
  name: string;
  zone: string | null;
  sets: number | null;
  restSecs: number | null;
  exercises: ProgramExerciseTemplate[];
}

export interface ProgramDay {
  id: number;
  name: string;
  dayLabel: string | null;
  duration: string | null;
  order: number;
  sections: Section[];
}

// GET /api/programs/:id — full nested tree
export interface ProgramDetail {
  id: number;
  name: string;
  status: ProgramStatus;
  totalWeeks: number;
  daysPerWeek: number;
  days: ProgramDay[];
}

export interface SessionSet {
  id: number;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
  completed: boolean;
  notes: string | null;
}

// ProgramExercise + nested exercise — what comes back via SessionExercise.programExercise
export interface ProgramExerciseFull extends ProgramExerciseTemplate {
  exerciseId: number;
  sectionId: number;
}

export interface SessionExerciseDetail {
  id: number;
  programExercise: ProgramExerciseFull;
  sets: SessionSet[];
}

// GET /api/sessions/:id, and the `session` field returned by /start and /complete's session shape when nested
export interface SessionDetail {
  id: number;
  date: string;
  weekNumber: number;
  dayNumber: number;
  completed: boolean;
  notes: string | null;
  programDayId: number;
  exercises: SessionExerciseDetail[];
}

// raw Session row, no relations — what POST /:id/complete and the "resume" prefill branch return
export interface SessionRecord {
  id: number;
  date: string;
  weekNumber: number;
  dayNumber: number;
  completed: boolean;
  notes: string | null;
  userId: number;
  programDayId: number;
  createdAt: string;
}

// one prior set's actual logged values, keyed by programExerciseId in the prefill map
export interface PrefillSetEntry {
  setNumber: number;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  distance: number | null;
}

// real carry-forward values from the last completed session on this program day, or null if there's none yet
export type Prefill = Record<number, PrefillSetEntry[]> | null;

export interface StartSessionResponse {
  session: SessionDetail | null;
  prefill: Prefill;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface MeResponse {
  user: User;
}

export interface ProgramsResponse {
  programs: Program[];
}

export interface ProgramResponse {
  program: ProgramDetail;
}

// GET /api/programs/:id/progress
export interface ProgramProgress {
  completedCount: number;
  activeSession: { id: number; weekNumber: number; dayNumber: number } | null;
}

export interface SessionResponse {
  session: SessionDetail;
  prefill: Prefill;
}

export interface CompleteSessionResponse {
  session: SessionRecord;
}

export interface UpdateSetResponse {
  set: SessionSet;
}

export interface ApiErrorResponse {
  message: string;
}
