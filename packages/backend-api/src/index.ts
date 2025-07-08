import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { buildSchema } from "type-graphql";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

// Resolvers
import { UserResolver } from "./resolvers/UserResolver";
import { VaultResolver } from "./resolvers/VaultResolver";
import { TransactionResolver } from "./resolvers/TransactionResolver";
import { BluetoothResolver } from "./resolvers/BluetoothResolver";
import { AIAgentResolver } from "./resolvers/AIAgentResolver";

// Services
import { AuthService } from "./services/AuthService";
import { BluetoothService } from "./services/BluetoothService";
import { VaultService } from "./services/VaultService";
import { TransactionService } from "./services/TransactionService";
import { AIService } from "./services/AIService";

// Utils
import { logger } from "./utils/logger";
import { createContext } from "./utils/context";

// REST routes
import walletRoutes from "./routes/wallet";
import bluetoothRoutes from "./routes/bluetooth";
import transactionRoutes from "./routes/transactions";
import vaultRoutes from "./routes/vaults";
import settingsRoutes from "./routes/settings";

interface Context {
  prisma: PrismaClient;
  redis: any;
  services: {
    auth: AuthService;
    bluetooth: BluetoothService;
    vault: VaultService;
    transaction: TransactionService;
    ai: AIService;
  };
  user?: any;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize database
  const prisma = new PrismaClient();

  // Initialize Redis
  const redis = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  await redis.connect();

  // Initialize services
  const services = {
    auth: new AuthService(prisma),
    bluetooth: new BluetoothService(prisma, redis),
    vault: new VaultService(prisma),
    transaction: new TransactionService(prisma, redis),
    ai: new AIService(prisma),
  };

  // Build GraphQL schema
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      VaultResolver,
      TransactionResolver,
      BluetoothResolver,
      AIAgentResolver,
    ],
    validate: false,
  });

  // Create Apollo Server
  const apolloServer = new ApolloServer<Context>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // GraphQL endpoint
  app.use(
    "/graphql",
    expressMiddleware(apolloServer, {
      context: createContext({ prisma, redis, services }),
    }),
  );

  // REST API routes
  app.use("/api/wallet", walletRoutes);
  app.use("/api/bluetooth", bluetoothRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/vaults", vaultRoutes);
  app.use("/api/settings", settingsRoutes);

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: "connected",
        redis: redis.isReady ? "connected" : "disconnected",
      },
    });
  });

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) => {
    httpServer.listen(PORT, resolve);
  });

  logger.info(
    `🚀 VaultTap API Server ready at http://localhost:${PORT}/graphql`,
  );
  logger.info(`📱 REST API available at http://localhost:${PORT}/api`);
  logger.info(`🏥 Health check at http://localhost:${PORT}/health`);

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, shutting down gracefully");
    await apolloServer.stop();
    await prisma.$disconnect();
    await redis.disconnect();
    httpServer.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
