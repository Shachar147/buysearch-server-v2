import { DataSource } from 'typeorm';
import { Category as CategoryEntity } from '../src/category/category.entity';
import { Category as CategoryEnum } from '../src/category.constants';
import * as dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Setup TypeORM DataSource (adjust config as needed)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'buysearch',
  entities: [CategoryEntity],
  synchronize: false,
  logging: false,
});

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(CategoryEntity);
  const dbCategories = await repo.find({ select: ['name'], where: { isActive: true } });
  const dbCategoryNames = dbCategories.map(c => c.name.trim());

  const enumValues = new Set(Object.values(CategoryEnum) as string[]);

  const missing = dbCategoryNames.filter(name => !enumValues.has(name));

  if (missing.length === 0) {
    console.log('All DB categories exist in the Category enum.');
  } else {
    console.log('Categories in DB but missing from Category enum:');
    missing.forEach(name => console.log('-', name));
  }
  await AppDataSource.destroy();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 