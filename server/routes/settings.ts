import { RequestHandler } from "express";
import { UserSettings, Ritual } from "@shared/api";

// Mock settings storage - in production this would be a database
let userSettings: UserSettings = {
  userId: "user_123",
  bluetoothEnabled: true,
  autoRelay: true,
  coverTraffic: true,
  biometricAuth: true,
  ritualAuth: true,
  autoLock: true,
  autoLockTimeout: 300, // 5 minutes in seconds
  emergencyWipeEnabled: true,
  emergencyWipePattern: "triple_tap_power",
};

const availableRituals: Ritual[] = [
  {
    id: "harvest",
    name: "Harvest Blessing",
    description: "Traditional blessing for agricultural transactions",
    type: "gesture",
    requirements: ["Hand gesture", "Voice confirmation"],
    isActive: true,
  },
  {
    id: "elder",
    name: "Elder Witness",
    description: "Verification by community elder",
    type: "elder_consensus",
    requirements: [
      "Elder presence",
      "Bluetooth proximity",
      "Voice confirmation",
    ],
    isActive: true,
  },
  {
    id: "coop",
    name: "Cooperative Bond",
    description: "Member-to-member transfer ritual",
    type: "gesture",
    requirements: ["Mutual handshake gesture", "Shared phrase"],
    isActive: true,
  },
  {
    id: "relief",
    name: "Aid Distribution",
    description: "Emergency humanitarian aid ritual",
    type: "custom",
    requirements: ["Aid worker verification", "Recipient identification"],
    isActive: true,
  },
  {
    id: "biometric",
    name: "Biometric Scan",
    description: "Fingerprint or face recognition",
    type: "biometric",
    requirements: ["Fingerprint scan", "Face recognition"],
    isActive: true,
  },
];

export const getSettings: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: userSettings,
  });
};

export const updateSettings: RequestHandler = (req, res) => {
  try {
    const updates = req.body;

    // Validate and update settings
    Object.keys(updates).forEach((key) => {
      if (key in userSettings) {
        userSettings[key as keyof UserSettings] = updates[key];
      }
    });

    res.json({
      success: true,
      data: userSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update settings",
    });
  }
};

export const getRituals: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: availableRituals,
  });
};

export const createCustomRitual: RequestHandler = (req, res) => {
  try {
    const { name, description, requirements } = req.body;

    if (!name || !description || !requirements) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, description, requirements",
      });
    }

    const ritual: Ritual = {
      id: `custom_${Date.now()}`,
      name,
      description,
      type: "custom",
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      isActive: true,
    };

    availableRituals.push(ritual);

    res.json({
      success: true,
      data: ritual,
      message: "Custom ritual created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to create custom ritual",
    });
  }
};

export const deleteRitual: RequestHandler = (req, res) => {
  const { ritualId } = req.params;

  const ritualIndex = availableRituals.findIndex((r) => r.id === ritualId);

  if (ritualIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Ritual not found",
    });
  }

  const ritual = availableRituals[ritualIndex];

  if (ritual.type !== "custom") {
    return res.status(400).json({
      success: false,
      error: "Cannot delete built-in rituals",
    });
  }

  availableRituals.splice(ritualIndex, 1);

  res.json({
    success: true,
    message: "Ritual deleted successfully",
  });
};

export const exportData: RequestHandler = (req, res) => {
  const userData = {
    settings: userSettings,
    rituals: availableRituals.filter((r) => r.type === "custom"),
    exportedAt: new Date(),
    version: "1.0.0",
  };

  res.json({
    success: true,
    data: userData,
    message: "Data exported successfully",
  });
};

export const importData: RequestHandler = (req, res) => {
  try {
    const { settings, rituals } = req.body;

    if (settings) {
      // Merge imported settings with current settings
      Object.keys(settings).forEach((key) => {
        if (key in userSettings) {
          userSettings[key as keyof UserSettings] = settings[key];
        }
      });
    }

    if (rituals && Array.isArray(rituals)) {
      // Add imported custom rituals
      rituals.forEach((ritual: Ritual) => {
        if (!availableRituals.find((r) => r.id === ritual.id)) {
          availableRituals.push(ritual);
        }
      });
    }

    res.json({
      success: true,
      data: {
        settings: userSettings,
        rituals: availableRituals,
      },
      message: "Data imported successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to import data",
    });
  }
};

export const clearData: RequestHandler = (req, res) => {
  const { type } = req.body;

  try {
    switch (type) {
      case "settings":
        // Reset to default settings
        userSettings = {
          userId: "user_123",
          bluetoothEnabled: true,
          autoRelay: false,
          coverTraffic: false,
          biometricAuth: false,
          ritualAuth: true,
          autoLock: true,
          autoLockTimeout: 300,
          emergencyWipeEnabled: false,
        };
        break;

      case "rituals":
        // Remove custom rituals
        const builtInRituals = availableRituals.filter(
          (r) => r.type !== "custom",
        );
        availableRituals.length = 0;
        availableRituals.push(...builtInRituals);
        break;

      case "all":
        // Reset everything
        userSettings = {
          userId: "user_123",
          bluetoothEnabled: true,
          autoRelay: false,
          coverTraffic: false,
          biometricAuth: false,
          ritualAuth: true,
          autoLock: true,
          autoLockTimeout: 300,
          emergencyWipeEnabled: false,
        };
        const defaultRituals = availableRituals.filter(
          (r) => r.type !== "custom",
        );
        availableRituals.length = 0;
        availableRituals.push(...defaultRituals);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid clear type. Use 'settings', 'rituals', or 'all'",
        });
    }

    res.json({
      success: true,
      message: `${type} cleared successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to clear data",
    });
  }
};

export const emergencyWipe: RequestHandler = (req, res) => {
  const { pattern, confirmation } = req.body;

  if (!pattern || !confirmation) {
    return res.status(400).json({
      success: false,
      error: "Emergency wipe requires pattern and confirmation",
    });
  }

  if (confirmation !== "EMERGENCY_WIPE_CONFIRMED") {
    return res.status(400).json({
      success: false,
      error: "Invalid confirmation code",
    });
  }

  if (pattern !== userSettings.emergencyWipePattern) {
    return res.status(400).json({
      success: false,
      error: "Invalid emergency wipe pattern",
    });
  }

  // Simulate emergency wipe - in production this would:
  // 1. Delete all user data
  // 2. Clear encryption keys
  // 3. Reset device to factory state
  // 4. Log the emergency wipe event

  res.json({
    success: true,
    message: "Emergency wipe completed successfully",
    data: {
      wipedAt: new Date(),
      recoveryRequired: true,
    },
  });
};
