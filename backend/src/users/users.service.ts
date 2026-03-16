import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ where: { deletedAt: null } });
  }

  findOne(id: string) {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  findMe(userId: string) {
    return this.findOne(userId);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async softDelete(id: string) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
