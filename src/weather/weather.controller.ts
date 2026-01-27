import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('weather')
export class WeatherController {

    constructor(private readonly weatherService: WeatherService) { }

    @Get()
    async getWeather(
        @Query('lat') lat: string,
        @Query('lon') lon: string,
    ) {
        // 1. Validation : présence des paramètres
        if (!lat || !lon) {
            throw new BadRequestException('Les paramètres lat et lon sont obligatoires');
        }

        // 2. Conversion string → number
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        // 3. Validation : nombres valides
        if (isNaN(latitude) || isNaN(longitude)) {
            throw new BadRequestException('Les coordonnées doivent être des nombres valides');
        }

        // 4. Validation : plage de valeurs
        if (latitude < -90 || latitude > 90) {
            throw new BadRequestException('La latitude doit être entre -90 et 90');
        }

        if (longitude < -180 || longitude > 180) {
            throw new BadRequestException('La longitude doit être entre -180 et 180');
        }

        // 5. Appel du service
        return await this.weatherService.getWeatherByCoordinates(latitude, longitude);
    }
}