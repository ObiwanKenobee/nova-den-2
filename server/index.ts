import express from "express";
import cors from "cors";

// Import route handlers
import { handleDemo } from "./routes/demo";
import {
  getBalance,
  getDashboard,
  getTransactionHistory,
} from "./routes/wallet";
import {
  getBluetoothStatus,
  discoverPeers,
  connectToPeer,
  disconnectFromPeer,
  enableBluetooth,
  disableBluetooth,
  startMeshRelay,
  stopMeshRelay,
} from "./routes/bluetooth";
import {
  sendPayment,
  getTransactionHistory as getTransactions,
  getTransaction,
  cancelTransaction,
  retryTransaction,
} from "./routes/transactions";
import {
  getVaults,
  getVault,
  createVault,
  vaultOperation,
  lockVault,
  unlockVault,
  deleteVault,
} from "./routes/vaults";
import {
  getSettings,
  updateSettings,
  getRituals,
  createCustomRitual,
  deleteRitual,
  exportData,
  importData,
  clearData,
  emergencyWipe,
} from "./routes/settings";
import {
  recordUsageEvent,
  getPricingTiers,
  getPricingTier,
  getRevenueMetrics,
  getAnalytics,
  getRevOpsData,
  initializeRevenueService,
} from "./routes/billing";

// Admin authentication routes
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  verifyAdminToken,
  refreshAdminToken,
} from "./routes/auth";

// Payment processing routes
import {
  createPaymentIntent,
  getPaymentIntent,
  createSubscription,
  getSubscription,
  cancelSubscription,
  createCustomer,
  getCustomer,
  getPricingTiers as getPaymentPricingTiers,
  getSupportedPaymentMethods,
} from "./routes/payments";

// Admin authentication middleware
import {
  requireAdminAuth,
  requirePermission,
  securityHeaders,
  adminRateLimit,
  auditLog,
} from "./middleware/adminAuth";

// Services
import { RevenueService } from "./services/RevenueService";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize services
  const revenueService = new RevenueService();

  // Initialize billing routes with revenue service
  initializeRevenueService(revenueService);

  // Basic health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "VaultTap API v1.0.0 - Banking on Bluetooth!" });
  });

  app.get("/api/demo", handleDemo);

  // Wallet management
  app.get("/api/wallet/balance", getBalance);
  app.get("/api/wallet/dashboard", getDashboard);
  app.get("/api/wallet/transactions", getTransactionHistory);

  // Bluetooth mesh networking
  app.get("/api/bluetooth/status", getBluetoothStatus);
  app.post("/api/bluetooth/discover", discoverPeers);
  app.post("/api/bluetooth/connect/:peerId", connectToPeer);
  app.delete("/api/bluetooth/connect/:peerId", disconnectFromPeer);
  app.post("/api/bluetooth/enable", enableBluetooth);
  app.post("/api/bluetooth/disable", disableBluetooth);
  app.post("/api/bluetooth/relay/start", startMeshRelay);
  app.post("/api/bluetooth/relay/stop", stopMeshRelay);

  // Transaction management
  app.post("/api/transactions/send", sendPayment);
  app.get("/api/transactions", getTransactions);
  app.get("/api/transactions/:transactionId", getTransaction);
  app.post("/api/transactions/:transactionId/cancel", cancelTransaction);
  app.post("/api/transactions/:transactionId/retry", retryTransaction);

  // Vault management
  app.get("/api/vaults", getVaults);
  app.get("/api/vaults/:vaultId", getVault);
  app.post("/api/vaults", createVault);
  app.post("/api/vaults/operation", vaultOperation);
  app.post("/api/vaults/:vaultId/lock", lockVault);
  app.post("/api/vaults/:vaultId/unlock", unlockVault);
  app.delete("/api/vaults/:vaultId", deleteVault);

  // Settings and security
  app.get("/api/settings", getSettings);
  app.put("/api/settings", updateSettings);
  app.get("/api/settings/rituals", getRituals);
  app.post("/api/settings/rituals", createCustomRitual);
  app.delete("/api/settings/rituals/:ritualId", deleteRitual);
  app.get("/api/settings/export", exportData);
  app.post("/api/settings/import", importData);
  app.post("/api/settings/clear", clearData);
  app.post("/api/settings/emergency-wipe", emergencyWipe);

  // Billing and revenue management
  app.post("/api/billing/usage", recordUsageEvent);
  app.get("/api/billing/tiers", getPricingTiers);
  app.get("/api/billing/tiers/:tierId", getPricingTier);
  app.get("/api/billing/metrics", getRevenueMetrics);
  app.get("/api/billing/analytics", getAnalytics);

  // Admin authentication routes
  app.post("/api/admin/login", adminRateLimit(5, 15 * 60 * 1000), adminLogin);
  app.post("/api/admin/logout", adminLogout);
  app.get("/api/admin/profile", requireAdminAuth, getAdminProfile);
  app.get("/api/admin/verify", verifyAdminToken);
  app.post("/api/admin/refresh", refreshAdminToken);

  // Protected RevOps dashboard - requires admin auth
  app.get(
    "/api/revops/dashboard",
    requireAdminAuth,
    requirePermission("revops:view"),
    auditLog("revops_dashboard_access"),
    getRevOpsData,
  );

  // Payment processing routes (order matters - specific routes first)
  app.get("/api/payments/methods", getSupportedPaymentMethods);
  app.get("/api/payments/pricing", getPaymentPricingTiers);
  app.post("/api/payments/create", createPaymentIntent);
  app.get("/api/payments/:paymentIntentId", getPaymentIntent);

  // Subscription management
  app.post("/api/subscriptions", createSubscription);
  app.get("/api/subscriptions/:subscriptionId", getSubscription);
  app.post("/api/subscriptions/:subscriptionId/cancel", cancelSubscription);

  // Customer management
  app.post("/api/customers", createCustomer);
  app.get("/api/customers/:customerId", getCustomer);

  // Apply security headers to admin routes
  app.use("/api/admin/*", securityHeaders);
  app.use("/api/revops/*", securityHeaders);

  return app;
}
