import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  birthDate: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAdminUser(dto: CreateUserDto) {
    if (dto.role !== Role.ADMIN) {
      throw new BadRequestException('Only ADMIN role can be created via this endpoint.');
    }

    const existingUser = await this.prisma.user.findFirst({ where: { email: dto.email } });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (existingUser && existingUser.deletedAt === null) {
      throw new BadRequestException('This email is already registered.');
    }

    if (existingUser && existingUser.deletedAt !== null) {
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          deletedAt: null,
          firstName: dto.firstName,
          lastName: dto.lastName,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          password: passwordHash,
          role: Role.ADMIN,
        },
        select: USER_PUBLIC_SELECT,
      });
    }

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        role: Role.ADMIN,
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: 'USER',
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  getAdmins() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: {
          in: ['ADMIN', 'SUPERADMIN'],
        },
      },
      select: USER_PUBLIC_SELECT,
    });
  }

  findOne(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: USER_PUBLIC_SELECT,
    });
  }

  getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto, actorRole: Role | string) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    // ADMIN can update only USER accounts. SUPERADMIN can update everyone.
    if (actorRole === Role.ADMIN && user.role !== Role.USER) {
      throw new ForbiddenException('You do not have permission to edit this account.');
    }

    const { role, ...safeData } = dto;

    const passwordHash = safeData.password ? await bcrypt.hash(safeData.password, 10) : undefined;

    const data: any = {
      ...safeData,
      password: passwordHash,
      birthDate: safeData.birthDate ? new Date(safeData.birthDate) : safeData.birthDate,
    };

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_PUBLIC_SELECT,
    });
  }

  async softDelete(id: string, actor: { userId: string; role: Role | string }) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found.');

    if (actor.role === Role.USER) {
      throw new ForbiddenException('You do not have permission to delete users.');
    }

    if (actor.role === Role.ADMIN && user.role !== Role.USER) {
      throw new ForbiddenException('You can only delete regular users.');
    }

    if (actor.role === Role.SUPERADMIN && actor.userId === user.id) {
      throw new BadRequestException('You cannot delete yourself.');
    }

    if (user.role === Role.SUPERADMIN) {
      throw new BadRequestException('Super admin accounts cannot be deleted.');
    }

    await this.prisma.$transaction(async (tx) => {
      const activeRental = await tx.rental.findFirst({
        where: {
          userId: id,
          endDate: null,
          status: 'ACTIVE',
        },
        include: {
          car: true,
        },
      });

      if (activeRental) {
        const endDate = new Date();
        const msPerMinute = 60 * 1000;
        const minuteCount = Math.ceil((endDate.getTime() - activeRental.startDate.getTime()) / msPerMinute);
        const totalPrice = activeRental.car.startPrice + minuteCount * activeRental.car.pricePerMinute;

        await tx.rental.update({
          where: { id: activeRental.id },
          data: {
            endDate,
            status: 'FINISHED',
            totalPrice,
          },
        });

        await tx.car.update({
          where: { id: activeRental.carId },
          data: { status: 'AVAILABLE' },
        });
      }

      await tx.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    return { message: 'User deleted successfully.' };
  }
}
