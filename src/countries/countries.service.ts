import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CountriesService {
    private readonly apiUrl = 'https://restcountries.com/v3.1';

    constructor(private httpService: HttpService) { }

    async getAllCountries() {
        // Spécifie les champs nécessaires
        const fields = 'name,flags,capital,population,area,latlng,cca2,cca3,region';
        const url = `${this.apiUrl}/all?fields=${fields}`;

        const { data } = await firstValueFrom(this.httpService.get(url));
        return data;
    }

    async getCountryByCode(code: string) {
        // Pour un pays spécifique, on peut demander plus de détails
        const fields = 'name,flags,capital,population,area,latlng,cca2,cca3,region,subregion,languages,currencies,timezones';
        const url = `${this.apiUrl}/alpha/${code}?fields=${fields}`;

        const { data } = await firstValueFrom(this.httpService.get(url));
        return data;
    }
}