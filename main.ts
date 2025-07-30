import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
  }));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Improved CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'https://buysearch.co', 'https://buysearch-frontend.vercel.app', 'https://buysearch-server-v2-production.up.railway.app'];
    
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🔒 CORS blocked request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, X-HTTP-Method-Override, Origin, Access-Control-Request-Headers, Access-Control-Request-Method, X-API-Key',
    exposedHeaders: 'X-Total-Count, X-Rate-Limit-Remaining, X-Rate-Limit-Reset',
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Swagger setup with enhanced security
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
    }, 'token')
    .addApiKey({
      type: 'apiKey',
      name: 'X-API-Key',
      description: 'API key for external access',
      in: 'header',
    }, 'api-key')
    .addTag('auth', 'Authentication endpoints')
    .addTag('products', 'Product management')
    .addTag('scrapers', 'Scraper management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  // Set global security requirement for Bearer token
  if (!document.security) document.security = [];
  document.security.push({ token: [] });
  
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  });

  // Trust proxy for accurate IP detection
  (app as any).set('trust proxy', 1);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🔒 Security features enabled: Rate limiting, Anti-bot protection, Input validation`);
}
bootstrap();
