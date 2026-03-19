-- Add soft-delete support for cars
ALTER TABLE "Car"
ADD COLUMN "deletedAt" TIMESTAMP(3);
