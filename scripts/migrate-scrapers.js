#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of scrapers to migrate
const scrapers = [
  'adidas_scraper.ts',
  'newbalance_scraper.ts',
  'ioptic_scraper.ts',
  'castro_scraper.ts',
  'jdsports_scraper.ts',
  'renuar_scraper.ts',
  'foxhome_scraper.ts',
  'ralph_lauren_scraper.ts',
  'golf_and_co_scraper.ts',
  'revolve_scraper.ts',
  'hamashbir_scraper.ts',
  'zarahome_scraper.ts',
  'chozen_scraper.ts',
  'story_scraper.ts',
  'primark_scraper.ts',
  'legaloutfit_scraper.ts',
  'footlocker_scraper.ts',
  'newera_scraper.ts',
  'razili_scraper.ts',
  'carolinalemke_scraper.ts',
  'hollister_scraper.ts',
  'zara_scraper.ts',
  'tommy_scraper.ts',
  'bananhot_scraper.ts',
  'alo_yoga_scraper.ts',
  'asos_scraper.ts',
  'factory54_scraper.ts',
  'gant_scraper.ts',
  'stockx_scraper.ts',
  'styleforrent_scraper.ts',
  'terminalx_scraper.ts'
];

const scrapersDir = path.join(__dirname, '../src/scrapers');

console.log('🔧 Scraper Migration Helper');
console.log('==========================');
console.log('');
console.log('This script will help you identify scrapers that need migration.');
console.log('');

// Check which scrapers exist and need migration
const existingScrapers = [];
const missingScrapers = [];

scrapers.forEach(scraper => {
  const filePath = path.join(scrapersDir, scraper);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it uses the old pattern
    const hasOldPattern = content.includes('puppeteer.launch') && 
                         content.includes('browser.newPage') && 
                         content.includes('browser.close');
    
    if (hasOldPattern) {
      existingScrapers.push({ name: scraper, needsMigration: true });
    } else {
      existingScrapers.push({ name: scraper, needsMigration: false });
    }
  } else {
    missingScrapers.push(scraper);
  }
});

console.log('📊 Migration Status:');
console.log('===================');

const needsMigration = existingScrapers.filter(s => s.needsMigration);
const alreadyMigrated = existingScrapers.filter(s => !s.needsMigration);

console.log(`✅ Already migrated: ${alreadyMigrated.length}`);
alreadyMigrated.forEach(s => console.log(`   - ${s.name}`));

console.log(`🔄 Needs migration: ${needsMigration.length}`);
needsMigration.forEach(s => console.log(`   - ${s.name}`));

if (missingScrapers.length > 0) {
  console.log(`❌ Missing files: ${missingScrapers.length}`);
  missingScrapers.forEach(s => console.log(`   - ${s.name}`));
}

console.log('');
console.log('📋 Migration Commands:');
console.log('=====================');

needsMigration.forEach(scraper => {
  console.log(`# Migrate ${scraper.name}:`);
  console.log(`# 1. Open ${scraper.name}`);
  console.log(`# 2. Replace puppeteer import with browser helpers`);
  console.log(`# 3. Replace browser creation pattern`);
  console.log(`# 4. Test the scraper`);
  console.log('');
});

console.log('📖 For detailed instructions, see: SCRAPER_MIGRATION_GUIDE.md');
console.log('📝 Example migration: server/src/scrapers/nike_scraper.ts');
console.log('');

// Generate a simple migration template
console.log('📄 Quick Migration Template:');
console.log('===========================');
console.log(`
// OLD PATTERN (replace this):
private async fetchPage(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url);
    const html = await page.content();
    return html;
  } finally {
    await browser.close();
  }
}

// NEW PATTERN (use this):
private async fetchPage(url: string): Promise<string> {
  return fetchPageWithBrowser(url, {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    waitUntil: 'networkidle2',
    timeout: 60000
  });
}
`);

console.log('🚀 Happy migrating!'); 