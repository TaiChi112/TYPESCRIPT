-- CreateTable
CREATE TABLE "proposal_software" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "pricing" TEXT NOT NULL,
    "features" TEXT[],
    "website" TEXT,
    "company" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_software_pkey" PRIMARY KEY ("id")
);
