import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  // SUPERADMIN: admin@test.com / 123456
  // ADMIN: admin2@test.com / 123456
  // USER: user@test.com / 123456
  const demoUsers = [
    {
      email: 'admin@test.com',
      role: 'SUPERADMIN' as const,
      firstName: 'Super',
      lastName: 'Admin',
      birthDate: new Date('1988-04-12'),
    },
    {
      email: 'admin2@test.com',
      role: 'ADMIN' as const,
      firstName: 'City',
      lastName: 'Manager',
      birthDate: new Date('1990-09-20'),
    },
    {
      email: 'user@test.com',
      role: 'USER' as const,
      firstName: 'Demo',
      lastName: 'User',
      birthDate: new Date('1997-01-17'),
    },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        role: user.role,
        password: passwordHash,
        deletedAt: null,
      },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        role: user.role,
        password: passwordHash,
      },
    });
  }

  const demoCars = [
    {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      startPrice: 8.5,
      pricePerMinute: 0.24,
      lat: 49.8397,
      lng: 24.0297,
    },
    {
      brand: 'BMW',
      model: '320i',
      year: 2021,
      startPrice: 11,
      pricePerMinute: 0.33,
      lat: 49.8482,
      lng: 24.0214,
    },
    {
      brand: 'Tesla',
      model: 'Model 3',
      year: 2022,
      startPrice: 14.5,
      pricePerMinute: 0.42,
      lat: 49.8261,
      lng: 24.0478,
    },
    {
      brand: 'Audi',
      model: 'A4',
      year: 2019,
      startPrice: 10,
      pricePerMinute: 0.29,
      lat: 49.8584,
      lng: 24.0109,
    },
    {
      brand: 'Mercedes-Benz',
      model: 'C200',
      year: 2020,
      startPrice: 12.5,
      pricePerMinute: 0.37,
      lat: 49.8126,
      lng: 24.0703,
    },
    {
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2018,
      startPrice: 7.5,
      pricePerMinute: 0.21,
      lat: 49.8668,
      lng: 24.0595,
    },
  ];

  for (const car of demoCars) {
    const existingCar = await prisma.car.findFirst({
      where: {
        brand: car.brand,
        model: car.model,
        year: car.year,
        lat: car.lat,
        lng: car.lng,
      },
    });

    if (existingCar) {
      await prisma.car.update({
        where: { id: existingCar.id },
        data: {
          startPrice: car.startPrice,
          pricePerMinute: car.pricePerMinute,
          status: 'AVAILABLE',
          deletedAt: null,
        },
      });
      continue;
    }

    await prisma.car.create({
      data: {
        ...car,
        status: 'AVAILABLE',
      },
    });
  }
}

main()
  .catch((e) => {
    process.stderr.write(`${String(e)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
