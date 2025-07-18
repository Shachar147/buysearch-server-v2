import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'db.klasiqvayzpgbojzyxbg.supabase.co' || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres' || 'buysearch_user',
  password: process.env.DB_PASSWORD || 'f4c5J0URwHIM5iAG' || 'buysearch_password',
  database: process.env.DB_NAME || 'postgres' || 'buysearch',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in development
  logging: false, // Disable query logging
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: process.env.NODE_ENV === 'production' ? {
    ssl: {
      rejectUnauthorized: false,
    },
  } : {},
}; 

