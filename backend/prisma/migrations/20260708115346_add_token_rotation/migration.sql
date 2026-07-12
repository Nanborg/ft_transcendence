/*
  Warnings:

  - Added the required column `expiresAt` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
/*
ALTER TABLE "RefreshToken" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isRevoked" BOOLEAN NOT NULL DEFAULT false;
I edit that because NOT NULL can fail if RefreshToken already has rows -Nanborg*/
ALTER TABLE "RefreshToken"
ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '7 days',
ADD COLUMN "isRevoked" BOOLEAN NOT NULL DEFAULT false;

