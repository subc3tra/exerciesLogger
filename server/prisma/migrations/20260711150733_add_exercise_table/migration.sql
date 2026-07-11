/*
  Warnings:

  - You are about to drop the column `name` on the `ProgramExercise` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `ProgramExercise` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'CARDIO');

-- AlterTable
ALTER TABLE "ProgramExercise" DROP COLUMN "name",
ADD COLUMN     "exerciseId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "category" "ExerciseCategory" NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgramExercise" ADD CONSTRAINT "ProgramExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
