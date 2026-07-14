/*
  Warnings:

  - You are about to drop the column `unit` on the `ProgramExercise` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TrackField" AS ENUM ('REPS', 'WEIGHT', 'DURATION', 'DISTANCE');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "trackedFields" "TrackField"[];

-- Backfill existing rows before anything reads them
UPDATE "Exercise" SET "trackedFields" = ARRAY['DURATION','DISTANCE']::"TrackField"[] WHERE category = 'CARDIO';
UPDATE "Exercise" SET "trackedFields" = ARRAY['REPS','WEIGHT']::"TrackField"[] WHERE category != 'CARDIO';

-- Enforce not-null now that every row has a value
ALTER TABLE "Exercise" ALTER COLUMN "trackedFields" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProgramExercise" DROP COLUMN "unit";