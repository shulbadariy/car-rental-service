import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

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

  @Post('users')
  @Roles(Role.SUPERADMIN)
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createAdminUser(dto);
  }

  @Patch('users/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateUser(@CurrentUser() actor: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto, actor.role);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  deleteUser(@CurrentUser() actor: any, @Param('id') id: string) {
    return this.usersService.softDelete(id, actor);
  }
}