import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function getEnv(name: string, fallback: string): string {
  return process.env[name] && process.env[name].trim() !== '' ? process.env[name] : fallback;
}

const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'db.klasiqvayzpgbojzyxbg.supabase.co',
  port: 5432,
  username: 'postgres',
  password: 'f4c5J0URwHIM5iAG',
  database: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // extra: process.env.NODE_ENV === 'production'
  //   ? {
  //       ssl: {
  //         rejectUnauthorized: false,
  //       },
  //     }
  //   : {},
};

console.log('Database config:', {
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.username,
  database: databaseConfig.database,
  ssl: databaseConfig.ssl,
  extra: databaseConfig.extra,
});

export { databaseConfig };
