import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface EnvironmentConfig {
  // Server configuration
  port: number;
  nodeEnv: string;
  apiVersion: string;

  // Database configuration
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
    idleTimeoutMs: number;
    connectionTimeoutMs: number;
  };

  // Redis configuration
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
    db: number;
    maxRetries: number;
    retryDelayOnFailover: number;
  };

  // JWT configuration
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };

  // Encryption configuration
  encryption: {
    key: string;
    algorithm: string;
    keyDerivationRounds: number;
  };

  // AWS configuration
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3BucketName: string;
    cloudWatchLogGroup: string;
    sesFromAddress: string;
  };

  // Payment providers
  payments: {
    stripe: {
      secretKey: string;
      publishableKey: string;
      webhookSecret: string;
      apiVersion: string;
    };
    paypal: {
      clientId: string;
      clientSecret: string;
      mode: "sandbox" | "live";
    };
  };

  // External APIs
  externalApis: {
    openai: {
      apiKey: string;
      model: string;
      maxTokens: number;
    };
    awsBedrock: {
      region: string;
      modelId: string;
    };
  };

  // Security configuration
  security: {
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
      adminWindowMs: number;
      adminMaxRequests: number;
    };
    cors: {
      origins: string[];
      credentials: boolean;
    };
    helmet: {
      contentSecurityPolicy: boolean;
      crossOriginEmbedderPolicy: boolean;
    };
  };

  // Monitoring and logging
  monitoring: {
    enableMetrics: boolean;
    enableHealthChecks: boolean;
    logLevel: "debug" | "info" | "warn" | "error";
    sentryDsn?: string;
    datadogApiKey?: string;
  };

  // Feature flags
  features: {
    meshNetworking: boolean;
    aiVerification: boolean;
    cryptoPayments: boolean;
    enterpriseFeatures: boolean;
    betaFeatures: boolean;
  };

  // Application URLs
  urls: {
    frontend: string;
    api: string;
    webhookBase: string;
    adminPanel: string;
  };
}

function parseBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseStringArray(
  value: string | undefined,
  defaultValue: string[],
): string[] {
  if (value === undefined) return defaultValue;
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function validateRequired(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

function createEnvironmentConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isDevelopment = nodeEnv === "development";
  const isProduction = nodeEnv === "production";

  // Database URL parsing
  const databaseUrl = process.env.DATABASE_URL;
  let dbConfig: EnvironmentConfig["database"];

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    dbConfig = {
      url: databaseUrl,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      name: url.pathname.slice(1),
      username: url.username,
      password: url.password,
      ssl: isProduction,
      maxConnections: parseNumber(process.env.DB_MAX_CONNECTIONS, 20),
      idleTimeoutMs: parseNumber(process.env.DB_IDLE_TIMEOUT_MS, 30000),
      connectionTimeoutMs: parseNumber(
        process.env.DB_CONNECTION_TIMEOUT_MS,
        2000,
      ),
    };
  } else {
    dbConfig = {
      url: "",
      host: process.env.DB_HOST || "localhost",
      port: parseNumber(process.env.DB_PORT, 5432),
      name: process.env.DB_NAME || "vaulttap",
      username: process.env.DB_USERNAME || "vaulttap",
      password: process.env.DB_PASSWORD || "vaulttap_secure_2024",
      ssl: parseBoolean(process.env.DB_SSL, isProduction),
      maxConnections: parseNumber(process.env.DB_MAX_CONNECTIONS, 20),
      idleTimeoutMs: parseNumber(process.env.DB_IDLE_TIMEOUT_MS, 30000),
      connectionTimeoutMs: parseNumber(
        process.env.DB_CONNECTION_TIMEOUT_MS,
        2000,
      ),
    };
  }

  // Redis URL parsing
  const redisUrl = process.env.REDIS_URL;
  let redisConfig: EnvironmentConfig["redis"];

  if (redisUrl) {
    const url = new URL(redisUrl);
    redisConfig = {
      url: redisUrl,
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      db: parseNumber(process.env.REDIS_DB, 0),
      maxRetries: parseNumber(process.env.REDIS_MAX_RETRIES, 3),
      retryDelayOnFailover: parseNumber(process.env.REDIS_RETRY_DELAY, 100),
    };
  } else {
    redisConfig = {
      url: "",
      host: process.env.REDIS_HOST || "localhost",
      port: parseNumber(process.env.REDIS_PORT, 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseNumber(process.env.REDIS_DB, 0),
      maxRetries: parseNumber(process.env.REDIS_MAX_RETRIES, 3),
      retryDelayOnFailover: parseNumber(process.env.REDIS_RETRY_DELAY, 100),
    };
  }

  return {
    port: parseNumber(process.env.PORT, 3000),
    nodeEnv,
    apiVersion: process.env.API_VERSION || "v1",

    database: dbConfig,
    redis: redisConfig,

    jwt: {
      secret: validateRequired(process.env.JWT_SECRET, "JWT_SECRET"),
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      issuer: process.env.JWT_ISSUER || "vaulttap.com",
      audience: process.env.JWT_AUDIENCE || "vaulttap-api",
    },

    encryption: {
      key: validateRequired(process.env.ENCRYPTION_KEY, "ENCRYPTION_KEY"),
      algorithm: process.env.ENCRYPTION_ALGORITHM || "aes-256-gcm",
      keyDerivationRounds: parseNumber(
        process.env.KEY_DERIVATION_ROUNDS,
        100000,
      ),
    },

    aws: {
      region: process.env.AWS_REGION || "us-west-2",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      s3BucketName: process.env.AWS_S3_BUCKET_NAME || "vaulttap-storage",
      cloudWatchLogGroup:
        process.env.AWS_CLOUDWATCH_LOG_GROUP || "/aws/ecs/vaulttap",
      sesFromAddress:
        process.env.AWS_SES_FROM_ADDRESS || "noreply@vaulttap.com",
    },

    payments: {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || "",
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
        apiVersion: process.env.STRIPE_API_VERSION || "2023-10-16",
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID || "",
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
        mode:
          (process.env.PAYPAL_MODE as "sandbox" | "live") ||
          (isProduction ? "live" : "sandbox"),
      },
    },

    externalApis: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || "",
        model: process.env.OPENAI_MODEL || "gpt-4",
        maxTokens: parseNumber(process.env.OPENAI_MAX_TOKENS, 2000),
      },
      awsBedrock: {
        region: process.env.AWS_BEDROCK_REGION || "us-west-2",
        modelId: process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-v2",
      },
    },

    security: {
      rateLimiting: {
        windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
        maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
        adminWindowMs: parseNumber(
          process.env.ADMIN_RATE_LIMIT_WINDOW_MS,
          15 * 60 * 1000,
        ),
        adminMaxRequests: parseNumber(
          process.env.ADMIN_RATE_LIMIT_MAX_REQUESTS,
          50,
        ),
      },
      cors: {
        origins: parseStringArray(
          process.env.CORS_ORIGINS,
          isDevelopment
            ? ["http://localhost:3000", "http://localhost:5173"]
            : [],
        ),
        credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
      },
      helmet: {
        contentSecurityPolicy: parseBoolean(
          process.env.HELMET_CSP,
          isProduction,
        ),
        crossOriginEmbedderPolicy: parseBoolean(process.env.HELMET_COEP, false),
      },
    },

    monitoring: {
      enableMetrics: parseBoolean(process.env.ENABLE_METRICS, true),
      enableHealthChecks: parseBoolean(process.env.ENABLE_HEALTH_CHECKS, true),
      logLevel:
        (process.env.LOG_LEVEL as any) || (isDevelopment ? "debug" : "info"),
      sentryDsn: process.env.SENTRY_DSN,
      datadogApiKey: process.env.DATADOG_API_KEY,
    },

    features: {
      meshNetworking: parseBoolean(process.env.FEATURE_MESH_NETWORKING, true),
      aiVerification: parseBoolean(process.env.FEATURE_AI_VERIFICATION, true),
      cryptoPayments: parseBoolean(process.env.FEATURE_CRYPTO_PAYMENTS, true),
      enterpriseFeatures: parseBoolean(process.env.FEATURE_ENTERPRISE, true),
      betaFeatures: parseBoolean(process.env.FEATURE_BETA, isDevelopment),
    },

    urls: {
      frontend:
        process.env.FRONTEND_URL ||
        (isDevelopment ? "http://localhost:5173" : "https://app.vaulttap.com"),
      api:
        process.env.API_URL ||
        (isDevelopment ? "http://localhost:3000" : "https://api.vaulttap.com"),
      webhookBase:
        process.env.WEBHOOK_BASE_URL ||
        (isDevelopment ? "http://localhost:3000" : "https://api.vaulttap.com"),
      adminPanel:
        process.env.ADMIN_PANEL_URL ||
        (isDevelopment
          ? "http://localhost:3000/admin"
          : "https://admin.vaulttap.com"),
    },
  };
}

