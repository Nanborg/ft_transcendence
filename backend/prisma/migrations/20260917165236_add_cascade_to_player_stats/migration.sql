-- DropForeignKey
ALTER TABLE "PlayerRunStats" DROP CONSTRAINT "PlayerRunStats_userId_fkey";

-- AddForeignKey
ALTER TABLE "PlayerRunStats" ADD CONSTRAINT "PlayerRunStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
