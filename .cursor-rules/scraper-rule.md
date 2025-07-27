---
title: Scraper Implementation Rule
description: All new scrapers must follow the BaseScraper pattern, use axios/cheerio, export main(), and be registered in package.json and the cron service. List all current scrapers including story_scraper.ts.
---

# Scraper Implementation Rule

## Product Creation Rule
**ALWAYS use `this.createProduct()` method when creating product objects in scrapers.**

### Why?
- Ensures consistent normalization of categories, brands, and other fields
- Applies proper category extraction from product titles
- Maintains data consistency across all scrapers
- Handles edge cases and data cleaning automatically

### How to use:
```typescript
// ✅ CORRECT - Use createProduct method
return this.createProduct({
  title,
  brand: normalizedBrand,
  price,
  oldPrice,
  salePercent,
  currency: 'ILS',
  url,
  images,
  colors: extractedColors,
  categories: [category.name],
  gender: category.gender,
  isSellingFast: false,
});

// ❌ WRONG - Don't create Product objects directly
const product: Product = {
  title,
  brand: normalizedBrand,
  price,
  oldPrice,
  salePercent,
  currency: 'ILS',
  url,
  images,
  colors: extractedColors,
  source: this.source,
  categories: normalizeCategories([category.name]),
  gender: category.gender,
  isSellingFast: false,
};
return product;
```

### Required fields for createProduct:
- `title`: Product title
- `url`: Product URL
- `images`: Array of image URLs
- `colors`: Array of color names
- `price`: Current price (number or null)
- `oldPrice`: Original price (number or null)
- `salePercent`: Sale percentage (number or null)
- `currency`: Currency code (string)
- `brand`: Brand name (will be normalized)
- `categories`: Array of category names (will be normalized)
- `gender`: Gender ('Men', 'Women', 'Unisex')
- `isSellingFast`: Boolean flag for fast-selling items

### Benefits:
1. **Automatic normalization**: Categories and brands are normalized consistently
2. **Title-based category extraction**: Additional categories are extracted from product titles
3. **Data consistency**: All scrapers produce the same data structure
4. **Maintainability**: Changes to normalization logic only need to be made in one place

## 1. Base Pattern
- All scrapers must extend `BaseScraper` from `base-scraper.ts`.
- Use `axios` for HTTP requests and `cheerio` for HTML parsing.
- Implement `getCategories()`, `scrapeCategory()`, and a CLI `main()` entry point.
- Export both `main` and the scraper class.

## 2. Registration
- Every new scraper must be added to:
  - `package.json` as a script (e.g., `scrape:story`)
  - `package.json` in `npm run scrape:all`
  - `scraper-cron.service.ts` for scheduled runs

## 3. Current Scrapers
- `asos_scraper.ts`
- `terminalx_scraper.ts`
- `factory54_scraper.ts`
- `itaybrands_scraper.ts`
- `zara_scraper.ts`
- `story_scraper.ts`
- `oneprojectshop_scraper.ts`
- `chozen_scraper.ts`

## 4. Code Style
- Use clear comments and structure matching the other scrapers.
- Use the same product extraction fields: title, url, images, price, brand, categories, gender, source, etc.
- Use the same logging and error handling patterns.

## 5. Example
See `story_scraper.ts` for a minimal, modern example. 