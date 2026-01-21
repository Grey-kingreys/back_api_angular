import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { url } from 'inspector';

@Injectable()
export class PrismaService 
extends PrismaClient
implements OnModuleInit, OnModuleDestroy
 {

    constructor() {
        const adapter = new PrismaPg(
            {
             url: process.env.DATABASE_URL 
            }
        );
        super({ adapter });
    }

    async onModuleInit() {
        console.log('DATABASE_URL =', process.env.DATABASE_URL); 
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}