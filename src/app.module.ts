import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { CountriesModule } from './countries/countries.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './common/services/prisma.service';

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
  providers: [PrismaService],
})
export class AppModule {}
