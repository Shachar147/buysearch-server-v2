import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  // Create the NestJS application context (no HTTP server)
  await NestFactory.createApplicationContext(AppModule);
  // The cron jobs will run automatically via decorators
}

bootstrap(); 