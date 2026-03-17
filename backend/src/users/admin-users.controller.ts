import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('admins')
  @Roles(Role.SUPERADMIN)
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Patch('users/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete('users/:id')
  @Roles(Role.SUPERADMIN)
  deleteUser(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}