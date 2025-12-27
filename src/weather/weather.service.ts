// backend/src/weather/weather.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
    private readonly apiKey: string;
    private readonly apiUrl = 'https://api.openweathermap.org/data/2.5';

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('WEATHER_API_KEY')!;
    }

    async getWeatherByCoordinates(lat: number, lon: number) {
        const url = `${this.apiUrl}/weather`;

        const params = {
            lat,
            lon,
            appid: this.apiKey,
            units: 'metric',
            lang: 'fr'
        };

        const response$ = this.httpService.get(url, { params });
        const result = await firstValueFrom(response$);

        return result.data;
    }
}