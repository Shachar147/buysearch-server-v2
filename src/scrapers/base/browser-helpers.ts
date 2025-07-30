import { Page } from 'puppeteer';
import { getBrowserManager } from './browser-manager';

/**
 * Helper function to fetch a page with proper browser management
 */
export async function fetchPageWithBrowser(
  url: string,
  options: {
    userAgent?: string;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout?: number;
    extraHeaders?: Record<string, string>;
    onPageReady?: (page: Page) => Promise<void>;
  } = {}
): Promise<string> {
  const browserManager = getBrowserManager();
  
  return browserManager.withPage(async (page: Page) => {
    // Set user agent
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent);
    }

    // Set extra headers
    if (options.extraHeaders) {
      await page.setExtraHTTPHeaders(options.extraHeaders);
    }

    // Navigate to URL
    await page.goto(url, {
      waitUntil: options.waitUntil || 'networkidle2',
      timeout: options.timeout || 60000,
    });

    // Execute custom page ready logic
    if (options.onPageReady) {
      try {
      await options.onPageReady(page);
      } catch {
        
      }
    }

    // Get page content
    return await page.content();
  });
}

/**
 * Helper function to handle infinite scroll with proper cleanup
 */
export async function handleInfiniteScroll(
  page: Page,
  options: {
    scrollSelector?: string;
    productSelector: string;
    maxScrolls?: number;
    scrollDelay?: number;
    onScroll?: (currentCount: number, iteration: number) => void;
  }
): Promise<void> {
  const {
    scrollSelector = 'window',
    productSelector,
    maxScrolls = 50,
    scrollDelay = 10000,
    onScroll
  } = options;

  let previousCount = 0;
  let reachedEnd = false;
  let scrollIteration = 1;

  while (!reachedEnd && scrollIteration <= maxScrolls) {
    const productsBefore = await page.$$eval(productSelector, els => els.length);
    
    if (onScroll) {
      onScroll(productsBefore, scrollIteration);
    }

    // Scroll to bottom
    await page.evaluate((selector) => {
      if (selector === 'window') {
        window.scrollTo(0, document.body.scrollHeight - 1200);
      } else {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }
    }, scrollSelector);

    // Wait for new content to load
    await new Promise(resolve => setTimeout(resolve, scrollDelay));

    const productsAfter = await page.$$eval(productSelector, els => els.length);
    
    if (productsAfter <= productsBefore) {
      reachedEnd = true;
    }
    
    previousCount = productsAfter;
    scrollIteration++;
  }
}

/**
 * Helper function to handle cookie consent popups
 */
export async function handleCookieConsent(
  page: Page,
  selectors: string[]
): Promise<boolean> {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      // Continue to next selector
    }
  }
  return false;
}

/**
 * Helper function to get browser stats
 */
export function getBrowserStats() {
  const browserManager = getBrowserManager();
  return browserManager.getStats();
} 