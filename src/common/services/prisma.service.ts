import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;

    constructor() {
        // Créer un pool de connexions PostgreSQL
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        // Passer le pool à l'adaptateur
        const adapter = new PrismaPg(pool);

        super({ adapter });
        this.pool = pool;
    }

    async onModuleInit() {
        console.log('📦 Connexion à la base de données...');
        console.log('DATABASE_URL configurée:', process.env.DATABASE_URL ? '✅' : '❌');
        await this.$connect();
        console.log('✅ Connecté à la base de données');
    }

    async onModuleDestroy() {
        console.log('🔌 Déconnexion de la base de données...');
        await this.$disconnect();
        await this.pool.end();
    }
}