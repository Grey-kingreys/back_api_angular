import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService){}

  async getUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return {
        data: users,
        message: 'Les utilisateurs trouvés',
        success: true
      };
    } catch (error) {
      return {
        data: null,
        message: error.message || 'Users not found',
        success: false
      };
    }
  }

  async getUser({userId} : {userId: string}) {
    try {
      const user = await this.prisma.user.findUnique({
      where: {
        id : userId
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    return {
      data: user,
      message: "Utilisateur trouvé",
      success: true
    }}
    catch(erreur) {
      console.error('erreur complet: ', erreur);
      console.error('message: ', erreur.message);
      console.error('stack: ', erreur.stack);
      return {
        data: null,
        message: erreur.message || 'User not found',
        success: false
      }
    }
  }

  update({userId} : {userId: string}, updateUserDto: UpdateUserDto) {
    return `This action updates a #${userId} user`;
  }

  remove({userId} : {userId: string}) {
    return `This action removes a #${userId} user`;
  }
}

