import { Controller, Get, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { AuthGuard } from 'src/auth/auth.guard';


@UseGuards(AuthGuard)
@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) { }

    @Get()
    async getAllCountries() {
        return await this.countriesService.getAllCountries();
    }

    @Get(':code')
    async getCountryByCode(@Param('code') code: string) {
        // 1. Validation : présence du code
        if (!code) {
            throw new BadRequestException('Le code pays est requis');
        }

        // 2. Validation : longueur (codes ISO : 2 ou 3 caractères)
        if (code.length < 2 || code.length > 3) {
            throw new BadRequestException('Le code pays doit faire 2 ou 3 caractères (ex: FR, FRA)');
        }

        // 3. Normalisation : conversion en majuscules
        const normalizedCode = code.toUpperCase();

        // 4. Appel du service
        return await this.countriesService.getCountryByCode(normalizedCode);
    }
}