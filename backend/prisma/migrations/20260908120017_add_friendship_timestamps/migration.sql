
-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Backfill existing rows
UPDATE "Friendship" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Make updatedAt required now that every row has a value
ALTER TABLE "Friendship" ALTER COLUMN "updatedAt" SET NOT NULL;
