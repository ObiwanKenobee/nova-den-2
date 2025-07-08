import { Request, Response } from "express";
import crypto from "crypto";

// Payment method types
export type PaymentMethod =
  | "stripe"
  | "paypal"
  | "crypto_bitcoin"
  | "crypto_ethereum"
  | "crypto_usdc"
  | "bank_transfer"
  | "wire_transfer"
  | "mobile_money";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  customerId: string;
  subscriptionId?: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  paymentDetails: Record<string, any>;
}

export interface Subscription {
  id: string;
  customerId: string;
  tier: "individual" | "community" | "enterprise";
  status: "active" | "cancelled" | "past_due" | "unpaid" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  billingCycle: "monthly" | "yearly";
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  features: string[];
  metadata: Record<string, any>;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  tier: "individual" | "community" | "enterprise";
  subscriptionId?: string;
  paymentMethods: {
    id: string;
    type: PaymentMethod;
    isDefault: boolean;
    details: Record<string, any>;
  }[];
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
}

// In-memory stores (use proper database in production)
class PaymentStore {
  private payments: Map<string, PaymentIntent> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private customers: Map<string, Customer> = new Map();

  // Payment methods
  createPaymentIntent(intent: Omit<PaymentIntent, "id" | "createdAt">) {
    const paymentIntent: PaymentIntent = {
      id: `pi_${crypto.randomUUID()}`,
      createdAt: new Date(),
      ...intent,
    };

    this.payments.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  }

  getPaymentIntent(id: string): PaymentIntent | undefined {
    return this.payments.get(id);
  }

  updatePaymentIntent(
    id: string,
    updates: Partial<PaymentIntent>,
  ): PaymentIntent | undefined {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updated = { ...payment, ...updates };
    this.payments.set(id, updated);
    return updated;
  }

