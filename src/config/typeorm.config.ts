import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Vet } from '../vets/entities/vet.entity';
import { Owner } from '../owners/entities/owner.entity';
import { AddGeolocationColumns1652345678901 } from '../migrations/1652345678901-AddGeolocationColumns';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres', // change to your database type
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'petcare',
  entities: [Vet, Owner],
  migrations: [AddGeolocationColumns1652345678901],
  synchronize: false, // Set to false in production
  migrationsRun: true,
};