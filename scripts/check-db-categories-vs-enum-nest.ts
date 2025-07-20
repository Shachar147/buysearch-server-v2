import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CategoryService } from '../src/category/category.service';
import { BrandService } from '../src/brand/brand.service';
import { ProductService } from '../src/product/product.service';
import { Category as CategoryEnum } from '../src/category.constants';
import { normalizeCategories } from '../src/scrapers/base/scraper_utils';

async function main() {
  const args = process.argv.slice(2);
  const doFix = args.includes('--fix');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const categoryService = app.get(CategoryService);
  const brandService = app.get(BrandService);
  const productService = app.get(ProductService);

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
  if (!doFix) {
    await app.close();
    return;
  } else {
    console.log("\nChecking for fixes....")
  }

  // --- FIX MODE: Normalize product categories and log changes ---
  // Fetch all products at once (up to 1,000,000)
  const { data: products } = await productService.findAll({ offset: 0, limit: 1000000 });
  console.log(`Queried ${products.length} products... `)
  console.log(`Building Product to Categories mapping, and normalizing... `)

  let totalChanged = 0;
  let emptyCategoryCounts: Record<string, number> = {};
  let allCategoryToProductIds: Record<string, Set<number>> = {};
  let allCategoryToProductIdsAfter: Record<string, Set<number>> = {};

  // Build initial category->product map
  for (const cat of dbCategories) {
    allCategoryToProductIds[cat.name] = new Set();
    allCategoryToProductIdsAfter[cat.name] = new Set();
  }

  // Collect all products and their categories
  let totalProducts = 0;
  for (const product of products) {
    totalProducts++;
    const currentCategories = (product.categories || []).map((c: any) => c.name);
    for (const cat of currentCategories) {
      if (allCategoryToProductIds[cat]) allCategoryToProductIds[cat].add(product.id);
    }
    const normalized = normalizeCategories(currentCategories);
    if (JSON.stringify(currentCategories.sort()) !== JSON.stringify(normalized.sort())) {
      totalChanged++;
      console.log(`Product #${product.id} (${product.title}):\n  FROM: [${currentCategories.join(', ')}]\n  TO:   [${normalized.join(', ')}]`);
    }
    for (const cat of normalized) {
      if (allCategoryToProductIdsAfter[cat]) allCategoryToProductIdsAfter[cat].add(product.id);
    }
  }

  // Now, summarize empty categories after normalization
  let emptyAfter = 0;
  for (const cat of dbCategoryNames) {
    const before = allCategoryToProductIds[cat] ? allCategoryToProductIds[cat].size : 0;
    const after = allCategoryToProductIdsAfter[cat] ? allCategoryToProductIdsAfter[cat].size : 0;
    if (before > 0 && after === 0) {
      emptyAfter++;
      // Find product IDs that were in this category before but not after
      const beforeSet = allCategoryToProductIds[cat] || new Set();
      const afterSet = allCategoryToProductIdsAfter[cat] || new Set();
      const removedProductIds = Array.from(beforeSet).filter(id => !afterSet.has(id));
      // Try to find the new category/categories these products moved to
      const movedToCategories: Record<string, number> = {};
      for (const product of products) {
        if (removedProductIds.includes(product.id)) {
          const currentCategories = (product.categories || []).map((c: any) => c.name);
          const normalized = normalizeCategories(currentCategories);
          for (const normCat of normalized) {
            movedToCategories[normCat] = (movedToCategories[normCat] || 0) + 1;
          }
        }
      }
      // Find if all moved to a single category or multiple categories
      let reason = '';
      const movedCats = Object.keys(movedToCategories);
      if (movedCats.length === 1) { // && movedToCategories[movedCats[0]] === removedProductIds.length) {
        reason = `\n ... its items moved to '${movedCats[0]}'`;
      } else if (movedCats.length > 1) { // && removedProductIds.length > 0 && movedCats.reduce((sum, cat) => sum + movedToCategories[cat], 0) === removedProductIds.length) {
        reason = ` \n ... its items moved to [${movedCats.join(', ')}]`;
      } else if (movedCats.length === 0) {
        reason = '\n ... category was removed';
      }
      console.log(`\nCategory '${cat}' will become empty after normalization.${reason}`);
    //   if (removedProductIds.length > 0) {
    //     console.log(`  Products removed from '${cat}': [${removedProductIds.join(', ')}]`);
    //     removedProductIds.forEach(id => {
    //       console.log(`    - Product #${id} removed from '${cat}' because its categories changed after normalization.`);
    //     });
    //   }
    }
  }

  console.log(`\nSummary:`);
  console.log(`Products that would change: ${totalChanged}`);
  console.log(`Categories that will become empty: ${emptyAfter}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 