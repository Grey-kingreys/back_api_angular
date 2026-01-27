import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() authBody: LoginUserDto) {
    return this.authService.login({authBody})
  }

  @Post('register')
  async register(@Body() registerBody: CreateUserDto) {
    return this.authService.register({registerBody})
  }

  //localhost:3000/auth
  @UseGuards(AuthGuard)
  @Get()
  async getAuthenticatedUser(@Req() request: RequestWithUser){
    return await this.userService.getUser(
      {
        userId: request.user.userId
      }
    )
  }
  
}
