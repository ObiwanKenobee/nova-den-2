import { RequestHandler } from "express";
import {
  Vault,
  CreateVaultRequest,
  VaultOperation,
  VaultUnlockCondition,
} from "@shared/api";

// Mock vault storage - in production this would be a database
let vaults: Vault[] = [
  {
    id: "vault_001",
    userId: "user_123",
    name: "Personal Savings",
    description: "My personal emergency fund",
    type: "personal",
    balance: 847.83,
    yieldRate: 5.2,
    isLocked: false,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "vault_002",
    userId: "user_123",
    name: "Harvest Cooperative",
    description: "Shared vault for seasonal farming operations",
    type: "cooperative",
    balance: 325.0,
    yieldRate: 8.5,
    isLocked: true,
    participants: ["user_123", "user_456", "user_789"],
    participantCount: 12,
    createdAt: new Date("2024-02-01"),
    unlockConditions: [
      {
        type: "time",
        value: new Date("2024-06-01"),
        description: "Unlocks after harvest season",
      },
      {
        type: "consensus",
        value: 0.6, // 60% consensus required
        description: "Requires 60% member approval",
      },
    ],
  },
  {
    id: "vault_003",
    userId: "user_123",
    name: "Community Relief",
    description: "Emergency fund for community disasters",
    type: "community",
    balance: 75.0,
    yieldRate: 3.1,
    isLocked: false,
    participantCount: 45,
    createdAt: new Date("2024-02-08"),
  },
];

const generateVaultId = (): string => {
  return `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const calculateYieldRate = (type: string, balance: number): number => {
  const baseRates = {
    personal: 5.2,
    cooperative: 8.5,
    community: 3.1,
  };

  const baseRate = baseRates[type as keyof typeof baseRates] || 5.0;

  // Bonus for larger balances
  const balanceBonus = Math.min(balance / 1000, 0.5); // Max 0.5% bonus

  return baseRate + balanceBonus;
};

export const getVaults: RequestHandler = (req, res) => {
  const currentUserId = "user_123"; // In production, get from authentication
  const userVaults = vaults.filter((vault) => vault.userId === currentUserId);

  res.json({
    success: true,
    data: userVaults,
  });
};

export const getVault: RequestHandler = (req, res) => {
  const { vaultId } = req.params;
  const currentUserId = "user_123";

  const vault = vaults.find(
    (v) => v.id === vaultId && v.userId === currentUserId,
  );

  if (!vault) {
    return res.status(404).json({
      success: false,
      error: "Vault not found",
    });
  }

  res.json({
    success: true,
    data: vault,
  });
};

export const createVault: RequestHandler = (req, res) => {
  try {
    const request: CreateVaultRequest = req.body;
    const currentUserId = "user_123";

    // Validate request
    if (!request.name || !request.type || !request.initialDeposit) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, type, initialDeposit",
      });
    }

    if (request.initialDeposit <= 0) {
      return res.status(400).json({
        success: false,
        error: "Initial deposit must be greater than 0",
      });
    }

    // Check minimum deposit requirements
    const minDeposits = {
      personal: 10,
      cooperative: 50,
      community: 25,
    };

    const minDeposit = minDeposits[request.type as keyof typeof minDeposits];
    if (request.initialDeposit < minDeposit) {
      return res.status(400).json({
        success: false,
        error: `Minimum deposit for ${request.type} vault is ${minDeposit} VT`,
      });
    }

    // Check user balance (mock check)
    const currentBalance = 1247.83;
    if (request.initialDeposit > currentBalance) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance",
      });
    }

    // Create vault
    const vault: Vault = {
      id: generateVaultId(),
      userId: currentUserId,
      name: request.name,
      description: request.description,
      type: request.type,
      balance: request.initialDeposit,
      yieldRate: calculateYieldRate(request.type, request.initialDeposit),
      isLocked: false,
      participants: request.type === "personal" ? undefined : [currentUserId],
      participantCount: request.type === "personal" ? undefined : 1,
      createdAt: new Date(),
      unlockConditions: request.unlockConditions,
    };

    vaults.push(vault);

    res.json({
      success: true,
      data: vault,
      message: "Vault created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create vault",
    });
  }
};

export const vaultOperation: RequestHandler = (req, res) => {
  try {
    const operation: VaultOperation = req.body;
    const currentUserId = "user_123";

    const vault = vaults.find(
      (v) => v.id === operation.vaultId && v.userId === currentUserId,
    );

    if (!vault) {
      return res.status(404).json({
        success: false,
        error: "Vault not found",
      });
    }

    if (vault.isLocked) {
      return res.status(400).json({
        success: false,
        error: "Vault is locked and cannot be modified",
      });
    }

    if (operation.amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
      });
    }

    if (operation.operation === "deposit") {
      // Check user balance for deposit
      const currentBalance = 1247.83;
      if (operation.amount > currentBalance) {
        return res.status(400).json({
          success: false,
          error: "Insufficient balance for deposit",
        });
      }

      vault.balance += operation.amount;
      vault.yieldRate = calculateYieldRate(vault.type, vault.balance);
    } else if (operation.operation === "withdraw") {
      // Check vault balance for withdrawal
      if (operation.amount > vault.balance) {
        return res.status(400).json({
          success: false,
          error: "Insufficient vault balance for withdrawal",
        });
      }

      vault.balance -= operation.amount;
      vault.yieldRate = calculateYieldRate(vault.type, vault.balance);
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid operation. Must be 'deposit' or 'withdraw'",
      });
    }

    res.json({
      success: true,
      data: vault,
      message: `${operation.operation} of ${operation.amount} VT completed successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to process vault operation",
    });
  }
};

