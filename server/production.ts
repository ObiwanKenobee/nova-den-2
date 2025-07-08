import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "./index";
import {
  config,
  validateConfig,
  isProduction,
  isDevelopment,
} from "./config/environment";
import { createDatabaseService } from "./services/DatabaseService";
import { createMonitoringService } from "./services/MonitoringService";

// Global error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
let server: any;
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed");
    });
  }

  // Give ongoing requests time to complete
  setTimeout(() => {
    console.log("⏰ Forcing shutdown after timeout");
    process.exit(0);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

async function startProductionServer() {
  try {
    console.log("🚀 Starting VaultTap Production Server...");

    // Validate configuration
    validateConfig();

    // Initialize monitoring service
    const monitoring = createMonitoringService();
    console.log("📊 Monitoring service initialized");

    // Initialize database service
    const dbService = createDatabaseService(config.database);
    console.log("🗄️  Database service initialized");

    // Test database connection
    const dbHealthy = await dbService.healthCheck();
    if (!dbHealthy) {
      throw new Error("Database health check failed");
    }
    console.log("✅ Database connection verified");

    // Create Express app
    const app = createServer();

    // Production security middleware
    if (isProduction()) {
      // Helmet for security headers
      app.use(
        helmet({
          contentSecurityPolicy: config.security.helmet.contentSecurityPolicy
            ? {
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
              }
            : false,
          crossOriginEmbedderPolicy:
            config.security.helmet.crossOriginEmbedderPolicy,
        }),
      );

      // Rate limiting
      const limiter = rateLimit({
        windowMs: config.security.rateLimiting.windowMs,
        max: config.security.rateLimiting.maxRequests,
        message: {
          error: "Too many requests from this IP",
          retryAfter: Math.ceil(config.security.rateLimiting.windowMs / 1000),
        },
        standardHeaders: true,
        legacyHeaders: false,
      });

      app.use(limiter);

      // Compression
      app.use(compression());
    }

    // Request tracking middleware
    app.use((req, res, next) => {
      const tracker = monitoring.trackRequest(req);

      res.on("finish", () => {
        tracker.end(res.statusCode);
      });

      next();
    });

    // Health check endpoints
    app.get("/health", async (req, res) => {
      try {
        const healthChecks = await Promise.allSettled([
          monitoring.performHealthCheck("database", async () => {
            const healthy = await dbService.healthCheck();
            return { healthy, responseTime: 0 };
          }),
          monitoring.performHealthCheck("application", async () => {
            return { healthy: true, responseTime: 0 };
          }),
        ]);

        const systemHealth = monitoring.getSystemHealth();

        res.status(systemHealth.overall === "healthy" ? 200 : 503).json({
          status: systemHealth.overall,
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || "unknown",
          uptime: process.uptime(),
          services: systemHealth.services,
        });
      } catch (error) {
        monitoring.error("Health check failed", error as Error);
        res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Health check failed",
        });
      }
    });

    // Liveness probe (simpler check for K8s)
    app.get("/health/live", (req, res) => {
      res.status(200).json({
        status: "alive",
        timestamp: new Date().toISOString(),
      });
    });

    // Readiness probe
    app.get("/health/ready", async (req, res) => {
      try {
        const dbHealthy = await dbService.healthCheck();
        if (dbHealthy) {
          res.status(200).json({
            status: "ready",
            timestamp: new Date().toISOString(),
          });
        } else {
          res.status(503).json({
            status: "not ready",
            timestamp: new Date().toISOString(),
            reason: "Database not available",
          });
        }
      } catch (error) {
        res.status(503).json({
          status: "not ready",
          timestamp: new Date().toISOString(),
          reason: "Health check failed",
        });
      }
    });

    // Metrics endpoint (Prometheus format)
    app.get("/metrics", (req, res) => {
      try {
        const metrics = monitoring.exportPrometheusMetrics();
        res.set("Content-Type", "text/plain; version=0.0.4");
        res.send(metrics);
      } catch (error) {
        monitoring.error("Metrics export failed", error as Error);
        res.status(500).send("Metrics unavailable");
      }
    });

    // Start the server
    server = app.listen(config.port, () => {
      console.log(`✅ VaultTap server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: ${config.urls.api}`);

      if (isDevelopment()) {
        console.log(`📱 Frontend URL: ${config.urls.frontend}`);
        console.log(`👥 Admin Panel: ${config.urls.adminPanel}`);
      }

      // Log configuration summary
      console.log("\n📋 Configuration Summary:");
      console.log(
        `   Database: ${config.database.host}:${config.database.port}`,
      );
      console.log(`   Redis: ${config.redis.host}:${config.redis.port}`);
      console.log(`   AWS Region: ${config.aws.region}`);
      console.log(
        `   Features: ${Object.entries(config.features)
          .filter(([, enabled]) => enabled)
          .map(([name]) => name)
          .join(", ")}`,
      );

      // Record startup metrics
      monitoring.recordMetric({
        name: "application_startup",
        value: 1,
        labels: {
          version: process.env.npm_package_version || "unknown",
          environment: config.nodeEnv,
        },
      });

      monitoring.info("VaultTap server started successfully", {
        port: config.port,
        environment: config.nodeEnv,
        version: process.env.npm_package_version,
        nodeVersion: process.version,
        pid: process.pid,
      });
    });

    // Error handling for server
    server.on("error", (error: any) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind =
        typeof config.port === "string"
          ? `Pipe ${config.port}`
          : `Port ${config.port}`;

      switch (error.code) {
        case "EACCES":
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Setup periodic maintenance tasks
    if (isProduction()) {
      // Database maintenance every 6 hours
      setInterval(
        async () => {
          try {
            await dbService.performMaintenance();
            monitoring.info("Database maintenance completed");
          } catch (error) {
            monitoring.error("Database maintenance failed", error as Error);
          }
        },
        6 * 60 * 60 * 1000,
      );

      // Monitoring data cleanup every 24 hours
      setInterval(
        () => {
          try {
            monitoring.cleanup();
            monitoring.info("Monitoring data cleanup completed");
          } catch (error) {
            monitoring.error("Monitoring cleanup failed", error as Error);
          }
        },
        24 * 60 * 60 * 1000,
      );

      // Memory usage monitoring
      setInterval(() => {
        const memUsage = process.memoryUsage();
        monitoring.recordMetric({
          name: "memory_usage_bytes",
          value: memUsage.heapUsed,
          labels: { type: "heap_used" },
        });

        monitoring.recordMetric({
          name: "memory_usage_bytes",
          value: memUsage.heapTotal,
          labels: { type: "heap_total" },
        });

        monitoring.recordMetric({
          name: "memory_usage_bytes",
          value: memUsage.rss,
          labels: { type: "rss" },
        });

        // Alert if memory usage is too high
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        if (heapUsedMB > 800) {
          // 800MB threshold
          monitoring.warn(`High memory usage: ${heapUsedMB.toFixed(2)}MB`, {
            heapUsed: heapUsedMB,
            heapTotal: memUsage.heapTotal / 1024 / 1024,
            rss: memUsage.rss / 1024 / 1024,
          });
        }
      }, 60000); // Every minute
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startProductionServer();
}

export { startProductionServer };
