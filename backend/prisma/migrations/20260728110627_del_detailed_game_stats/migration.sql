/*
  Warnings:

  - You are about to drop the column `score` on the `PlayerRunStats` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `PlayerRunStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PlayerRunStats" DROP COLUMN "score",
DROP COLUMN "xp";
