import { EventEmitter } from "events";

export interface MetricPoint {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface LogEntry {
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  adminId?: string;
  requestId?: string;
  service?: string;
}

export interface HealthCheckResult {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  notificationChannels: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

export class MonitoringService extends EventEmitter {
  private metrics: Map<string, MetricPoint[]> = new Map();
  private logs: LogEntry[] = [];
  private healthChecks: Map<string, HealthCheckResult> = new Map();
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private maxLogEntries = 10000;
  private maxMetricPoints = 1000;

  constructor() {
    super();
    this.initializeDefaultAlertRules();
    this.startPeriodicHealthChecks();
  }

  // Metrics collection
  recordMetric(metric: Omit<MetricPoint, "timestamp">) {
    const point: MetricPoint = {
      ...metric,
      timestamp: new Date(),
    };

    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const points = this.metrics.get(metric.name)!;
    points.push(point);

    // Keep only recent points
    if (points.length > this.maxMetricPoints) {
      points.splice(0, points.length - this.maxMetricPoints);
    }

    this.emit("metric", point);
    this.checkAlertRules(point);
  }

  getMetrics(name: string, since?: Date): MetricPoint[] {
    const points = this.metrics.get(name) || [];
    if (!since) return [...points];

    return points.filter((point) => point.timestamp >= since);
  }

  getAllMetrics(): Record<string, MetricPoint[]> {
    const result: Record<string, MetricPoint[]> = {};
    for (const [name, points] of this.metrics.entries()) {
      result[name] = [...points];
    }
    return result;
  }

  // Logging
  log(entry: Omit<LogEntry, "timestamp">) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogEntries) {
      this.logs.splice(0, this.logs.length - this.maxLogEntries);
    }

    // Emit to external systems
    this.emit("log", logEntry);

    // Console output for development
    const level = logEntry.level.toUpperCase();
    const timestamp = logEntry.timestamp.toISOString();
    const context = logEntry.context
      ? ` | ${JSON.stringify(logEntry.context)}`
      : "";

    console.log(`[${timestamp}] ${level}: ${logEntry.message}${context}`);

    if (logEntry.error) {
      console.error(logEntry.error);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log({ level: "debug", message, context });
  }

  info(message: string, context?: Record<string, any>) {
    this.log({ level: "info", message, context });
  }

  warn(message: string, context?: Record<string, any>) {
    this.log({ level: "warn", message, context });
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log({ level: "error", message, error, context });
  }

  fatal(message: string, error?: Error, context?: Record<string, any>) {
    this.log({ level: "fatal", message, error, context });
  }

  getLogs(
    level?: LogEntry["level"],
    since?: Date,
    limit: number = 100,
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    if (since) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= since);
    }

