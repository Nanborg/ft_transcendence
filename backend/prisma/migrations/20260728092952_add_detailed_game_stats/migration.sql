/*
  Warnings:

  - Added the required column `abandoned` to the `GameRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lost` to the `GameRun` table without a default value. This is not possible if the table is not empty.
  - Added the required column `damageDealt` to the `PlayerRunStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `damageReceived` to the `PlayerRunStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deaths` to the `PlayerRunStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upgrade1` to the `PlayerRunStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upgrade2` to the `PlayerRunStats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upgrade3` to the `PlayerRunStats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameRun" ADD COLUMN     "abandoned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lost" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PlayerRunStats" ADD COLUMN     "damageDealt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "damageReceived" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deaths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upgrade1" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upgrade2" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upgrade3" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "expiresAt" DROP DEFAULT;
