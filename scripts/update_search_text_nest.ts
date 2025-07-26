import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

const BATCH_SIZE = 1000;

async function main() {
  console.log('🚀 Starting search_text update script...');
  const startTime = Date.now();
  
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const dataSource = app.get(DataSource);

  console.log('📊 Getting total product count...');
  //   const countResult = await dataSource.query('SELECT COUNT(*) as total FROM products');
  const countResult = await dataSource.query('SELECT COUNT(*) as total FROM products WHERE search_text IS NULL');
  const total = parseInt(countResult[0].total);
  let processed = 0;

  console.log(`📈 Found ${total} products to update in batches of ${BATCH_SIZE}...`);
  console.log('⏱️  Starting batch processing...\n');

  while (processed < total) {
    const batchStartTime = Date.now();
    console.log(`🔄 Processing batch ${Math.floor(processed / BATCH_SIZE) + 1} (offset: ${processed})...`);
    
    // Use raw query to fetch products with relations
    const products = await dataSource.query(`
      SELECT 
        p.id,
        p.title,
        b.name as brand_name,
        s.name as source_name,
        string_agg(DISTINCT c.name, ' ') as category_names,
        string_agg(DISTINCT col.name, ' ') as color_names
      FROM products p
      LEFT JOIN brands b ON b.id = p."brandId"
      LEFT JOIN sources s ON s.id = p."sourceId"
      LEFT JOIN product_categories pc ON pc."productId" = p.id
      LEFT JOIN categories c ON c.id = pc."categoryId"
      LEFT JOIN product_colors pcol ON pcol."productId" = p.id
      LEFT JOIN colors col ON col.id = pcol."colorId"
      WHERE p.search_text IS NULL
      GROUP BY p.id, p.title, b.name, s.name
      ORDER BY p.id
      LIMIT $1 OFFSET $2
    `, [BATCH_SIZE, processed]);

    // comment WHERE p.search_text IS NULL

    
    console.log(`📥 Fetched ${products.length} products in ${Date.now() - batchStartTime}ms`);

    if (products.length === 0) {
      console.log('✅ No more products to process');
      break;
    }

    // Prepare bulk update data
    const updateData = products.map(product => {
      const searchText = [
        product.title,
        product.brand_name,
        product.source_name,
        product.category_names,
        product.color_names
      ].filter(Boolean).join(' ');
      
      return { id: product.id, search_text: searchText };
    });

    // Bulk update using CASE statement
    const updateStartTime = Date.now();
    const caseStatements = updateData.map((_, index) => 
      `WHEN id = $${index * 2 + 1} THEN $${index * 2 + 2}`
    ).join(' ');
    
    const params = updateData.flatMap(item => [item.id, item.search_text]);
    
    await dataSource.query(`
      UPDATE products 
      SET search_text = CASE ${caseStatements} END
      WHERE id IN (${updateData.map((_, index) => `$${index * 2 + 1}`).join(', ')})
    `, params);

    const updateTime = Date.now() - updateStartTime;
    processed += products.length;
    const elapsedTime = Date.now() - startTime;
    
    // Calculate ETA
    const avgTimePerProduct = elapsedTime / processed;
    const remainingProducts = total - processed;
    const etaSeconds = Math.round((avgTimePerProduct * remainingProducts) / 1000);
    
    console.log(`⚡ Updated ${products.length} products in ${updateTime}ms`);
    console.log(`📊 Progress: ${processed}/${total} products (${Math.round((processed/total)*100)}%)`);
    console.log(`⏱️  Elapsed: ${Math.round(elapsedTime/1000)}s | ETA: ${etaSeconds}s\n`);
  }

  const totalTime = Date.now() - startTime;
  console.log(`🎉 Successfully updated ${processed} products!`);
  console.log(`⏱️  Total execution time: ${totalTime}ms (${Math.round(totalTime/1000)}s)`);
  console.log(`📈 Average time per product: ${Math.round(totalTime/processed)}ms`);

  await app.close();
  console.log('✅ Script completed successfully!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 