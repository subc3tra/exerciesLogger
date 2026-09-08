import prisma from "../lib/prisma";
import { createProgramFromData } from "./program.service";

// thrown when confirm is called on a draft that already went through — lets the
// controller tell "already done" apart from a real validation/server error
export class DraftAlreadyConfirmedError extends Error {
  constructor() {
    super('Draft already confirmed');
    this.name = 'DraftAlreadyConfirmedError';
  }
}

// the current draft for a logged-in user. Most recent row, not a hard uniqueness
// assumption — see the schema comment on ProgramDraft for why.
export async function getDraftByUserId(userId: number) {
  return await prisma.programDraft.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

// client confirms the draft as-is: turns the stored Program JSON into a real Program
// via the same createProgramFromData used by the manual seed workflow (one function,
// not a second implementation of "does this JSON represent a legal program").
export async function confirmDraft(userId: number) {
  const draft = await getDraftByUserId(userId);
  if (!draft) return null;
  // guard against a double-confirm creating a second Program from the same draft
  // (e.g. a double-click, or hitting the endpoint again after already confirming)
  if (draft.confirmed) throw new DraftAlreadyConfirmedError();

  const program = await createProgramFromData(draft.programData, userId);

  await prisma.programDraft.update({
    where: { id: draft.id },
    data: { confirmed: true, editNotes: null }
  });

  return program;
}

// client leaves a free-text "please change this" note instead of confirming
export async function requestDraftEdit(userId: number, notes: string) {
  const draft = await getDraftByUserId(userId);
  if (!draft) return null;

  return await prisma.programDraft.update({
    where: { id: draft.id },
    data: { editNotes: notes }
  });
}
