import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CategoryService } from '../src/category/category.service';
import { BrandService } from '../src/brand/brand.service';
import { Category as CategoryEnum } from '../src/category.constants';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const categoryService = app.get(CategoryService);
  const brandService = app.get(BrandService);

  // Fetch all categories (adjust params as needed)
  const { data: dbCategories } = await categoryService.findAll(0, 1000, undefined);
  const dbCategoryNames = dbCategories.map((c: any) => c.name.trim());

  // Fetch all brands
  const { data: dbBrands } = await brandService.findAll(0, 1000);
  const brandNames = new Set(dbBrands.map((b: any) => b.name.trim().toLowerCase()));

  const enumValues = new Set(Object.values(CategoryEnum) as string[]);
  const missing = dbCategoryNames.filter(name => !enumValues.has(name) && !brandNames.has(name.trim().toLowerCase()));

  if (missing.length === 0) {
    console.log('All DB categories exist in the Category enum or are brands.');
  } else {
    console.log('Categories in DB but missing from Category enum (excluding brands):');
    missing.forEach(name => console.log('-', name));
  }

  await app.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 