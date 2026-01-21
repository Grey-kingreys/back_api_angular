import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { CountriesModule } from './countries/countries.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    WeatherModule,
    CountriesModule,
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
