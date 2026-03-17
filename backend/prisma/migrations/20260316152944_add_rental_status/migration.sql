-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('ACTIVE', 'FINISHED');

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "status" "RentalStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Rental_status_idx" ON "Rental"("status");
