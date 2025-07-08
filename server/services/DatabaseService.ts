import { Pool, PoolClient, QueryResult } from "pg";

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
}

export interface QueryOptions {
  transaction?: boolean;
  timeout?: number;
}

export class DatabaseService {
  private pool: Pool;
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      max: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeoutMs || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMs || 2000,
    });

    this.pool.on("connect", () => {
      console.log("Database connection established");
      this.isConnected = true;
    });

    this.pool.on("error", (err) => {
      console.error("Database connection error:", err);
      this.isConnected = false;
    });
  }

  async query<T = any>(
    text: string,
    params?: any[],
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();

    try {
      if (options?.transaction) {
        await client.query("BEGIN");
      }

      const result = await client.query<T>(text, params);

      if (options?.transaction) {
        await client.query("COMMIT");
      }

      return result;
    } catch (error) {
      if (options?.transaction) {
        await client.query("ROLLBACK");
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query("SELECT 1 as health_check");
      return result.rows.length > 0;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }

  async getConnectionInfo() {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
    this.isConnected = false;
  }

  // User operations
  async createUser(userData: {
    email: string;
    passwordHash: string;
    name: string;
    tier?: string;
  }) {
    const { email, passwordHash, name, tier = "individual" } = userData;

    const result = await this.query(
      `INSERT INTO users (email, password_hash, name, tier) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, tier, created_at`,
      [email, passwordHash, name, tier],
    );

    return result.rows[0];
  }

  async findUserByEmail(email: string) {
    const result = await this.query(
      "SELECT * FROM users WHERE email = $1 AND is_active = true",
      [email],
    );

    return result.rows[0] || null;
  }

  async findUserById(id: string) {
    const result = await this.query(
      "SELECT * FROM users WHERE id = $1 AND is_active = true",
      [id],
    );

    return result.rows[0] || null;
  }

  async updateUser(
    id: string,
    updates: Partial<{
      name: string;
      tier: string;
      isActive: boolean;
      lastLogin: Date;
      metadata: any;
    }>,
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const result = await this.query(
      `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  // Admin operations
  async findAdminByEmail(email: string) {
    const result = await this.query(
      "SELECT * FROM admin_users WHERE email = $1 AND is_active = true",
      [email],
    );

    return result.rows[0] || null;
  }

  async findAdminById(id: string) {
    const result = await this.query(
      "SELECT * FROM admin_users WHERE id = $1 AND is_active = true",
      [id],
    );

    return result.rows[0] || null;
  }

  async updateAdminLoginAttempts(
    id: string,
    attempts: number,
    lockUntil?: Date,
  ) {
    const result = await this.query(
      `UPDATE admin_users 
       SET login_attempts = $1, locked_until = $2, updated_at = NOW()
       WHERE id = $3 
       RETURNING *`,
      [attempts, lockUntil, id],
    );

    return result.rows[0];
  }

  async createAdminSession(sessionData: {
    adminId: string;
    tokenId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { adminId, tokenId, expiresAt, ipAddress, userAgent } = sessionData;

    const result = await this.query(
      `INSERT INTO admin_sessions (admin_id, token_id, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [adminId, tokenId, expiresAt, ipAddress, userAgent],
    );

    return result.rows[0];
  }

  async findAdminSession(tokenId: string) {
    const result = await this.query(
      `SELECT s.*, a.email, a.name, a.role, a.permissions 
       FROM admin_sessions s 
       JOIN admin_users a ON s.admin_id = a.id 
       WHERE s.token_id = $1 AND s.expires_at > NOW() AND s.is_active = true`,
      [tokenId],
    );

    return result.rows[0] || null;
  }

  async deleteAdminSession(tokenId: string) {
    await this.query(
      "UPDATE admin_sessions SET is_active = false WHERE token_id = $1",
      [tokenId],
    );
  }

  // Customer and payment operations
  async createCustomer(customerData: {
    userId?: string;
    email: string;
    name: string;
    tier?: string;
    billingAddress?: any;
    taxId?: string;
  }) {
    const {
      userId,
      email,
      name,
      tier = "individual",
      billingAddress,
      taxId,
    } = customerData;

    const result = await this.query(
      `INSERT INTO customers (user_id, email, name, tier, billing_address, tax_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, email, name, tier, billingAddress, taxId],
    );

    return result.rows[0];
  }

  async findCustomer(id: string) {
    const result = await this.query(
      "SELECT * FROM customers WHERE id = $1 AND is_active = true",
      [id],
    );

    return result.rows[0] || null;
  }

  async findCustomerByEmail(email: string) {
    const result = await this.query(
      "SELECT * FROM customers WHERE email = $1 AND is_active = true",
      [email],
    );

    return result.rows[0] || null;
  }

  async createPaymentIntent(paymentData: {
    amount: number;
    currency: string;
    method: string;
    customerId: string;
    subscriptionId?: string;
    description?: string;
    paymentDetails?: any;
    metadata?: any;
  }) {
    const {
      amount,
      currency,
      method,
      customerId,
      subscriptionId,
      description,
      paymentDetails = {},
      metadata = {},
    } = paymentData;

    const result = await this.query(
      `INSERT INTO payment_intents 
       (amount, currency, method, customer_id, subscription_id, description, payment_details, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        amount,
        currency,
        method,
        customerId,
        subscriptionId,
        description,
        paymentDetails,
        metadata,
      ],
    );

    return result.rows[0];
  }

  async updatePaymentIntent(
    id: string,
    updates: {
      status?: string;
      paymentDetails?: any;
      completedAt?: Date;
    },
  ) {
    const { status, paymentDetails, completedAt } = updates;

    const result = await this.query(
      `UPDATE payment_intents 
       SET status = COALESCE($1, status), 
           payment_details = COALESCE($2, payment_details),
           completed_at = COALESCE($3, completed_at),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      [status, paymentDetails, completedAt, id],
    );

    return result.rows[0];
  }

  async findPaymentIntent(id: string) {
    const result = await this.query(
      "SELECT * FROM payment_intents WHERE id = $1",
      [id],
    );

    return result.rows[0] || null;
  }

  // Analytics and reporting
  async getRevenueMetrics(timeRange: string = "30d") {
    const whereClause = this.getTimeRangeClause(timeRange);

    const result = await this.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_payment_amount,
        COUNT(DISTINCT customer_id) as unique_customers
      FROM payment_intents 
      WHERE status = 'completed' ${whereClause}
    `);

    return result.rows[0];
  }

  async getUserAnalytics(timeRange: string = "30d") {
    const whereClause = this.getTimeRangeClause(timeRange);

    const result = await this.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
        tier,
        COUNT(*) as tier_count
      FROM users 
      WHERE is_active = true ${whereClause}
      GROUP BY tier
    `);

    return result.rows;
  }

  async getApiUsageStats(timeRange: string = "24h") {
    const whereClause = this.getTimeRangeClause(timeRange);

    const result = await this.query(`
      SELECT 
        COUNT(*) as total_calls,
        AVG(response_time_ms) as avg_response_time,
        COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
        endpoint,
        COUNT(*) as endpoint_count
      FROM api_usage 
      WHERE true ${whereClause}
      GROUP BY endpoint
      ORDER BY endpoint_count DESC
    `);

    return result.rows;
  }

  // Audit logging
  async createAuditLog(logData: {
    userId?: string;
    adminId?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const {
      userId,
      adminId,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    } = logData;

    await this.query(
      `INSERT INTO audit_logs 
       (user_id, admin_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        adminId,
        action,
        resourceType,
        resourceId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      ],
    );
  }

  // Helper methods
  private getTimeRangeClause(timeRange: string): string {
    switch (timeRange) {
      case "1h":
        return "AND created_at > NOW() - INTERVAL '1 hour'";
      case "24h":
        return "AND created_at > NOW() - INTERVAL '24 hours'";
      case "7d":
        return "AND created_at > NOW() - INTERVAL '7 days'";
      case "30d":
        return "AND created_at > NOW() - INTERVAL '30 days'";
      case "90d":
        return "AND created_at > NOW() - INTERVAL '90 days'";
      default:
        return "AND created_at > NOW() - INTERVAL '30 days'";
    }
  }

  // Backup and maintenance
  async performMaintenance() {
    await this.query("VACUUM ANALYZE;");
    await this.query("REINDEX DATABASE vaulttap;");
  }

  async getTableSizes() {
    const result = await this.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    return result.rows;
  }
}

// Singleton instance
let databaseService: DatabaseService | null = null;

export function createDatabaseService(config: DatabaseConfig): DatabaseService {
  if (!databaseService) {
    databaseService = new DatabaseService(config);
  }
  return databaseService;
}

export function getDatabaseService(): DatabaseService {
  if (!databaseService) {
    throw new Error(
      "Database service not initialized. Call createDatabaseService first.",
    );
  }
  return databaseService;
}