// Create and validate configuration
export const config = createEnvironmentConfig();

// Validation for production environment
if (config.nodeEnv === "production") {
  const requiredSecrets = [
    "JWT_SECRET",
    "ENCRYPTION_KEY",
    "DATABASE_URL",
    "REDIS_URL",
  ];

  for (const secret of requiredSecrets) {
    if (!process.env[secret]) {
      throw new Error(`Production environment requires ${secret} to be set`);
    }
  }

  // Validate JWT secret strength
  if (config.jwt.secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be at least 32 characters long in production",
    );
  }

  // Validate encryption key
  if (config.encryption.key.length < 32) {
    throw new Error(
      "ENCRYPTION_KEY must be at least 32 characters long in production",
    );
  }
}

// Export utility functions
export function isDevelopment(): boolean {
  return config.nodeEnv === "development";
}

export function isProduction(): boolean {
  return config.nodeEnv === "production";
}

export function isTest(): boolean {
  return config.nodeEnv === "test";
}

// Configuration validation
export function validateConfig(): void {
  console.log("🔧 Validating configuration...");

  // Database validation
  if (
    !config.database.url &&
    (!config.database.host || !config.database.name)
  ) {
    throw new Error("Database configuration is incomplete");
  }

  // Redis validation
  if (!config.redis.url && !config.redis.host) {
    throw new Error("Redis configuration is incomplete");
  }

  // Security validation
  if (isProduction()) {
    if (config.security.cors.origins.length === 0) {
      console.warn("⚠️  CORS origins not configured for production");
    }

    if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
      console.warn("⚠️  AWS credentials not configured");
    }

    if (!config.payments.stripe.secretKey) {
      console.warn("⚠️  Stripe secret key not configured");
    }
  }

  console.log("✅ Configuration validation complete");
}

// Export configuration sections for easier imports
export const {
  database: databaseConfig,
  redis: redisConfig,
  jwt: jwtConfig,
  encryption: encryptionConfig,
  aws: awsConfig,
  payments: paymentsConfig,
  security: securityConfig,
  monitoring: monitoringConfig,
  features: featuresConfig,
  urls: urlsConfig,
} = config;

export default config;
