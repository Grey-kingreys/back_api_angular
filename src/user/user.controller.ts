import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';


@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('/:userId')
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser({userId});
  }

  @Patch(':userId')
  update(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update({userId}, updateUserDto);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.userService.remove({userId});
  }
}
