import { IsEmail, IsNotEmpty, Length, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email de l’utilisateur',
    })
    @IsNotEmpty({ message: "L’email est obligatoire" })
    @IsEmail({}, { message: "L’email n’est pas valide" })
    @Matches(/^[^\s<>/:!§;,?~#{}\[\]|`^&'()=+_-]+@[^\s<>/:!§;,?~#{}\[\]|`^&'()=+_-]+\.[^\s<>/:!§;,?~#{}\[\]|`^&'()=+_-]+$/, {
        message: "L’email contient des caractères non autorisés"
    })
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Mot de passe de l’utilisateur',
    })
    @IsNotEmpty()
    @Length(6, 20, {
        message: "Le mot de passe doit contenir entre 6 et 20 caractères",
    })
    password: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'Nom de l’utilisateur',
    })
    @IsNotEmpty()
    @MinLength(3, {
        message: "Le nom doit contenir au moins 3 caractères",
    })
    name: string;
}

