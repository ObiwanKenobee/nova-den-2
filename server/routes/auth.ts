import { Request, Response } from "express";
import crypto from "crypto";
import {
  adminStore,
  Admin,
  AdminSession,
  LoginCredentials,
} from "../models/Admin";

// Simulated bcrypt functionality (in production, use actual bcrypt)
const bcrypt = {
  async compare(password: string, hash: string): Promise<boolean> {
    // For demo purposes, we'll check against known hashes
    const testPassword = "VaultTap2024!";
    const testHash =
      "$2a$12$LQv3c1yqBwEHFl4nXrSBQOtgKnllYvzKGFT3nfVJyMQ7L.YfHKMvC";
    return password === testPassword && hash === testHash;
  },

  async hash(password: string, rounds: number): Promise<string> {
    // Simple hash simulation - use actual bcrypt in production
    return `$2a$${rounds}$${crypto.createHash("sha256").update(password).digest("hex")}`;
  },
};

// Simulated JWT functionality (in production, use actual jsonwebtoken)
const jwt = {
  sign(payload: any, secret: string, options: any): string {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      "base64url",
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  },

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

const JWT_SECRET = process.env.JWT_SECRET || "vaulttap-admin-secret-2024";

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password, twoFactorCode }: LoginCredentials = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = adminStore.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (adminStore.isAccountLocked(admin)) {
      return res.status(423).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts",
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      adminStore.incrementLoginAttempts(admin.id);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check 2FA if enabled
    if (admin.twoFactorEnabled && !twoFactorCode) {
      return res.status(200).json({
        success: false,
        requiresTwoFactor: true,
        message: "Two-factor authentication code required",
      });
    }

    if (admin.twoFactorEnabled && twoFactorCode) {
      // Simulate 2FA verification (in production, use proper 2FA library)
      const validCodes = ["123456", "000000"]; // Demo codes
      if (!validCodes.includes(twoFactorCode)) {
        return res.status(401).json({
          success: false,
          message: "Invalid two-factor authentication code",
        });
      }
    }

    // Generate session token
    const tokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    const session: AdminSession = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      tokenId,
      expiresAt,
    };

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        tokenId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    // Store session
    adminStore.createSession(session);

    // Reset login attempts on successful login
    adminStore.resetLoginAttempts(admin.id);

    // Set secure cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    res.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function adminLogout(req: Request, res: Response) {
  try {
    const token =
      req.cookies.admin_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        adminStore.deleteSession(decoded.tokenId);
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
      }
    }

    res.clearCookie("admin_token");
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getAdminProfile(req: Request, res: Response) {
  try {
    const adminId = (req as any).admin?.adminId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const admin = adminStore.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
        twoFactorEnabled: admin.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function verifyAdminToken(req: Request, res: Response) {
  try {
    const token =
      req.cookies.admin_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const session = adminStore.getSession(decoded.tokenId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const admin = adminStore.findById(session.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or inactive",
      });
    }

    res.json({
      success: true,
      valid: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
}

export async function refreshAdminToken(req: Request, res: Response) {
  try {
    const token =
      req.cookies.admin_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const session = adminStore.getSession(decoded.tokenId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    const admin = adminStore.findById(session.adminId);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or inactive",
      });
    }

    // Delete old session
    adminStore.deleteSession(decoded.tokenId);

    // Create new session
    const newTokenId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    const newSession: AdminSession = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      tokenId: newTokenId,
      expiresAt,
    };

    const newToken = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        tokenId: newTokenId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    adminStore.createSession(newSession);

    res.cookie("admin_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      expiresAt,
    });
  } catch (error) {
    console.error("Refresh admin token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
}