    return filteredLogs.slice(-limit);
  }

  // Health checks
  async performHealthCheck(
    service: string,
    checkFunction: () => Promise<{
      healthy: boolean;
      responseTime: number;
      details?: Record<string, any>;
    }>,
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const result = await checkFunction();
      const responseTime = Date.now() - startTime;

      const healthCheck: HealthCheckResult = {
        service,
        status: result.healthy ? "healthy" : "unhealthy",
        responseTime: result.responseTime || responseTime,
        details: result.details,
        timestamp: new Date(),
      };

      this.healthChecks.set(service, healthCheck);
      this.emit("healthCheck", healthCheck);

      // Record metrics
      this.recordMetric({
        name: `health_check_${service}`,
        value: result.healthy ? 1 : 0,
        labels: { service },
      });

      this.recordMetric({
        name: `health_check_response_time`,
        value: responseTime,
        labels: { service },
      });

      return healthCheck;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const healthCheck: HealthCheckResult = {
        service,
        status: "unhealthy",
        responseTime,
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date(),
      };

      this.healthChecks.set(service, healthCheck);
      this.emit("healthCheck", healthCheck);

      this.error(`Health check failed for ${service}`, error as Error);

      return healthCheck;
    }
  }

  getHealthCheck(service: string): HealthCheckResult | undefined {
    return this.healthChecks.get(service);
  }

  getAllHealthChecks(): Record<string, HealthCheckResult> {
    const result: Record<string, HealthCheckResult> = {};
    for (const [service, check] of this.healthChecks.entries()) {
      result[service] = check;
    }
    return result;
  }

  getSystemHealth(): {
    overall: "healthy" | "degraded" | "unhealthy";
    services: Record<string, HealthCheckResult>;
  } {
    const services = this.getAllHealthChecks();
    const statuses = Object.values(services).map((check) => check.status);

    let overall: "healthy" | "degraded" | "unhealthy" = "healthy";

    if (statuses.some((status) => status === "unhealthy")) {
      overall = "unhealthy";
    } else if (statuses.some((status) => status === "degraded")) {
      overall = "degraded";
    }

    return { overall, services };
  }

  // Alert management
  createAlertRule(rule: Omit<AlertRule, "id">) {
    const alertRule: AlertRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...rule,
    };

    this.alertRules.push(alertRule);
    return alertRule;
  }

  updateAlertRule(id: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.alertRules.findIndex((rule) => rule.id === id);
    if (ruleIndex === -1) {
      throw new Error(`Alert rule ${id} not found`);
    }

    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    return this.alertRules[ruleIndex];
  }

  deleteAlertRule(id: string) {
    const ruleIndex = this.alertRules.findIndex((rule) => rule.id === id);
    if (ruleIndex === -1) {
      throw new Error(`Alert rule ${id} not found`);
    }

    this.alertRules.splice(ruleIndex, 1);
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  private checkAlertRules(metric: MetricPoint) {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Simple threshold checking (would be more sophisticated in production)
      if (this.evaluateCondition(rule, metric)) {
        this.triggerAlert(rule, metric);
      }
    }
  }

  private evaluateCondition(rule: AlertRule, metric: MetricPoint): boolean {
    // Simple condition evaluation
    // In production, you'd want a more sophisticated rule engine
    if (rule.condition.includes(metric.name)) {
      if (rule.condition.includes(">")) {
        return metric.value > rule.threshold;
      } else if (rule.condition.includes("<")) {
        return metric.value < rule.threshold;
      }
    }
    return false;
  }

  private triggerAlert(rule: AlertRule, metric: MetricPoint) {
    // Check if alert already exists for this rule
    const existingAlert = this.alerts.find(
      (alert) => alert.ruleId === rule.id && !alert.resolved,
    );

    if (existingAlert) {
      return; // Don't spam alerts
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      severity: rule.severity,
      message: `Alert triggered: ${rule.name}. Metric ${metric.name} = ${metric.value}`,
      timestamp: new Date(),
      resolved: false,
      metadata: {
        metric: metric.name,
        value: metric.value,
        threshold: rule.threshold,
        condition: rule.condition,
      },
    };

    this.alerts.push(alert);
    this.emit("alert", alert);

    this.warn(`Alert triggered: ${alert.message}`, {
      alertId: alert.id,
      ruleId: rule.id,
      severity: rule.severity,
    });
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.resolved = true;
    alert.resolvedAt = new Date();

    this.emit("alertResolved", alert);
    this.info(`Alert resolved: ${alert.message}`, { alertId });
  }

  getAlerts(resolved: boolean = false): Alert[] {
    return this.alerts.filter((alert) => alert.resolved === resolved);
  }

  // Performance monitoring
  startTimer(name: string, labels?: Record<string, string>) {
    const start = Date.now();
    return {
      end: () => {
        const duration = Date.now() - start;
        this.recordMetric({
          name: `timer_${name}`,
          value: duration,
          labels,
        });
        return duration;
      },
    };
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>,
  ): Promise<T> {
    const timer = this.startTimer(name, labels);
    try {
      const result = await fn();
      timer.end();
      return result;
    } catch (error) {
      timer.end();
      this.recordMetric({
        name: `${name}_error`,
        value: 1,
        labels,
      });
      throw error;
    }
  }

  // Request tracking
  trackRequest(req: any) {
    const requestId =
      req.headers["x-request-id"] ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    return {
      requestId,
      end: (statusCode: number) => {
        const duration = Date.now() - startTime;

        this.recordMetric({
          name: "http_request_duration",
          value: duration,
          labels: {
            method: req.method,
            path: req.path,
            status: statusCode.toString(),
          },
        });

        this.recordMetric({
          name: "http_requests_total",
          value: 1,
          labels: {
            method: req.method,
            path: req.path,
            status: statusCode.toString(),
          },
        });

        this.info(`${req.method} ${req.path} ${statusCode} - ${duration}ms`, {
          requestId,
          method: req.method,
          path: req.path,
          statusCode,
          duration,
          userAgent: req.headers["user-agent"],
          ip: req.ip,
        });
      },
    };
  }

  // Default alert rules
  private initializeDefaultAlertRules() {
    this.createAlertRule({
      name: "High Response Time",
      condition: "http_request_duration > threshold",
      threshold: 5000, // 5 seconds
      severity: "high",
      enabled: true,
      notificationChannels: ["slack", "email"],
    });

    this.createAlertRule({
      name: "High Error Rate",
      condition: "error_rate > threshold",
      threshold: 0.05, // 5%
      severity: "critical",
      enabled: true,
      notificationChannels: ["pagerduty", "slack"],
    });

    this.createAlertRule({
      name: "Database Connection Issues",
      condition: "health_check_database < threshold",
      threshold: 1,
      severity: "critical",
      enabled: true,
      notificationChannels: ["pagerduty", "slack"],
    });

    this.createAlertRule({
      name: "Redis Connection Issues",
      condition: "health_check_redis < threshold",
      threshold: 1,
      severity: "high",
      enabled: true,
      notificationChannels: ["slack"],
    });
  }

  // Periodic health checks
  private startPeriodicHealthChecks() {
    setInterval(async () => {
      try {
        // Database health check
        await this.performHealthCheck("database", async () => {
          // This would check database connectivity
          return { healthy: true, responseTime: 50 };
        });

        // Redis health check
        await this.performHealthCheck("redis", async () => {
          // This would check Redis connectivity
          return { healthy: true, responseTime: 10 };
        });

        // External API health checks
        await this.performHealthCheck("stripe", async () => {
          // This would check Stripe API
          return { healthy: true, responseTime: 200 };
        });

        // System resources
        const memUsage = process.memoryUsage();
        this.recordMetric({
          name: "memory_usage_bytes",
          value: memUsage.heapUsed,
          labels: { type: "heap_used" },
        });

        this.recordMetric({
          name: "memory_usage_bytes",
          value: memUsage.heapTotal,
          labels: { type: "heap_total" },
        });

        this.recordMetric({
          name: "uptime_seconds",
          value: process.uptime(),
        });
      } catch (error) {
        this.error("Periodic health check failed", error as Error);
      }
    }, 30000); // Every 30 seconds
  }

  // Export metrics in Prometheus format
  exportPrometheusMetrics(): string {
    const lines: string[] = [];

    for (const [name, points] of this.metrics.entries()) {
      if (points.length === 0) continue;

      const latestPoint = points[points.length - 1];
      const labelString = latestPoint.labels
        ? Object.entries(latestPoint.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(",")
        : "";

      lines.push(
        `# TYPE ${name} gauge`,
        `${name}${labelString ? `{${labelString}}` : ""} ${latestPoint.value}`,
      );
    }

    return lines.join("\n");
  }

  // Cleanup old data
  cleanup(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    // Clean old metrics
    for (const [name, points] of this.metrics.entries()) {
      const filtered = points.filter((point) => point.timestamp > olderThan);
      this.metrics.set(name, filtered);
    }

    // Clean old logs
    this.logs = this.logs.filter((log) => log.timestamp > olderThan);

    // Clean old alerts
    this.alerts = this.alerts.filter((alert) => alert.timestamp > olderThan);

    this.info("Monitoring data cleanup completed", { olderThan });
  }
}

// Singleton instance
let monitoringService: MonitoringService | null = null;

export function createMonitoringService(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService();
  }
  return monitoringService;
}

export function getMonitoringService(): MonitoringService {
  if (!monitoringService) {
    throw new Error(
      "Monitoring service not initialized. Call createMonitoringService first.",
    );
  }
  return monitoringService;
}
