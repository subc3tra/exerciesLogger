-- CreateTable
CREATE TABLE "ProgramDraft" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "intakeSubmissionId" INTEGER NOT NULL,
    "programData" JSONB NOT NULL,
    "editNotes" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramDraft_intakeSubmissionId_key" ON "ProgramDraft"("intakeSubmissionId");

-- AddForeignKey
ALTER TABLE "ProgramDraft" ADD CONSTRAINT "ProgramDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDraft" ADD CONSTRAINT "ProgramDraft_intakeSubmissionId_fkey" FOREIGN KEY ("intakeSubmissionId") REFERENCES "IntakeSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
