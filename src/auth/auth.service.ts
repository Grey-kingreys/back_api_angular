import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { userPayload } from './jwt.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService ) {}
  
  async login({authBody}: {authBody: LoginUserDto}) {
    try {
      const { email, password } = authBody;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email
        }
      })
      if (!existingUser) {
        throw new Error("l'email ou le mot de passe est incorrect")
      }
      const isPasswordSame = await this.comparePassword({password, hashedPassword: existingUser.password});
      if (!isPasswordSame) {
        throw new Error("l'email ou le mot de passe est incorrect")
      }
      return {
        data: this.authenticateUser({userId: existingUser.id}),
        message: "Utilisateur trouvé",
        success: true
      }
    } catch (error) {
      return {
        data: null,
        message: error.message,
        success: false
      }
    }
  }

  private async hashPassword({password}: {password: string}) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  private async comparePassword({password, hashedPassword}: {password: string, hashedPassword: string}) {
    const isPasswordSame = await bcrypt.compare(password, hashedPassword);
    return isPasswordSame;
  }

  private authenticateUser({userId}: userPayload){
    const payload: userPayload = {userId};
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

  async register({registerBody}: {registerBody: CreateUserDto}) {
    try {
      const {name, email, password} = registerBody;
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: email
        }
      })
      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà")
      }
      const hashedPassword = await this.hashPassword({password});
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })
      return {
        data: this.authenticateUser({userId: user.id}),
        message: "Utilisateur créé",
        success: true
      }
    } catch (error) {
      return {
        data: null,
        message: error.message,
        success: false
      }
    }
  }
}