export const lockVault: RequestHandler = (req, res) => {
  const { vaultId } = req.params;
  const currentUserId = "user_123";

  const vault = vaults.find(
    (v) => v.id === vaultId && v.userId === currentUserId,
  );

  if (!vault) {
    return res.status(404).json({
      success: false,
      error: "Vault not found",
    });
  }

  vault.isLocked = true;

  res.json({
    success: true,
    data: vault,
    message: "Vault locked successfully",
  });
};

export const unlockVault: RequestHandler = (req, res) => {
  const { vaultId } = req.params;
  const { ritual } = req.body;
  const currentUserId = "user_123";

  const vault = vaults.find(
    (v) => v.id === vaultId && v.userId === currentUserId,
  );

  if (!vault) {
    return res.status(404).json({
      success: false,
      error: "Vault not found",
    });
  }

  if (!vault.isLocked) {
    return res.status(400).json({
      success: false,
      error: "Vault is already unlocked",
    });
  }

  // Check unlock conditions
  if (vault.unlockConditions) {
    const timeCondition = vault.unlockConditions.find((c) => c.type === "time");
    if (timeCondition && new Date() < new Date(timeCondition.value)) {
      return res.status(400).json({
        success: false,
        error: "Vault cannot be unlocked before specified time",
      });
    }

    const ritualCondition = vault.unlockConditions.find(
      (c) => c.type === "ritual",
    );
    if (ritualCondition && !ritual) {
      return res.status(400).json({
        success: false,
        error: "Ritual verification required to unlock vault",
      });
    }
  }

  vault.isLocked = false;

  res.json({
    success: true,
    data: vault,
    message: "Vault unlocked successfully",
  });
};

export const deleteVault: RequestHandler = (req, res) => {
  const { vaultId } = req.params;
  const currentUserId = "user_123";

  const vaultIndex = vaults.findIndex(
    (v) => v.id === vaultId && v.userId === currentUserId,
  );

  if (vaultIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Vault not found",
    });
  }

  const vault = vaults[vaultIndex];

  if (vault.balance > 0) {
    return res.status(400).json({
      success: false,
      error:
        "Cannot delete vault with remaining balance. Withdraw funds first.",
    });
  }

  vaults.splice(vaultIndex, 1);

  res.json({
    success: true,
    message: "Vault deleted successfully",
  });
};
