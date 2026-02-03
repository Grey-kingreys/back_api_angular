import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { userPayload } from './jwt.strategy';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { EmailService } from 'src/common/services/email.service';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) { }

  /**
   * Connexion d'un utilisateur
   */
  async login({ authBody }: { authBody: LoginUserDto }) {
    try {
      const { email, password } = authBody;

      // Recherche de l'utilisateur
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        }
      });

      // Vérification existence utilisateur
      if (!existingUser) {
        throw new UnauthorizedException("Email ou mot de passe incorrect");
      }


      // Vérification du mot de passe
      const isPasswordValid = await this.comparePassword({
        password,
        hashedPassword: existingUser.password
      });

      if (!isPasswordValid) {
        throw new UnauthorizedException("Email ou mot de passe incorrect");
      }

      // Génération du token
      const tokens = this.authenticateUser({ userId: existingUser.id });

      return {
        data: {
          ...tokens,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          }
        },
        message: "Connexion réussie",
        success: true
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Erreur lors de la connexion:', error);
      throw new BadRequestException("Une erreur est survenue lors de la connexion");
    }
  }

  /**
   * Inscription d'un nouvel utilisateur (role USER uniquement)
   */
  async register({ registerBody }: { registerBody: CreateUserDto }) {
    try {
      const { name, email, password } = registerBody;

      // Vérification si l'email existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new ConflictException("Un utilisateur avec cet email existe déjà");
      }

      // Hashage du mot de passe
      const hashedPassword = await this.hashPassword({ password });

      // Création de l'utilisateur avec le rôle USER par défaut
      const user = await this.prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        }
      });

      // Génération du token
      const tokens = this.authenticateUser({ userId: user.id });

      // TODO: Envoyer un email de bienvenue
      await this.emailService.sendWelcomeEmail(user.email, user.name);

      return {
        data: {
          ...tokens,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        },
        message: "Inscription réussie ! Un email de bienvenue vous a été envoyé.",
        success: true
      };

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      console.error('Erreur lors de l\'inscription:', error);
      throw new BadRequestException(
        error.message || "Une erreur est survenue lors de l'inscription"
      );
    }
  }

  /**
   * Hashage d'un mot de passe
   */
  private async hashPassword({ password }: { password: string }): Promise<string> {
    const saltRounds = 12; // Plus sécurisé que 10
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  /**
   * Comparaison d'un mot de passe avec son hash
   */
  private async comparePassword({
    password,
    hashedPassword
  }: {
    password: string;
    hashedPassword: string
  }): Promise<boolean> {
    const isPasswordSame = await bcrypt.compare(password, hashedPassword);
    return isPasswordSame;
  }

  /**
   * Génération du token JWT
   */
  private authenticateUser({ userId }: userPayload) {
    const payload: userPayload = { userId };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '7d', // Token valide 7 jours
      })
    };
  }

  /**
   * Validation d'un token JWT
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });

      if (!user) {
        throw new UnauthorizedException("Token invalide");
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException("Token invalide ou expiré");
    }
  }

  /**
   * Demande de réinitialisation de mot de passe
   * Génère un token et envoie un email
   */
  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    try {
      const {email} = forgotPassword
      // Rechercher l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
        }
      });

      // Pour des raisons de sécurité, on retourne toujours success même si l'email n'existe pas
      // Cela empêche les attaquants de savoir quels emails sont enregistrés
      if (!user) {
        return {
          data: null,
          message: "Si cet email existe, un lien de réinitialisation vous a été envoyé.",
          success: true
        };
      }


      // Générer un token sécurisé
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Token valide pendant 1 heure
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      // Enregistrer le token dans la base de données
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: resetExpires,
        }
      });

      // Envoyer l'email avec le token non hashé
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken
      );

      return {
        data: null,
        message: "Si cet email existe, un lien de réinitialisation vous a été envoyé.",
        success: true
      };

    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      throw new BadRequestException(
        "Une erreur est survenue lors de la demande de réinitialisation"
      );
    }
  }

  /**
   * Réinitialisation du mot de passe avec le token
   */
  async resetPassword(resetPassword: ResetPasswordDto) {
    try {

      const {token, newPassword} = resetPassword;
      // Hasher le token reçu pour le comparer avec celui en base
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Rechercher l'utilisateur avec ce token valide
      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: {
            gt: new Date(), // Token non expiré
          }
        }
      });

      if (!user) {
        throw new UnauthorizedException(
          "Token invalide ou expiré. Veuillez faire une nouvelle demande de réinitialisation."
        );
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await this.hashPassword({ password: newPassword });

      // Mettre à jour le mot de passe et supprimer le token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        }
      });

      return {
        data: null,
        message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
        success: true
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Erreur lors de la réinitialisation:', error);
      throw new BadRequestException(
        "Une erreur est survenue lors de la réinitialisation du mot de passe"
      );
    }
  }

  /**
   * Vérifier la validité d'un token de réinitialisation
   * Utile pour le frontend avant d'afficher le formulaire
   */
  async verifyResetToken(token: string) {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: {
            gt: new Date(),
          },
        },
        select: {
          id: true,
          email: true,
        }
      });

      if (!user) {
        throw new UnauthorizedException("Token invalide ou expiré");
      }

      return {
        data: {
          valid: true,
          email: user.email
        },
        message: "Token valide",
        success: true
      };

    } catch (error) {
      throw new UnauthorizedException("Token invalide ou expiré");
    }
  }
}
