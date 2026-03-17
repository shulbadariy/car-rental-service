import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cars = [
    { brand: 'Toyota', model: 'Corolla', year: 2020, startPrice: 10, pricePerMinute: 0.35, lat: 0, lng: 0 },
    { brand: 'BMW', model: '320', year: 2021, startPrice: 12, pricePerMinute: 0.5, lat: 0, lng: 0 },
    { brand: 'Tesla', model: 'Model 3', year: 2022, startPrice: 15, pricePerMinute: 0.6, lat: 0, lng: 0 },
    { brand: 'Audi', model: 'A4', year: 2019, startPrice: 11, pricePerMinute: 0.45, lat: 0, lng: 0 },
    { brand: 'Mercedes', model: 'C200', year: 2020, startPrice: 13, pricePerMinute: 0.55, lat: 0, lng: 0 },
    { brand: 'Volkswagen', model: 'Golf', year: 2018, startPrice: 9, pricePerMinute: 0.3, lat: 0, lng: 0 },
  ];

  await prisma.car.createMany({
    data: cars,
    skipDuplicates: true,
  });

  console.log('Seeded cars');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
