import puppeteer, { Browser, Page } from 'puppeteer';

export interface BrowserOptions {
  headless?: boolean;
  args?: string[];
  timeout?: number;
  maxPages?: number;
  maxRetries?: number;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private activePages: Set<Page> = new Set();
  private readonly options: Required<BrowserOptions>;
  private isShuttingDown = false;

  constructor(options: BrowserOptions = {}) {
    this.options = {
      headless: true,
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
      ],
      timeout: 60000,
      maxPages: 5,
      maxRetries: 3,
      ...options
    };
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      return; // Already initialized
    }

    try {
      console.log('🔄 Initializing browser...');
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: this.options.args,
        timeout: this.options.timeout,
      });

      // Set up browser event handlers
      this.browser.on('disconnected', () => {
        console.log('⚠️ Browser disconnected');
        this.browser = null;
      });

      console.log('✅ Browser initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    }
  }

  /**
   * Create a new page with proper error handling
   */
  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    if (this.activePages.size >= this.options.maxPages) {
      throw new Error(`Maximum number of pages (${this.options.maxPages}) reached`);
    }

    try {
      const page = await this.browser!.newPage();
      this.activePages.add(page);

      // Set up page event handlers
      page.on('close', () => {
        this.activePages.delete(page);
      });

      page.on('error', (error) => {
        console.error('❌ Page error:', error);
        this.activePages.delete(page);
      });

      // Set default timeout
      page.setDefaultTimeout(this.options.timeout);
      page.setDefaultNavigationTimeout(this.options.timeout);

      return page;
    } catch (error) {
      console.error('❌ Failed to create page:', error);
      throw error;
    }
  }

  /**
   * Safely close a page
   */
  async closePage(page: Page): Promise<void> {
    if (!page || page.isClosed()) {
      return;
    }

    try {
      this.activePages.delete(page);
      await page.close();
    } catch (error) {
      console.error('❌ Error closing page:', error);
    }
  }

  /**
   * Execute a function with a page, ensuring proper cleanup
   */
  async withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
    let page: Page | null = null;
    try {
      page = await this.createPage();
      return await fn(page);
    } catch (error) {
      console.error('❌ Error in page operation:', error);
      throw error;
    } finally {
      if (page) {
        await this.closePage(page);
      }
    }
  }

  /**
   * Execute a function with retry logic
   */
  async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Attempt ${attempt}/${this.options.maxRetries} failed:`, error);
        
        if (attempt < this.options.maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Get current browser stats
   */
  getStats() {
    return {
      isInitialized: !!this.browser,
      activePages: this.activePages.size,
      maxPages: this.options.maxPages,
      isShuttingDown: this.isShuttingDown
    };
  }

  /**
   * Clean up all resources
   */
  async cleanup(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log('🧹 Cleaning up browser resources...');

    // Close all active pages
    const pagesToClose = Array.from(this.activePages);
    await Promise.allSettled(pagesToClose.map(page => this.closePage(page)));

    // Close browser
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('✅ Browser closed successfully');
      } catch (error) {
        console.error('❌ Error closing browser:', error);
      } finally {
        this.browser = null;
      }
    }

    this.activePages.clear();
    this.isShuttingDown = false;
  }

  /**
   * Force kill browser process (emergency cleanup)
   */
  async forceKill(): Promise<void> {
    console.log('🚨 Force killing browser...');
    
    if (this.browser) {
      try {
        const process = this.browser.process();
        if (process) {
          process.kill('SIGKILL');
        }
      } catch (error) {
        console.error('❌ Error force killing browser:', error);
      }
    }
    
    this.browser = null;
    this.activePages.clear();
    this.isShuttingDown = false;
  }
}

// Global browser manager instance
let globalBrowserManager: BrowserManager | null = null;

/**
 * Get or create the global browser manager
 */
export function getBrowserManager(options?: BrowserOptions): BrowserManager {
  if (!globalBrowserManager) {
    globalBrowserManager = new BrowserManager(options);
  }
  return globalBrowserManager;
}

/**
 * Clean up the global browser manager
 */
export async function cleanupBrowserManager(): Promise<void> {
  if (globalBrowserManager) {
    await globalBrowserManager.cleanup();
    globalBrowserManager = null;
  }
}

/**
 * Emergency cleanup function for process termination
 */
export function setupEmergencyCleanup(): void {
  const cleanup = async () => {
    console.log('\n🛑 Emergency cleanup triggered...');
    if (globalBrowserManager) {
      await globalBrowserManager.forceKill();
    }
    process.exit(1);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught exception:', error);
    await cleanup();
  });
  process.on('unhandledRejection', async (reason) => {
    console.error('❌ Unhandled rejection:', reason);
    await cleanup();
  });
} 