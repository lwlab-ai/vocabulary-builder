-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "seenAt" DATETIME,
    "known" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserWord" ("id", "seen", "seenAt", "userId", "wordId") SELECT "id", "seen", "seenAt", "userId", "wordId" FROM "UserWord";
DROP TABLE "UserWord";
ALTER TABLE "new_UserWord" RENAME TO "UserWord";
CREATE UNIQUE INDEX "UserWord_userId_wordId_key" ON "UserWord"("userId", "wordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
