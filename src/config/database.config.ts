import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'buysearch_user',
  password: process.env.DB_PASSWORD || 'buysearch_password',
  database: process.env.DB_NAME || 'buysearch',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in development
  logging: false, // Disable query logging
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}; 

