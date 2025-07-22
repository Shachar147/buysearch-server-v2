import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { NestFactory } from '@nestjs/core';
import { resolve } from 'path';
import { AppModule } from '../../../app.module';

const CronExpressionExtended = {
  TWICE_DAILY: '0 2,10 * * *'
}

@Injectable()
export class ScraperCronService {
  private readonly logger = new Logger(ScraperCronService.name);

  // @Cron('32 * * * *')
  async handleCron() {
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