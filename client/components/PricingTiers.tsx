import React, { useState } from "react";
import { Check, Zap, Users, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price?: number;
  priceType: "free" | "per_use" | "monthly";
  currency: string;
  features: string[];
  limits: {
    vaults?: number;
    transactions?: number;
    yield_rate?: number;
  };
  recommended?: boolean;
  icon: React.ReactNode;
  color: string;
}

const userTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic vault banking",
    priceType: "free",
    currency: "USD",
    features: [
      "Create 1 basic vault",
      "Local-only transactions",
      "Community support",
      "Basic Bluetooth mesh",
    ],
    limits: {
      vaults: 1,
      transactions: 10,
      yield_rate: 0,
    },
    icon: <Zap className="w-6 h-6" />,
    color: "text-slate-500",
  },
  {
    id: "ritual_vault",
    name: "Ritual Vault",
    description: "AI-blessed vaults with elder verification",
    price: 0.1,
    priceType: "per_use",
    currency: "USD",
    features: [
      "Elder proof authentication",
      "AI ritual verification",
      "Voice-based unlocking",
      "Cultural context preservation",
      "Trust score building",
    ],
    limits: {
      vaults: 3,
      transactions: 100,
      yield_rate: 2.5,
    },
    icon: <Star className="w-6 h-6" />,
    color: "text-amber-500",
  },
  {
    id: "diaspora_unlock",
    name: "Diaspora Unlock",
    description: "Connect with family across borders",
    price: 0.25,
    priceType: "per_use",
    currency: "USD",
    recommended: true,
    features: [
      "Cross-border sync",
      "Voice story verification",
      "Family vault sharing",
      "Remittance support",
      "Travel mode unlocking",
    ],
    limits: {
      vaults: 5,
      transactions: 500,
      yield_rate: 5.0,
    },
    icon: <Users className="w-6 h-6" />,
    color: "text-blue-500",
  },
  {
    id: "multi_party_vault",
    name: "Multi-Party Vault",
    description: "Community and family banking",
    price: 1.0,
    priceType: "monthly",
    currency: "USD",
    features: [
      "Unlimited family vaults",
      "Community governance",
      "Multi-signature support",
      "Cooperative yield sharing",
      "Priority AI support",
    ],
    limits: {
      vaults: 10,
      transactions: 1000,
      yield_rate: 8.5,
    },
    icon: <Crown className="w-6 h-6" />,
    color: "text-purple-500",
  },
];

export default function PricingTiers() {
  const [selectedTier, setSelectedTier] = useState<string>("diaspora_unlock");
  const [billingMode, setBillingMode] = useState<"local" | "global">("local");

  const formatPrice = (tier: PricingTier): string => {
    if (tier.priceType === "free") return "Free";
    if (!tier.price) return "Contact us";

    if (billingMode === "local") {
      // Show alternative payment methods for local users
      if (tier.price <= 0.1) return "Barter • Airtime • ~$0.10";
      if (tier.price <= 0.5) return "M-Pesa • Mobile Credit • ~$0.25";
      return "Stablecoins • M-Pesa • $1/mo";
    }

    const amount = tier.price.toFixed(2);
    const period = tier.priceType === "monthly" ? "/mo" : "/use";
    return `$${amount}${period}`;
  };

  const handleSelectPlan = (tierId: string) => {
    setSelectedTier(tierId);
    // In a real app, this would navigate to payment/upgrade flow
    console.log(`Selected plan: ${tierId}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Choose Your Banking Level
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          From basic vaults to full community banking - find the plan that fits
          your needs
        </p>

        {/* Billing Mode Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant={billingMode === "local" ? "default" : "outline"}
            onClick={() => setBillingMode("local")}
            className="px-6"
          >
            Local Payments
          </Button>
          <Button
            variant={billingMode === "global" ? "default" : "outline"}
            onClick={() => setBillingMode("global")}
            className="px-6"
          >
            Global Pricing
          </Button>
        </div>

        {billingMode === "local" && (
          <div className="bg-vault-blue/10 border border-vault-blue/20 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-vault-blue">
              💡 <strong>Local Payment Options:</strong> Pay with mobile money
              (M-Pesa), airtime, community work, or barter goods. No traditional
              banking required.
            </p>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
        {userTiers.map((tier) => (
          <Card
            key={tier.id}
            className={cn(
              "relative p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2",
              selectedTier === tier.id
                ? "border-primary shadow-xl scale-105"
                : "border-border hover:border-primary/50",
              tier.recommended && "ring-2 ring-vault-blue ring-opacity-50",
            )}
            onClick={() => setSelectedTier(tier.id)}
          >
            {/* Recommended Badge */}
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-vault-blue text-white px-3 py-1">
                  Recommended
                </Badge>
              </div>
            )}

            {/* Icon and Name */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200",
                  tier.color,
                )}
              >
                {tier.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {tier.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(tier)}
              </div>
              {tier.priceType === "per_use" && (
                <p className="text-sm text-muted-foreground">
                  Pay only when you use
                </p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-vault-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Limits */}
            <div className="bg-secondary rounded-lg p-3 mb-6 space-y-2">
              <h4 className="text-sm font-semibold text-foreground">
                Includes:
              </h4>
              <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Vaults</span>
                  <span>{tier.limits.vaults}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transactions/mo</span>
                  <span>{tier.limits.transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Yield Rate</span>
                  <span>{tier.limits.yield_rate}% APY</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              className={cn(
                "w-full",
                selectedTier === tier.id
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-secondary hover:bg-secondary/80",
              )}
              onClick={() => handleSelectPlan(tier.id)}
            >
              {selectedTier === tier.id ? "Selected" : "Choose Plan"}
            </Button>
          </Card>
        ))}
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-vault-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-vault-green" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Traditional Banking</h3>
          <p className="text-muted-foreground">
            Pay with what you have - mobile money, community work, or barter
            goods. No bank account required.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-vault-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-vault-blue" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Community First</h3>
          <p className="text-muted-foreground">
            Built for families, cooperatives, and communities. Governance by
            elders and trusted members.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-vault-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-vault-purple" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Cultural Respect</h3>
          <p className="text-muted-foreground">
            Rituals and traditions are preserved and verified by AI that
            understands cultural context.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card rounded-xl p-8">
        <h3 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2">
              What payment methods do you accept?
            </h4>
            <p className="text-muted-foreground text-sm">
              We accept mobile money (M-Pesa, Orange Money), airtime,
              stablecoins, and even community work or barter goods in local
              mode.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              How does ritual verification work?
            </h4>
            <p className="text-muted-foreground text-sm">
              Our AI agents verify cultural rituals using voice analysis,
              community consensus, and elder approval to ensure authenticity.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Can I upgrade or downgrade?</h4>
            <p className="text-muted-foreground text-sm">
              Yes, you can change your plan anytime. Pay-per-use plans give you
              maximum flexibility with no commitments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              What happens if I don't have internet?
            </h4>
            <p className="text-muted-foreground text-sm">
              VaultTap works offline via Bluetooth mesh. Payments sync
              automatically when connectivity resumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
