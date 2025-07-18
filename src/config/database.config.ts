import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function getEnv(name: string, fallback: string): string {
  return process.env[name] && process.env[name].trim() !== '' ? process.env[name] : fallback;
}

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres.klasiqvayzpgbojzyxbg:f4c5J0URwHIM5iAG@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

console.log('Database config:', {
  url: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'Using default DATABASE_URL',
  ssl: databaseConfig.ssl,
  extra: databaseConfig.extra,
});

export { databaseConfig };
