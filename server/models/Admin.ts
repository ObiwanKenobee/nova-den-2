export interface Admin {
  id: string;
  email: string;
  password: string;
  role: "super_admin" | "admin" | "ops_manager";
  name: string;
  permissions: string[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockUntil?: Date;
}

export interface AdminSession {
  adminId: string;
  email: string;
  role: string;
  permissions: string[];
  tokenId: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface AdminPermissions {
  CAN_VIEW_REVOPS: "revops:view";
  CAN_MANAGE_USERS: "users:manage";
  CAN_VIEW_FINANCIALS: "financials:view";
  CAN_MANAGE_BILLING: "billing:manage";
  CAN_CONTROL_SYSTEM: "system:control";
  CAN_MANAGE_PARTNERS: "partners:manage";
  CAN_VIEW_ANALYTICS: "analytics:view";
  CAN_EMERGENCY_ACTIONS: "emergency:execute";
}

// In-memory admin store (in production, use a proper database)
class AdminStore {
  private admins: Map<string, Admin> = new Map();
  private sessions: Map<string, AdminSession> = new Map();

  constructor() {
    this.seedDefaultAdmin();
  }

  private seedDefaultAdmin() {
    const defaultAdmin: Admin = {
      id: "admin-001",
      email: "admin@vaulttap.com",
      password: "$2a$12$LQv3c1yqBwEHFl4nXrSBQOtgKnllYvzKGFT3nfVJyMQ7L.YfHKMvC", // hashed 'VaultTap2024!'
      role: "super_admin",
      name: "VaultTap System Administrator",
      permissions: [
        "revops:view",
        "users:manage",
        "financials:view",
        "billing:manage",
        "system:control",
        "partners:manage",
        "analytics:view",
        "emergency:execute",
      ],
      createdAt: new Date(),
      isActive: true,
      twoFactorEnabled: false,
      loginAttempts: 0,
    };

    this.admins.set(defaultAdmin.id, defaultAdmin);
  }

  findByEmail(email: string): Admin | undefined {
    for (const admin of this.admins.values()) {
      if (admin.email === email) {
        return admin;
      }
    }
    return undefined;
  }

  findById(id: string): Admin | undefined {
    return this.admins.get(id);
  }

  updateAdmin(id: string, updates: Partial<Admin>): Admin | undefined {
    const admin = this.admins.get(id);
    if (!admin) return undefined;

    const updatedAdmin = { ...admin, ...updates };
    this.admins.set(id, updatedAdmin);
    return updatedAdmin;
  }

  createSession(session: AdminSession): void {
    this.sessions.set(session.tokenId, session);
  }

  getSession(tokenId: string): AdminSession | undefined {
    const session = this.sessions.get(tokenId);
    if (!session) return undefined;

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(tokenId);
      return undefined;
    }

    return session;
  }

  deleteSession(tokenId: string): void {
    this.sessions.delete(tokenId);
  }

  incrementLoginAttempts(adminId: string): void {
    const admin = this.admins.get(adminId);
    if (!admin) return;

    admin.loginAttempts += 1;

    // Lock account after 5 failed attempts for 15 minutes
    if (admin.loginAttempts >= 5) {
      admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    this.admins.set(adminId, admin);
  }

  resetLoginAttempts(adminId: string): void {
    const admin = this.admins.get(adminId);
    if (!admin) return;

    admin.loginAttempts = 0;
    admin.lockUntil = undefined;
    admin.lastLogin = new Date();

    this.admins.set(adminId, admin);
  }

  isAccountLocked(admin: Admin): boolean {
    return admin.lockUntil ? admin.lockUntil > new Date() : false;
  }
}

export const adminStore = new AdminStore();
