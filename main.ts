import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Allow all origins
    // origin: ['http://192.168.1.248:3000', 'http://localhost:3000', 'https://buysearch-frontend.onrender.com', 'https://buysearch-frontend.vercel.app'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, X-HTTP-Method-Override, Origin, Access-Control-Request-Headers, Access-Control-Request-Method',
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('BuySearch API')
    .setDescription('API documentation for BuySearch v2')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token as: Bearer <token>',
      in: 'header',
    }, 'accessToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Set global security requirement for Bearer token
  if (!document.security) document.security = [];
  document.security.push({ accessToken: [] });
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
