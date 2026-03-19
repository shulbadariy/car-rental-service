import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  getAll() {
    return this.usersService.getAllUsers();
  }

  @Get('admins')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  getAdmins() {
    return this.usersService.getAdmins();
  }

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.userId);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(@CurrentUser() actor: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto, actor.role);
  }

  @Patch(':id/soft-delete')
  @Roles(Role.SUPERADMIN)
  softDelete(@CurrentUser() actor: any, @Param('id') id: string) {
    return this.usersService.softDelete(id, actor);
  }
}
