-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- Preserve existing friends as accepted friendships before dropping the old join table.
INSERT INTO "Friendship" ("userId", "friendId", "status")
SELECT LEAST("A", "B"), GREATEST("A", "B"), 'ACCEPTED'
FROM "_UserFriends"
WHERE "A" <> "B"
ON CONFLICT ("userId", "friendId") DO NOTHING;

-- DropForeignKey
ALTER TABLE "_UserFriends" DROP CONSTRAINT "_UserFriends_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserFriends" DROP CONSTRAINT "_UserFriends_B_fkey";

-- DropTable
DROP TABLE "_UserFriends";

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
