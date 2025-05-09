-- CreateTable
CREATE TABLE "SavedMutation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "originalPrompt" TEXT NOT NULL,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedMutation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMutationVersion" (
    "id" TEXT NOT NULL,
    "savedMutationId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedMutationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutationResponse" (
    "id" TEXT NOT NULL,
    "savedMutationId" TEXT NOT NULL,
    "savedMutationVersionId" TEXT,
    "prompt" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MutationResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedMutation_userId_name_key" ON "SavedMutation"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SavedMutationVersion_savedMutationId_versionNumber_key" ON "SavedMutationVersion"("savedMutationId", "versionNumber");

-- AddForeignKey
ALTER TABLE "SavedMutation" ADD CONSTRAINT "SavedMutation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMutationVersion" ADD CONSTRAINT "SavedMutationVersion_savedMutationId_fkey" FOREIGN KEY ("savedMutationId") REFERENCES "SavedMutation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutationResponse" ADD CONSTRAINT "MutationResponse_savedMutationId_fkey" FOREIGN KEY ("savedMutationId") REFERENCES "SavedMutation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MutationResponse" ADD CONSTRAINT "MutationResponse_savedMutationVersionId_fkey" FOREIGN KEY ("savedMutationVersionId") REFERENCES "SavedMutationVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
