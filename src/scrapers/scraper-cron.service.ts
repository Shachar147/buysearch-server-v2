import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { join } from 'path';

const CronExpressionExtended = {
  TWICE_DAILY: '0 2,12 * * *'
}

@Injectable()
export class ScraperCronService {
  private readonly logger = new Logger(ScraperCronService.name);

  @Cron(CronExpressionExtended.TWICE_DAILY)
  // @Cron(CronExpression.EVERY_MINUTE) // DEBUG
  async handleCron() {
    this.logger.log('Running ALL scraper cron jobs...');
    const scrapers = [
      { name: 'ASOS', script: join(__dirname, 'asos_scraper.js') },
      { name: 'TerminalX', script: join(__dirname, 'terminalx_scraper.js') },
      // Add more scrapers here
    ];
    await Promise.all(scrapers.map(({ name, script }) => {
      return new Promise<void>((resolve) => {
        exec('node ' + script, { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            this.logger.error(`[${name}] Error: ${error.message}`);
            resolve();
            return;
          }
          if (stderr) {
            this.logger.error(`[${name}] Stderr: ${stderr}`);
          }
          this.logger.log(`[${name}] Stdout: ${stdout}`);
          resolve();
        });
      });
    }));
    this.logger.log('All scrapers finished.');
  }
} 