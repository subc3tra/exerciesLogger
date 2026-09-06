-- CreateTable
CREATE TABLE "IntakeSubmission" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "age" INTEGER,
    "weight" INTEGER,
    "height" INTEGER,
    "injuriesOrLimitations" TEXT,
    "availableTime" TEXT NOT NULL,
    "equipmentAccess" TEXT,
    "otherParallelTraining" TEXT,
    "preferredExercises" TEXT,
    "programLengthWeeks" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeSubmission_pkey" PRIMARY KEY ("id")
);
