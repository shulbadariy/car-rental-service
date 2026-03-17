-- Add new pricing fields and remove dailyRate

-- Add startPrice and pricePerMinute with defaults so existing rows are valid
ALTER TABLE "Car" ADD COLUMN "startPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Car" ADD COLUMN "pricePerMinute" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Drop the old dailyRate column (data loss is expected as pricing model changes)
ALTER TABLE "Car" DROP COLUMN "dailyRate";
