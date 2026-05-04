import dotenv from 'dotenv';
import path from 'path';

// Load environment based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface Config {
  app: {
    port: number;
    env: string;
    nodeEnv: string;
  };
  database: {
    central: {
      url: string;
      provider: string;
    };
    tenant: {
      url: string;
      provider: string;
    };
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  logging: {
    level: string;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}

const config: Config = {
  app: {
    port: parseInt(process.env.PORT || '5001'),
    env: process.env.APP_ENV || 'development',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    central: {
      url: process.env.CENTRAL_DATABASE_URL || '',
      provider: process.env.DB_PROVIDER || 'postgresql',
    },
    tenant: {
      url: process.env.TENANT_DATABASE_URL || '',
      provider: process.env.DB_PROVIDER || 'postgresql',
    },
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  redis: process.env.REDIS_HOST ? {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  } : undefined,
};

// Validate required configuration
const requiredEnvVars = [
  'CENTRAL_DATABASE_URL',
  'TENANT_DATABASE_URL',
  'JWT_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is missing`);
  }
}

export default config;