  // Subscription methods
  createSubscription(sub: Omit<Subscription, "id">) {
    const subscription: Subscription = {
      id: `sub_${crypto.randomUUID()}`,
      ...sub,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  getSubscription(id: string): Subscription | undefined {
    return this.subscriptions.get(id);
  }

  getCustomerSubscriptions(customerId: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.customerId === customerId,
    );
  }

  updateSubscription(
    id: string,
    updates: Partial<Subscription>,
  ): Subscription | undefined {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updated = { ...subscription, ...updates };
    this.subscriptions.set(id, updated);
    return updated;
  }

  // Customer methods
  createCustomer(customer: Omit<Customer, "id" | "createdAt">) {
    const newCustomer: Customer = {
      id: `cus_${crypto.randomUUID()}`,
      createdAt: new Date(),
      ...customer,
    };

    this.customers.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  findCustomerByEmail(email: string): Customer | undefined {
    for (const customer of this.customers.values()) {
      if (customer.email === email) {
        return customer;
      }
    }
    return undefined;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updated = { ...customer, ...updates };
    this.customers.set(id, updated);
    return updated;
  }
}

const paymentStore = new PaymentStore();

// Pricing tiers
const PRICING_TIERS = {
  individual: {
    monthly: {
      amount: 9.99,
      currency: "USD",
      features: ["basic_vault", "bluetooth_mesh", "mobile_app"],
    },
    yearly: {
      amount: 99.99,
      currency: "USD",
      features: ["basic_vault", "bluetooth_mesh", "mobile_app"],
    },
  },
  community: {
    monthly: {
      amount: 29.99,
      currency: "USD",
      features: [
        "basic_vault",
        "bluetooth_mesh",
        "mobile_app",
        "community_governance",
        "ritual_verification",
      ],
    },
    yearly: {
      amount: 299.99,
      currency: "USD",
      features: [
        "basic_vault",
        "bluetooth_mesh",
        "mobile_app",
        "community_governance",
        "ritual_verification",
      ],
    },
  },
  enterprise: {
    monthly: {
      amount: 199.99,
      currency: "USD",
      features: [
        "all_features",
        "custom_integrations",
        "priority_support",
        "white_labeling",
        "sla_guarantee",
      ],
    },
    yearly: {
      amount: 1999.99,
      currency: "USD",
      features: [
        "all_features",
        "custom_integrations",
        "priority_support",
        "white_labeling",
        "sla_guarantee",
      ],
    },
  },
};

// Payment method handlers
class PaymentProcessors {
  static async processStripePayment(
    intent: PaymentIntent,
  ): Promise<PaymentIntent> {
    // Simulate Stripe API call
    console.log("Processing Stripe payment:", intent.id);

    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      intent.status = "completed";
      intent.completedAt = new Date();
      intent.paymentDetails = {
        stripePaymentIntentId: `pi_stripe_${crypto.randomUUID()}`,
        last4: "4242",
        brand: "visa",
      };
    } else {
      intent.status = "failed";
      intent.paymentDetails = {
        error: "Payment declined by bank",
        code: "card_declined",
      };
    }

    return intent;
  }

  static async processPayPalPayment(
    intent: PaymentIntent,
  ): Promise<PaymentIntent> {
    console.log("Processing PayPal payment:", intent.id);

    const success = Math.random() > 0.05; // 95% success rate

    if (success) {
      intent.status = "completed";
      intent.completedAt = new Date();
      intent.paymentDetails = {
        paypalTransactionId: `txn_paypal_${crypto.randomUUID()}`,
        payerEmail: "customer@example.com",
      };
    } else {
      intent.status = "failed";
      intent.paymentDetails = {
        error: "Insufficient funds",
        code: "insufficient_funds",
      };
    }

    return intent;
  }

  static async processCryptoPayment(
    intent: PaymentIntent,
  ): Promise<PaymentIntent> {
    console.log("Processing crypto payment:", intent.id, intent.method);

    // Generate crypto address based on method
    let address: string;
    switch (intent.method) {
      case "crypto_bitcoin":
        address = `bc1${crypto.randomBytes(32).toString("hex").slice(0, 39)}`;
        break;
      case "crypto_ethereum":
        address = `0x${crypto.randomBytes(20).toString("hex")}`;
        break;
      case "crypto_usdc":
        address = `0x${crypto.randomBytes(20).toString("hex")}`;
        break;
      default:
        throw new Error("Unsupported crypto method");
    }

    intent.status = "pending";
    intent.paymentDetails = {
      address,
      amount: intent.amount,
      currency: intent.method.replace("crypto_", "").toUpperCase(),
      confirmations: 0,
      requiredConfirmations: intent.method === "crypto_bitcoin" ? 3 : 12,
      qrCode: `data:image/svg+xml;base64,${Buffer.from(`<svg>QR Code for ${address}</svg>`).toString("base64")}`,
    };

    // Simulate confirmation process
    setTimeout(() => {
      intent.status = "completed";
      intent.completedAt = new Date();
      intent.paymentDetails.confirmations =
        intent.paymentDetails.requiredConfirmations;
      paymentStore.updatePaymentIntent(intent.id, intent);
    }, 30000); // 30 seconds

    return intent;
  }

  static async processBankTransfer(
    intent: PaymentIntent,
  ): Promise<PaymentIntent> {
    console.log("Processing bank transfer:", intent.id);

    intent.status = "pending";
    intent.paymentDetails = {
      bankName: "VaultTap Bank Account",
      accountNumber: "****1234",
      routingNumber: "021000021",
      swiftCode: "VLTPUS33",
      reference: `VT${intent.id.slice(-8).toUpperCase()}`,
      instructions: "Please include the reference number in your transfer",
    };

    // Simulate manual verification process
    setTimeout(() => {
      const success = Math.random() > 0.02; // 98% success rate
      intent.status = success ? "completed" : "failed";
      if (success) {
        intent.completedAt = new Date();
      } else {
        intent.paymentDetails.error = "Transfer not received";
      }
      paymentStore.updatePaymentIntent(intent.id, intent);
    }, 60000); // 1 minute

    return intent;
  }

  static async processMobileMoney(
    intent: PaymentIntent,
  ): Promise<PaymentIntent> {
    console.log("Processing mobile money payment:", intent.id);

    const success = Math.random() > 0.03; // 97% success rate

    if (success) {
      intent.status = "completed";
      intent.completedAt = new Date();
      intent.paymentDetails = {
        provider: "M-Pesa",
        transactionId: `MM${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
        phoneNumber: "+254*****789",
      };
    } else {
      intent.status = "failed";
      intent.paymentDetails = {
        error: "Mobile money transaction failed",
        code: "transaction_failed",
      };
    }

    return intent;
  }
}

// API endpoints
export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const {
      amount,
      currency = "USD",
      method,
      customerId,
      subscriptionId,
      description,
      metadata = {},
    } = req.body;

    if (!amount || !method || !customerId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: amount, method, customerId",
      });
    }

    const customer = paymentStore.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const paymentIntent = paymentStore.createPaymentIntent({
      amount,
      currency,
      method,
      customerId,
      subscriptionId,
      description: description || "VaultTap Payment",
      metadata,
      status: "pending",
      paymentDetails: {},
    });

    // Process payment based on method
    let processedIntent: PaymentIntent;
    try {
      switch (method) {
        case "stripe":
          processedIntent =
            await PaymentProcessors.processStripePayment(paymentIntent);
          break;
        case "paypal":
          processedIntent =
            await PaymentProcessors.processPayPalPayment(paymentIntent);
          break;
        case "crypto_bitcoin":
        case "crypto_ethereum":
        case "crypto_usdc":
          processedIntent =
            await PaymentProcessors.processCryptoPayment(paymentIntent);
          break;
        case "bank_transfer":
        case "wire_transfer":
          processedIntent =
            await PaymentProcessors.processBankTransfer(paymentIntent);
          break;
        case "mobile_money":
          processedIntent =
            await PaymentProcessors.processMobileMoney(paymentIntent);
          break;
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }

      paymentStore.updatePaymentIntent(paymentIntent.id, processedIntent);

      res.json({
        success: true,
        paymentIntent: processedIntent,
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      paymentStore.updatePaymentIntent(paymentIntent.id, {
        status: "failed",
        paymentDetails: { error: "Payment processing failed" },
      });

      res.status(500).json({
        success: false,
        message: "Payment processing failed",
        paymentIntentId: paymentIntent.id,
      });
    }
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPaymentIntent(req: Request, res: Response) {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = paymentStore.getPaymentIntent(paymentIntentId);
    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: "Payment intent not found",
      });
    }

    res.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error("Get payment intent error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createSubscription(req: Request, res: Response) {
  try {
    const {
      customerId,
      tier,
      billingCycle = "monthly",
      paymentMethod,
      trialDays = 0,
    } = req.body;

    if (!customerId || !tier || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: customerId, tier, paymentMethod",
      });
    }

    const customer = paymentStore.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if tier is valid
    if (!PRICING_TIERS[tier as keyof typeof PRICING_TIERS]) {
      return res.status(400).json({
        success: false,
        message: "Invalid tier",
      });
    }

    const pricing =
      PRICING_TIERS[tier as keyof typeof PRICING_TIERS][
        billingCycle as keyof typeof PRICING_TIERS.individual
      ];

    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription = paymentStore.createSubscription({
      customerId,
      tier: tier as any,
      status: trialDays > 0 ? "trialing" : "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      billingCycle: billingCycle as any,
      amount: pricing.amount,
      currency: pricing.currency,
      paymentMethod: paymentMethod as PaymentMethod,
      trialEndsAt:
        trialDays > 0
          ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
          : undefined,
      features: pricing.features,
      metadata: {},
    });

    // Update customer
    paymentStore.updateCustomer(customerId, {
      tier: tier as any,
      subscriptionId: subscription.id,
    });

    // Create initial payment intent if not in trial
    if (trialDays === 0) {
      const paymentIntent = paymentStore.createPaymentIntent({
        amount: pricing.amount,
        currency: pricing.currency,
        method: paymentMethod as PaymentMethod,
        customerId,
        subscriptionId: subscription.id,
        description: `${tier} subscription - ${billingCycle}`,
        status: "pending",
        paymentDetails: {},
        metadata: { subscriptionId: subscription.id },
      });

      // Process first payment
      // Note: In production, you'd want to handle this more robustly
    }

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;

    const subscription = paymentStore.getSubscription(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function cancelSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const subscription = paymentStore.getSubscription(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const updatedSubscription = paymentStore.updateSubscription(
      subscriptionId,
      {
        status: "cancelled",
        cancelledAt: new Date(),
        metadata: { ...subscription.metadata, cancellationReason: reason },
      },
    );

    res.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function createCustomer(req: Request, res: Response) {
  try {
    const {
      email,
      name,
      tier = "individual",
      billingAddress,
      taxId,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, name",
      });
    }

    // Check if customer already exists
    const existingCustomer = paymentStore.findCustomerByEmail(email);
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer with this email already exists",
        customerId: existingCustomer.id,
      });
    }

    const customer = paymentStore.createCustomer({
      email,
      name,
      tier: tier as any,
      paymentMethods: [],
      billingAddress: billingAddress || {
        line1: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      },
      taxId,
      isActive: true,
    });

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getCustomer(req: Request, res: Response) {
  try {
    const { customerId } = req.params;

    const customer = paymentStore.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get customer's subscriptions
    const subscriptions = paymentStore.getCustomerSubscriptions(customerId);

    res.json({
      success: true,
      customer,
      subscriptions,
    });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getPricingTiers(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      tiers: PRICING_TIERS,
    });
  } catch (error) {
    console.error("Get pricing tiers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function getSupportedPaymentMethods(req: Request, res: Response) {
  try {
    const { country = "US", currency = "USD" } = req.query;

    // Payment methods available by region
    const paymentMethods = {
      stripe: {
        available: true,
        currencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
        countries: ["US", "CA", "GB", "AU", "FR", "DE", "IT", "ES"],
      },
      paypal: {
        available: true,
        currencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
        countries: ["US", "CA", "GB", "AU", "FR", "DE", "IT", "ES", "BR", "MX"],
      },
      crypto_bitcoin: {
        available: true,
        currencies: ["BTC"],
        countries: ["global"],
      },
      crypto_ethereum: {
        available: true,
        currencies: ["ETH"],
        countries: ["global"],
      },
      crypto_usdc: {
        available: true,
        currencies: ["USDC"],
        countries: ["global"],
      },
      bank_transfer: {
        available: ["US", "CA", "GB", "EU"].includes(country as string),
        currencies: ["USD", "EUR", "GBP", "CAD"],
        countries: ["US", "CA", "GB", "FR", "DE", "IT", "ES"],
      },
      mobile_money: {
        available: ["KE", "UG", "TZ", "GH", "ZA"].includes(country as string),
        currencies: ["KES", "UGX", "TZS", "GHS", "ZAR"],
        countries: ["KE", "UG", "TZ", "GH", "ZA"],
      },
    };

    const availableMethods = Object.entries(paymentMethods)
      .filter(([method, config]) => {
        if (!config.available) return false;
        if (config.countries.includes("global")) return true;
        return config.countries.includes(country as string);
      })
      .map(([method, config]) => ({
        method,
        ...config,
      }));

    res.json({
      success: true,
      paymentMethods: availableMethods,
      country,
      currency,
    });
  } catch (error) {
    console.error("Get supported payment methods error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
