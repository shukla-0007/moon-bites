-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "label" TEXT NOT NULL DEFAULT 'My Meal Plan',
    "time" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "veg" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderHistoryId" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_orderHistoryId_fkey" FOREIGN KEY ("orderHistoryId") REFERENCES "OrderHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_orderHistoryId_key" ON "Feedback"("orderHistoryId");
