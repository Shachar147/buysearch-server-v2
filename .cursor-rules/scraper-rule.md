---
title: Scraper Implementation Rule
description: All new scrapers must follow the BaseScraper pattern, use axios/cheerio, export main(), and be registered in package.json and the cron service. List all current scrapers including story_scraper.ts.
---

# Scraper Implementation Rule

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