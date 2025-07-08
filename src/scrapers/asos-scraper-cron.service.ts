import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { join } from 'path';

const CronexpressionExtended = {
  TWICE_DAILY: '0 2,12 * * *'
}

@Injectable()
export class AsosScraperCronService {
  private readonly logger = new Logger(AsosScraperCronService.name);

  @Cron(CronexpressionExtended.TWICE_DAILY)
  async handleCron() {
    this.logger.log('Running ASOS scraper cron job...');
    const scraperPath = join(__dirname, 'asos_scraper.js');
    exec('node ' + scraperPath, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        this.logger.error(`Stderr: ${stderr}`);
        return;
      }
      this.logger.log(`Stdout: ${stdout}`);
    });
  }
} 