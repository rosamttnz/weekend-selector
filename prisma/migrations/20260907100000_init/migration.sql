CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Poll_slug_key" ON "Poll"("slug");

CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "editToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Response_editToken_key" ON "Response"("editToken");

CREATE TABLE "Unavailable" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "weekend" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Unavailable_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Unavailable_responseId_weekend_key" ON "Unavailable"("responseId", "weekend");

ALTER TABLE "Response"
ADD CONSTRAINT "Response_pollId_fkey"
FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Unavailable"
ADD CONSTRAINT "Unavailable_responseId_fkey"
FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;
