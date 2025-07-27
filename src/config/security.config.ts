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
  };
  admin: {
    username: string;
  };
}

export function getSecurityConfig(): SecurityConfig {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'changeme') {
    // Only throw error if we're not in a scraper context
    if (process.env.NODE_ENV === 'production' || process.argv.includes('main.ts')) {
      throw new Error('JWT_SECRET environment variable must be set to a secure value');
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
    },
    admin: {
      username: adminUsername,
    },
  };
} 