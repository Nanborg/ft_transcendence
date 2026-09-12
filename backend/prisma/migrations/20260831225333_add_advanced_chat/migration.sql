-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'GAME_INVITATION', 'GAME_NOTIFICATION');

-- CreateEnum
CREATE TYPE "GameInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER,
    "recipientId" INTEGER,
    "roomId" TEXT,
    "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "blockerId" INTEGER NOT NULL,
    "blockedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "GameInvitation" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "senderId" INTEGER,
    "recipientId" INTEGER NOT NULL,
    "roomId" TEXT,
    "status" "GameInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "GameInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_recipientId_createdAt_idx" ON "ChatMessage"("senderId", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_recipientId_senderId_createdAt_idx" ON "ChatMessage"("recipientId", "senderId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_recipientId_readAt_idx" ON "ChatMessage"("recipientId", "readAt");

-- CreateIndex
CREATE INDEX "UserBlock_blockedId_idx" ON "UserBlock"("blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "GameInvitation_messageId_key" ON "GameInvitation"("messageId");

-- CreateIndex
CREATE INDEX "GameInvitation_recipientId_status_createdAt_idx" ON "GameInvitation"("recipientId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "GameInvitation_senderId_createdAt_idx" ON "GameInvitation"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "GameInvitation_roomId_idx" ON "GameInvitation"("roomId");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInvitation" ADD CONSTRAINT "GameInvitation_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInvitation" ADD CONSTRAINT "GameInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInvitation" ADD CONSTRAINT "GameInvitation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInvitation" ADD CONSTRAINT "GameInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A chat message must target exactly one destination:
-- either one private recipient or one room.
ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_exactly_one_destination_check"
CHECK (
    (
        "recipientId" IS NOT NULL
        AND "roomId" IS NULL
    )
    OR
    (
        "recipientId" IS NULL
        AND "roomId" IS NOT NULL
    )
);

-- Text content must remain non-empty and reasonably bounded.
ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_content_length_check"
CHECK (
    char_length(btrim("content")) BETWEEN 1 AND 2000
);

-- A user cannot send a private message to themselves.
-- NULL senders remain allowed for system notifications or deleted users.
ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_different_users_check"
CHECK (
    "senderId" IS NULL
    OR "recipientId" IS NULL
    OR "senderId" <> "recipientId"
);

-- Read receipts only apply to private messages.
ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_read_receipt_destination_check"
CHECK (
    "readAt" IS NULL
    OR "recipientId" IS NOT NULL
);

-- A user cannot block themselves.
ALTER TABLE "UserBlock"
ADD CONSTRAINT "UserBlock_different_users_check"
CHECK (
    "blockerId" <> "blockedId"
);

-- An invitation cannot target its sender.
-- The sender can later become NULL if their account is deleted.
ALTER TABLE "GameInvitation"
ADD CONSTRAINT "GameInvitation_different_users_check"
CHECK (
    "senderId" IS NULL
    OR "senderId" <> "recipientId"
);

-- Invitations must expire after their creation.
ALTER TABLE "GameInvitation"
ADD CONSTRAINT "GameInvitation_expiration_check"
CHECK (
    "expiresAt" > "createdAt"
);

-- A recorded response cannot predate the invitation.
ALTER TABLE "GameInvitation"
ADD CONSTRAINT "GameInvitation_response_date_check"
CHECK (
    "respondedAt" IS NULL
    OR "respondedAt" >= "createdAt"
);
