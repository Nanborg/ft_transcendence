-- CreateTable
CREATE TABLE "GameRun" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "won" BOOLEAN NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerRunStats" (
    "id" SERIAL NOT NULL,
    "gameRunId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,

    CONSTRAINT "PlayerRunStats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerRunStats" ADD CONSTRAINT "PlayerRunStats_gameRunId_fkey" FOREIGN KEY ("gameRunId") REFERENCES "GameRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerRunStats" ADD CONSTRAINT "PlayerRunStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
