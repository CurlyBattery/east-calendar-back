import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser, Roles } from '@app/common';
import { RoleUser, User } from '../../generated/prisma';

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

  @Patch()
  async updateUser(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.update(user.id, dto);
  }

  @Delete()
  async deleteUser(@CurrentUser() user: User) {
    await this.userService.delete(user.id);
  }
}
