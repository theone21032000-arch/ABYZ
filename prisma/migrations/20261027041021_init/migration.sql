-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('WEBSITE', 'WEB_APP', 'MOBILE_APP', 'DASHBOARD', 'API', 'INTERNAL_TOOL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('IDEA', 'IN_DESIGN', 'SPECIFICATIONS_READY', 'EXISTING_CODE');

-- CreateEnum
CREATE TYPE "ThoughtBlockType" AS ENUM ('IDEA', 'OBJECTIVE', 'USER', 'PAGE', 'FEATURE', 'BUSINESS_RULE', 'DATA', 'INTERACTION', 'DESIGN', 'CONSTRAINT', 'QUESTION', 'DECISION', 'TEST');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProjectType" NOT NULL,
    "stage" "ProjectStage" NOT NULL DEFAULT 'IDEA',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thought" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ThoughtBlockType" NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thought_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_ownerId_updatedAt_idx" ON "Project"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Thought_projectId_position_idx" ON "Thought"("projectId", "position");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thought" ADD CONSTRAINT "Thought_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
