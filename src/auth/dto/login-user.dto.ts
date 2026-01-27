import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email de l’utilisateur',
    })
    @IsNotEmpty({ message: "L’email est obligatoire" })
    @IsEmail({}, { message: "L’email n’est pas valide" })
    @Matches(
        /^[^\s<>/:!§;,?~#{}\[\]|`^&'()=+_-]+@[^\s<>/:!§;,?~#{}\[\]|`^&'()=+_-]+\.[^\s<>/:!§;,?~#{}\[\]|`^&'()=+_-]+$/,
        { message: "L’email contient des caractères non autorisés" },
    )
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Mot de passe de l’utilisateur',
    })
    @IsNotEmpty({ message: "Le mot de passe est obligatoire" })
    @MinLength(6, {
        message: "Le mot de passe doit contenir au moins 6 caractères",
    })
    password: string;
}
