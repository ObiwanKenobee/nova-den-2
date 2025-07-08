import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { adminStore, AdminSession } from "../models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "vaulttap-admin-secret-2024";

// Simulated JWT functionality (use actual jsonwebtoken in production)
const jwt = {
  verify(token: string, secret: string): any {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split(".");
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64url");

      if (signature === expectedSignature) {
        return JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
      }
      throw new Error("Invalid signature");
    } catch (error) {
      throw new Error("Invalid token");
    }
  },
};

interface AuthenticatedRequest extends Request {
  admin?: {
    adminId: string;
    email: string;
    role: string;
    permissions: string[];
    tokenId: string;
  };
}

export function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token =
      req.cookies?.admin_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_TOKEN",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if session exists
    const session = adminStore.getSession(decoded.tokenId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
        code: "INVALID_SESSION",
      });
    }

    // Check if admin exists and is active
    const admin = adminStore.findById(session.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or inactive",
        code: "INACTIVE_ADMIN",
      });
    }

    // Check if account is locked
    if (adminStore.isAccountLocked(admin)) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked",
        code: "ACCOUNT_LOCKED",
      });
    }

    // Attach admin info to request
    req.admin = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      tokenId: decoded.tokenId,
    };

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
      code: "INVALID_TOKEN",
    });
  }
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_AUTH",
      });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission required: ${permission}`,
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
}

export function requireRole(roles: string | string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "NO_AUTH",
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Role required: ${allowedRoles.join(" or ")}`,
        code: "INSUFFICIENT_ROLE",
      });
    }

    next();
  };
}

export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  return requireRole("super_admin")(req, res, next);
}

// Rate limiting for admin endpoints
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function adminRateLimit(maxRequests: number, windowMs: number) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.admin?.adminId || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    const current = rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (current.resetTime < now) {
      // Reset window
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count++;
    }

    rateLimitStore.set(key, current);

    if (current.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      });
    }

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - current.count),
    );
    res.setHeader("X-RateLimit-Reset", Math.ceil(current.resetTime / 1000));

    next();
  };
}

// Security headers middleware for admin routes
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self'",
  );

  next();
}

// Audit log middleware for admin actions
export function auditLog(action: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.json;
    res.json = function (body: any) {
      // Log admin action
      console.log("AUDIT LOG:", {
        timestamp: new Date().toISOString(),
        adminId: req.admin?.adminId,
        email: req.admin?.email,
        action,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        success: body?.success !== false,
        statusCode: res.statusCode,
      });

      return originalSend.call(this, body);
    };

    next();
  };
}
