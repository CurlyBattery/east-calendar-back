import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Roles } from '@app/common';
import { RoleUser } from '../../generated/prisma';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers() {
    return this.userService.getAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Roles(RoleUser.ADMIN)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
