export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  slowDown: {
    windowMs: number;
    delayAfter: number;
    delayMs: number;
  };
  antiBot: {
    enabled: boolean;
    userAgentPatterns: string[];
    suspiciousPatterns: string[];
  };
  admin: {
    username: string;
  };
  api: {
    maxRequestSize: string;
    timeout: number;
  };
}

export function getSecurityConfig(): SecurityConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'changeme') {
    // Only throw error if we're not in a scraper context
    if (
      process.env.NODE_ENV === 'production' ||
      process.argv.includes('main.ts')
    ) {
      throw new Error(
        'JWT_SECRET environment variable must be set to a secure value',
      );
    }
    // For scrapers, use a default value
    console.warn('Warning: Using default JWT_SECRET for scraper context');
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'Shachar';

  return {
    jwt: {
      secret: jwtSecret || 'default-secret-for-scrapers',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'https://buysearch.co'],
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    slowDown: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // allow 50 requests per 15 minutes, then...
      delayMs: 500, // begin adding 500ms of delay per request above 50
    },
    antiBot: {
      enabled: process.env.ANTI_BOT_ENABLED !== 'false',
      userAgentPatterns: [
        'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java',
        'headless', 'phantom', 'selenium', 'puppeteer', 'playwright'
      ],
      suspiciousPatterns: [
        'no-user-agent', 'empty-user-agent', 'default-user-agent'
      ],
    },
    admin: {
      username: adminUsername,
    },
    api: {
      maxRequestSize: '10mb',
      timeout: 30000, // 30 seconds
    },
  };
}
