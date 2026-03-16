import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cars = [
    { brand: 'Toyota', model: 'Corolla', year: 2020, dailyRate: 35, lat: 0, lng: 0 },
    { brand: 'BMW', model: '320', year: 2021, dailyRate: 70, lat: 0, lng: 0 },
    { brand: 'Tesla', model: 'Model 3', year: 2022, dailyRate: 90, lat: 0, lng: 0 },
    { brand: 'Audi', model: 'A4', year: 2019, dailyRate: 65, lat: 0, lng: 0 },
    { brand: 'Mercedes', model: 'C200', year: 2020, dailyRate: 75, lat: 0, lng: 0 },
    { brand: 'Volkswagen', model: 'Golf', year: 2018, dailyRate: 40, lat: 0, lng: 0 },
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
