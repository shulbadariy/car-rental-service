import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        role: 'USER',
      },
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
    });
  }

  findOne(id: string) {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  findMe(userId: string) {
    return this.findOne(userId);
  }

  getMe(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    const { role, ...safeData } = dto;

    const data: any = {
      ...safeData,
      birthDate: safeData.birthDate ? new Date(safeData.birthDate) : safeData.birthDate,
    };

    return this.prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'SUPERADMIN') {
      throw new BadRequestException('Cannot delete SUPERADMIN');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'User soft-deleted successfully' };
  }
}
