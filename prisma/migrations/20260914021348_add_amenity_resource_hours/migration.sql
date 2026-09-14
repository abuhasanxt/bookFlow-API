-- CreateTable
CREATE TABLE "resource_hours" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,

    CONSTRAINT "resource_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_hours_resourceId_idx" ON "resource_hours"("resourceId");

-- AddForeignKey
ALTER TABLE "resource_hours" ADD CONSTRAINT "resource_hours_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
