-- CreateTable
CREATE TABLE "constructions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "technicalManager" TEXT NOT NULL,
    "initialDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_constructions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "constructionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_constructions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "constructions_name_key" ON "constructions"("name");

-- AddForeignKey
ALTER TABLE "users_constructions" ADD CONSTRAINT "users_constructions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_constructions" ADD CONSTRAINT "users_constructions_constructionId_fkey" FOREIGN KEY ("constructionId") REFERENCES "constructions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
