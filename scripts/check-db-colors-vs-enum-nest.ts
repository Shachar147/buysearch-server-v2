import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ColorService } from '../src/color/color.service';
import { Color as ColorEnum } from '../src/color.constants';

async function main() {
  const args = process.argv.slice(2);
  const doFix = args.includes('--fix');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const colorService = app.get(ColorService);

  // Fetch all colors from database
  const dbColors = await colorService.findAllNoPagination();
  const dbColorNames = dbColors.map((c: any) => c.name.trim());

  // Get all enum values
  const enumValues = new Set(Object.values(ColorEnum) as string[]);
  
  // Find colors in DB that are not in the enum
  const missing = dbColorNames.filter(name => !enumValues.has(name));

  if (missing.length === 0) {
    console.log('✅ All DB colors exist in the Color enum.');
  } else {
    console.log('❌ Colors in DB but missing from Color enum:');
    console.log('='.repeat(50));
    missing.forEach(name => console.log(`- "${name}"`));
    console.log('='.repeat(50));
    console.log(`Total missing colors: ${missing.length}`);
  }

  // Show statistics
  console.log('\n📊 Statistics:');
  console.log(`- Total colors in database: ${dbColors.length}`);
  console.log(`- Total colors in enum: ${enumValues.size}`);
  console.log(`- Colors on db that aren't on enum: ${missing.length}`);
  console.log(`- Colors on enum that aren't on db: ${dbColors.length - missing.length}`);

  // Show enum values that are not in database
  const dbColorSet = new Set(dbColorNames);
  const enumNotInDb = Array.from(enumValues).filter(enumColor => !dbColorSet.has(enumColor));
  
  if (enumNotInDb.length > 0) {
    console.log('\n📋 Colors in enum but not in database:');
    enumNotInDb.forEach(color => console.log(`- "${color}"`));
    console.log(`Total enum colors not in DB: ${enumNotInDb.length}`);
  }

  if (!doFix) {
    await app.close();
    return;
  }

  console.log('\n🔧 Fix mode not implemented for colors yet.');
  console.log('To fix missing colors, you would need to:');
  console.log('1. Add the missing colors to the Color enum');
  console.log('2. Update the COLOR_NORMALIZATION_MAP if needed');
  console.log('3. Update the colorNameToColor mapping if needed');

  await app.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 