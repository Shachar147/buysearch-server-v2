# Chrome Memory Leak Fix - Complete Solution

## Problem Identified

Your scrapers were opening Chrome browser instances without proper cleanup, causing:
- ❌ Memory leaks and CPU errors
- ❌ Chrome processes accumulating over time
- ❌ Server crashes due to out-of-memory errors
- ❌ No error handling for browser failures

## Root Causes

1. **No Error Handling**: Browser instances weren't properly closed on errors
2. **No Page Cleanup**: Individual pages weren't being closed before browser.close()
3. **No Resource Limits**: No limits on concurrent pages or memory usage
4. **No Graceful Shutdown**: Browser processes weren't killed on process termination
5. **No Browser Reuse**: Each category created a new browser instance

## Solution Implemented

### 1. Browser Manager (`server/src/scrapers/base/browser-manager.ts`)

A centralized browser management system that provides:

- ✅ **Automatic Resource Management**: Proper browser and page lifecycle
- ✅ **Error Handling & Retries**: Automatic retry logic with exponential backoff
- ✅ **Resource Limits**: Configurable limits on concurrent pages (default: 5)
- ✅ **Memory Optimization**: Chrome flags for reduced memory usage
- ✅ **Emergency Cleanup**: Force kill browser processes on crashes
- ✅ **Monitoring**: Track active pages and browser status

### 2. Browser Helpers (`server/src/scrapers/base/browser-helpers.ts`)

Helper functions for common scraper operations:

- ✅ **fetchPageWithBrowser()**: Safe page fetching with automatic cleanup
- ✅ **handleInfiniteScroll()**: Managed infinite scroll with progress tracking
- ✅ **handleCookieConsent()**: Automated cookie consent handling
- ✅ **getBrowserStats()**: Monitor browser resource usage

### 3. Updated Base Scraper (`server/src/scrapers/base/base-scraper.ts`)

Enhanced base scraper with:

- ✅ **Browser Manager Integration**: Automatic browser management
- ✅ **Signal Handling**: Proper cleanup on SIGINT/SIGTERM
- ✅ **Error Recovery**: Browser cleanup on scraper failures

### 4. Updated Cron Service (`server/src/scrapers/base/scraper-cron.service.ts`)

Enhanced cron service with:

- ✅ **Resource Cleanup**: Browser cleanup after each cron run
- ✅ **Better Logging**: Browser resource monitoring

## Chrome Memory Optimization

The browser manager uses optimized Chrome flags:

```typescript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--no-zygote',
  '--disable-gpu',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-features=TranslateUI',
  '--disable-ipc-flooding-protection',
  '--memory-pressure-off',
  '--max_old_space_size=4096'
]
```

## Migration Status

- ✅ **Nike Scraper**: Fully migrated (example implementation)
- 🔄 **27 Scrapers**: Need migration (see migration guide)
- ✅ **4 Scrapers**: Already using alternative patterns

## How to Migrate Your Scrapers

### Quick Migration Pattern

**OLD (Problematic):**
```typescript
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
```

**NEW (Safe):**
```typescript
private async fetchPage(url: string): Promise<string> {
  return fetchPageWithBrowser(url, {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    waitUntil: 'networkidle2',
    timeout: 60000
  });
}
```

### Migration Steps

1. **Run the migration helper:**
   ```bash
   cd server && node scripts/migrate-scrapers.js
   ```

2. **Follow the migration guide:**
   - See `SCRAPER_MIGRATION_GUIDE.md` for detailed instructions
   - Use `nike_scraper.ts` as an example

3. **Test each scraper after migration**

## Benefits After Migration

1. **No More Memory Leaks**: Browser instances properly managed
2. **Better Performance**: Browser instance reuse
3. **Improved Reliability**: Automatic retries and error handling
4. **Resource Monitoring**: Track browser usage in real-time
5. **Graceful Shutdown**: Emergency cleanup on crashes
6. **Reduced CPU Usage**: Optimized Chrome flags

## Monitoring Browser Resources

```typescript
import { getBrowserStats } from './base/browser-helpers';

const stats = getBrowserStats();
console.log('Browser stats:', stats);
// Output: { isInitialized: true, activePages: 2, maxPages: 5, isShuttingDown: false }
```

## Emergency Cleanup

The browser manager automatically handles:
- ✅ SIGINT (Ctrl+C)
- ✅ SIGTERM (process termination)
- ✅ Uncaught exceptions
- ✅ Unhandled promise rejections

## Configuration Options

You can customize browser behavior:

```typescript
const browserManager = getBrowserManager({
  headless: true,
  maxPages: 10,        // Increase for parallel processing
  timeout: 120000,     // 2 minutes
  maxRetries: 5        // More retries for reliability
});
```

## Testing the Fix

1. **Run a single scraper:**
   ```bash
   cd server && npm run scraper:nike
   ```

2. **Monitor memory usage:**
   ```bash
   # Check for Chrome processes
   ps aux | grep chrome
   
   # Monitor memory
   htop
   ```

3. **Run the cron job:**
   ```bash
   cd server && npm run start:dev
   ```

## Expected Results

After migration, you should see:
- ✅ No Chrome processes left running after scraper completion
- ✅ Consistent memory usage (no gradual increase)
- ✅ Better error handling and recovery
- ✅ Improved scraper reliability
- ✅ No more server crashes due to memory issues

## Next Steps

1. **Migrate scrapers one by one** (start with the most critical ones)
2. **Test thoroughly** after each migration
3. **Monitor memory usage** during long runs
4. **Update all scrapers** following the migration guide
5. **Deploy and monitor** in production

## Support

If you encounter issues:
1. Check the migration guide: `SCRAPER_MIGRATION_GUIDE.md`
2. Look at the example: `nike_scraper.ts`
3. Monitor browser stats with `getBrowserStats()`
4. Check the logs for browser manager messages

This solution will eliminate your Chrome memory leak issues and make your scrapers much more reliable for long-running cron jobs. 