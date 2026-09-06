-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- Preserve existing friendship statuses while converting TEXT to enum.
ALTER TABLE "Friendship"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Friendship"
ALTER COLUMN "status" TYPE "FriendshipStatus"
USING "status"::"FriendshipStatus";

ALTER TABLE "Friendship"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- A user cannot create a friendship with themselves.
ALTER TABLE "Friendship"
ADD CONSTRAINT "Friendship_different_users_check"
CHECK ("userId" <> "friendId");

-- A user pair can have only one relationship, regardless of its direction.
CREATE UNIQUE INDEX "Friendship_unique_user_pair_idx"
ON "Friendship" (
    LEAST("userId", "friendId"),
    GREATEST("userId", "friendId")
);
