import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec, spawn } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { resolve } from 'path';
import { AppModule } from '../../../app.module';
import { SourceService } from '../../source/source.service';
import { ScrapingHistoryService } from '../../scraping-history/scraping-history.service';
import { cleanupBrowserManager } from './browser-manager';
const fs = require('fs');

const MAX_PARALLEL_SCRAPERS = 1;

const CronExpressionExtended = {
  TWICE_DAILY: '0 2,10 * * *'
}

@Injectable()
export class ScraperCronService {
  private readonly logger = new Logger(ScraperCronService.name);

  // @Cron(CronExpression.EVERY_HOUR)
  // @Cron('0,15,30,45 * * * *')
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    if (process.env.NODE_ENV === 'production') {
      // Optionally log
      console.log("Production Mode, skipping cron job");
      return;
    } else {
      console.log("Dev Mode, starting cron job");
    }

    const app = await NestFactory.createApplicationContext(AppModule);
    try {
      const scrapingHistoryService = app.get(ScrapingHistoryService);
      const sourceService = app.get(SourceService);

      this.logger.log('Starting cron job: checking scraper status and launching as needed.');

      // 1. Get all active scrapers
      const scrapers = await scrapingHistoryService.getAllScrapers();
      this.logger.log(`Found ${scrapers.length} scrapers in DB.`);
      const activeSources = await sourceService.findByNames(scrapers);
      this.logger.log(`Found ${activeSources.length} active sources.`);
      const activeSourceNames = new Set(activeSources.map(s => s.name.toLowerCase()));
      const filteredScrapers = scrapers.filter(scraper => activeSourceNames.has(scraper.toLowerCase()));
      this.logger.log(`Filtered to ${filteredScrapers.length} scrapers with active sources.`);

      // 2. Get all summaries (history, inProgress, etc.)
      const summaries = await Promise.all(filteredScrapers.map(async (scraper) => {
        await scrapingHistoryService.cancelOldInProgressSessions(scraper);
        const [history, inProgress] = await Promise.all([
          scrapingHistoryService.getAllHistoryForScraper(scraper),
          scrapingHistoryService.getInProgressSessions(scraper),
        ]);
        const currentScan = inProgress.length > 0 ? inProgress[0] : null;
        return {
          scraper,
          history,
          currentScan,
          updatedAt: currentScan?.updatedAt || history[0]?.updatedAt || new Date(0),
        };
      }));

      // Filter out scrapers that have been scraped in the last 24 hours
      const now = Date.now();
      const summariesFiltered = summaries.filter(s => {
        const lastScraped = new Date(s.updatedAt).getTime();
        return now - lastScraped > 24 * 60 * 60 * 1000;
      });
      this.logger.log(`Filtered to ${summariesFiltered.length} scrapers not scraped in the last 24 hours.`);

      // 3. Count running scrapers
      const running = summaries.filter(s => s.currentScan && s.currentScan.status === 'in_progress');
      const runningCount = running.length;
      this.logger.log(`Currently running scrapers: ${runningCount}.`);
      if (running.length) {
        this.logger.log('Running scrapers: ' + running.map(r => r.scraper).join(', '));
      }

      // 4. If less than MAX_PARALLEL_SCRAPERS, start more (oldest updatedAt first)
      if (runningCount < MAX_PARALLEL_SCRAPERS) {
        const toStart = MAX_PARALLEL_SCRAPERS - runningCount;
        this.logger.log(`Need to start ${toStart} more scrapers.`);
        // Find scrapers not running, sort by oldest updatedAt
        const notRunning = summariesFiltered
          .filter(s => !s.currentScan || s.currentScan.status !== 'in_progress')
          .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
          .slice(0, toStart);

        if (notRunning.length > 0) {
          const s = notRunning[0];
          this.logger.log('Scraper to start: ' + s.scraper);
          const source = activeSources.find(src => src.name.toLowerCase() === s.scraper.toLowerCase());
          if (source && source.scraper_path) {
            const absPath = require('path').resolve(__dirname, source.scraper_path);
            this.logger.log(`Starting scraper: ${s.scraper} (${absPath})`);
            
            
            // Use spawn to stream logs in real-time
            let runner, fileToRun;
            if (fs.existsSync(absPath)) {
              const ext = require('path').extname(absPath);
              runner = ext === '.ts' ? 'ts-node' : 'node';
              fileToRun = absPath;
            } else if (absPath.endsWith('.js')) {
              // Try .ts fallback
              const tsPath = absPath.replace(/\.js$/, '.ts');
              if (fs.existsSync(tsPath)) {
                runner = 'ts-node';
                fileToRun = tsPath;
              } else {
                this.logger.error(`[${s.scraper}] Neither ${absPath} nor ${tsPath} exist.`);
                return;
              }
            } else {
              this.logger.error(`[${s.scraper}] File not found: ${absPath}`);
              return;
            }
            this.logger.log(`[${s.scraper}] Running: ${runner} ${fileToRun}`);
            const child = spawn(runner, [fileToRun, '--cron'], { cwd: process.cwd() });

            child.stdout.on('data', (data) => {
              this.logger.log(`[${s.scraper}] ${data.toString()}`);
            });

            child.stderr.on('data', (data) => {
              this.logger.error(`[${s.scraper}] ${data.toString()}`);
            });

            child.on('close', (code) => {
              this.logger.log(`[${s.scraper}] Process exited with code ${code}`);
            });
          } else {
            this.logger.warn(`No valid source or scraper_path for ${s.scraper}. Skipping.`);
          }
        } else {
          this.logger.log('No scrapers to start.');
        }
      } else {
        this.logger.log('No additional scrapers need to be started.');
      }
    } finally {
      this.logger.log('Cron job finished. Cleaning up browser resources...');
      await cleanupBrowserManager();
      this.logger.log('Cron job finished. Closing app context.');
      await app.close();
    }
  }

  // @Cron('32 * * * *')
  async handleCronOld() {
    const app = await NestFactory.createApplicationContext(AppModule);
    try {
      const sourceRepo = app.get('SourceRepository'); // or use getRepositoryToken(Source) if needed
      const now = new Date();
      const currentHour = now.getHours();
      this.logger.log(`Running scraper cron for hour ${currentHour}...`);
      const sources = await sourceRepo.find({ where: { run_at_hour: currentHour, isActive: true } });
      if (!sources.length) {
        this.logger.log('No sources scheduled for this hour.');
        return;
      }
      await Promise.all(sources.map(({ name, scraper_path }) => {
        if (!scraper_path) return Promise.resolve();
        const absPath = resolve(__dirname, scraper_path);
        this.logger.log(`Running scraper for source: ${name} (${absPath})`);
        return new Promise<void>((resolvePromise) => {
          exec('node ' + absPath + ' --cron', { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
              this.logger.error(`[${name}] Error: ${error.message}`);
              resolvePromise();
              return;
            }
            if (stderr) {
              this.logger.error(`[${name}] Stderr: ${stderr}`);
            }
            this.logger.log(`[${name}] Stdout: ${stdout}`);
            resolvePromise();
          });
        });
      }));
      this.logger.log('All scheduled scrapers finished.');
    } finally {
      await app.close();
    }
  }
} 