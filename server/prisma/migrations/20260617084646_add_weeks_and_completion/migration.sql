/*
  Warnings:

  - You are about to drop the column `notes` on the `SessionExercise` table. All the data in the column will be lost.
  - Added the required column `daysPerWeek` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalWeeks` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayNumber` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekNumber` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "daysPerWeek" INTEGER NOT NULL,
ADD COLUMN     "totalWeeks" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dayNumber" INTEGER NOT NULL,
ADD COLUMN     "weekNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SessionExercise" DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "SessionSet" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;
