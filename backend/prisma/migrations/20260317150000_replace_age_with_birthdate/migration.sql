-- Replace dynamic age field with birth date.
ALTER TABLE "User"
DROP COLUMN "age",
ADD COLUMN "birthDate" TIMESTAMP(3);
