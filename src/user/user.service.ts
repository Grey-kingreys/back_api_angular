import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserService {

  constructor(private readonly prisma: PrismaService){}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async getUsers() {
    try {
      console.log('🔍 Tentative de récupération des utilisateurs...');

      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      console.log('✅ Utilisateurs trouvés:', users.length);

      return {
        data: users,
        message: 'Users found',
        success: true
      };
    } catch (error) {
      // Affiche l'erreur complète avec tous les détails
      console.error('❌ Erreur complète:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);

      return {
        data: null,
        message: error.message || 'Users not found',
        success: false
      };
    }
  }

  getUser(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

