import React, { useState } from "react";
import { Link } from "react-router-dom";
import PaymentGateway from "@/components/payments/PaymentGateway";
import {
  ArrowLeft,
  Check,
  Code,
  Shield,
  BarChart3,
  Zap,
  Users,
  Globe,
  Crown,
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultTapLogo } from "@/components/VaultTapLogo";
import { cn } from "@/lib/utils";

interface EnterpriseTier {
  id: string;
  name: string;
  description: string;
  price: number;
  priceRange?: { min: number; max: number };
  features: string[];
  limits: {
    api_calls: number;
    storage_gb: number;
    support_level: string;
  };
  use_cases: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

const enterpriseTiers: EnterpriseTier[] = [
  {
    id: "core_sdk",
    name: "VaultTap Core SDK",
    description: "Deploy BLE mesh logic in your applications",
    price: 99,
    priceRange: { min: 99, max: 499 },
    features: [
      "Bluetooth mesh networking SDK",
      "Basic vault operations API",
      "Offline transaction support",
      "Developer documentation",
      "Email support",
    ],
    limits: {
      api_calls: 10000,
      storage_gb: 5,
      support_level: "Email",
    },
    use_cases: [
      "Mobile app integration",
      "IoT device connectivity",
      "Local mesh networks",
    ],
    icon: <Code className="w-6 h-6" />,
    color: "text-blue-500",
  },
  {
    id: "ritual_ai_cluster",
    name: "RitualAI Agent Cluster",
    description: "Claude/GPT agents for compliance & cultural verification",
    price: 499,
    priceRange: { min: 499, max: 1499 },
    popular: true,
    features: [
      "Multi-agent AI orchestration",
      "Cultural ritual verification",
      "Governance compliance checks",
      "Story-based trust analysis",
      "Priority support",
    ],
    limits: {
      api_calls: 50000,
      storage_gb: 25,
      support_level: "Priority",
    },
    use_cases: [
      "NGO compliance automation",
      "Cultural preservation",
      "Trust scoring systems",
    ],
    icon: <Zap className="w-6 h-6" />,
    color: "text-purple-500",
  },
  {
    id: "vault_intelligence",
    name: "Vault Intelligence API",
    description: "Real-time vault metadata & analytics",
    price: 199,
    priceRange: { min: 99, max: 999 },
    features: [
      "Real-time vault analytics",
      "Transaction flow insights",
      "Trust metric dashboards",
      "Export capabilities",
      "Webhook integrations",
    ],
    limits: {
      api_calls: 25000,
      storage_gb: 10,
      support_level: "Standard",
    },
    use_cases: [
      "Financial monitoring",
      "Risk assessment",
      "Operational insights",
    ],
    icon: <BarChart3 className="w-6 h-6" />,
    color: "text-green-500",
  },
  {
    id: "governance_oracle",
    name: "Governance Oracle API",
    description: "EU AI Act, GDPR & regulatory compliance automation",
    price: 399,
    priceRange: { min: 199, max: 899 },
    features: [
      "Multi-jurisdiction compliance",
      "AI bias detection",
      "Automated risk classification",
      "Regulatory reporting",
      "Compliance dashboards",
    ],
    limits: {
      api_calls: 15000,
      storage_gb: 5,
      support_level: "Priority",
    },
    use_cases: [
      "Regulatory compliance",
      "Risk management",
      "Audit preparation",
    ],
    icon: <Shield className="w-6 h-6" />,
    color: "text-red-500",
  },
];

const partnerTiers: EnterpriseTier[] = [
  {
    id: "guardian_tier",
    name: "Guardian Tier",
    description: "Complete multi-agent orchestration for humanitarian orgs",
    price: 2000,
    features: [
      "Full AI agent orchestration",
      "Custom mobile app bundles",
      "Cultural ritual customization",
      "White-label deployment",
      "24/7 dedicated support",
      "Custom SLA agreements",
    ],
    limits: {
      api_calls: 1000000,
      storage_gb: 100,
      support_level: "24/7 Dedicated",
    },
    use_cases: ["UN agencies", "Large NGOs", "Government programs"],
    icon: <Crown className="w-6 h-6" />,
    color: "text-yellow-500",
  },
  {
    id: "diaspora_vault_tier",
    name: "Diaspora Vault Tier",
    description: "Specialized tools for migrant family banking",
    price: 1500,
    features: [
      "Cross-border sync APIs",
      "Family vault management",
      "Remittance optimization",
      "Cultural context preservation",
      "Migration-aware features",
    ],
    limits: {
      api_calls: 500000,
      storage_gb: 50,
      support_level: "Priority",
    },
    use_cases: [
      "Diaspora banks",
      "Money transfer operators",
      "Migration services",
    ],
    icon: <Globe className="w-6 h-6" />,
    color: "text-indigo-500",
  },
  {
    id: "regen_banking_tier",
    name: "Regen Banking Tier",
    description: "Complete white-label platform for sustainable finance",
    price: 5000,
    features: [
      "Full white-label SDK",
      "Custom AI governance rules",
      "Vault simulator & testing",
      "Climate impact tracking",
      "Regenerative yield models",
      "Custom deployment support",
    ],
    limits: {
      api_calls: 5000000,
      storage_gb: 500,
      support_level: "Enterprise",
    },
    use_cases: [
      "Climate funds",
      "Sustainable finance platforms",
      "Community banks",
    ],
    icon: <Users className="w-6 h-6" />,
    color: "text-emerald-500",
  },
];

export default function EnterprisePricing() {
  const [selectedTab, setSelectedTab] = useState("enterprise");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    tier: "",
    message: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [paymentTier, setPaymentTier] = useState<EnterpriseTier | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    // Handle contact form submission
  };

  const handlePurchase = async (tier: EnterpriseTier) => {
    try {
      // Create customer if needed
      if (!customerId) {
        const customerResponse = await fetch("/api/customers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: contactForm.email || "customer@example.com",
            name: contactForm.name || "Enterprise Customer",
            tier: "enterprise",
            billingAddress: {
              line1: "123 Business St",
              city: "Enterprise City",
              state: "CA",
              postalCode: "90210",
              country: "US",
            },
          }),
        });

        const customerData = await customerResponse.json();
        if (customerData.success) {
          setCustomerId(customerData.customer.id);
        }
      }

      setPaymentTier(tier);
      setShowPayment(true);
    } catch (error) {
      console.error("Purchase error:", error);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log("Payment successful:", paymentIntent);
    setShowPayment(false);
    alert(`Payment successful! Welcome to ${paymentTier?.name}`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    alert(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentTier(null);
  };

  const formatApiCalls = (calls: number): string => {
    if (calls >= 1000000) return `${calls / 1000000}M`;
    if (calls >= 1000) return `${calls / 1000}K`;
    return calls.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <VaultTapLogo showText={false} />
              <span className="text-lg lg:text-xl font-semibold">
                Enterprise Pricing
              </span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Link to="/revenue">
                <Button variant="outline" size="sm">
                  Analytics
                </Button>
              </Link>
              <Link to="/revops">
                <Button variant="outline" size="sm">
                  RevOps
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6">
            Build with{" "}
            <span className="bg-gradient-to-r from-vault-blue to-vault-purple bg-clip-text text-transparent">
              VaultTap APIs
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 lg:mb-8 px-4">
            Power your applications with Bluetooth mesh banking, AI governance,
            and cultural verification. From startups to humanitarian
            organizations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90 px-8 w-full sm:w-auto"
            >
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              View Documentation
            </Button>
          </div>
        </div>

        {/* Pricing Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-16"
        >
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="enterprise" className="text-base">
              Enterprise APIs
            </TabsTrigger>
            <TabsTrigger value="partners" className="text-base">
              Premium Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enterprise" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Enterprise API Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Build powerful applications with our REST and GraphQL APIs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enterpriseTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={cn(
                    "relative p-6 border-2 hover:shadow-lg transition-all duration-300",
                    tier.popular
                      ? "border-primary shadow-xl ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn("p-2 rounded-lg bg-secondary", tier.color)}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{tier.name}</h3>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {tier.description}
                  </p>

                  <div className="mb-6">
                    <div className="text-3xl font-bold">
                      ${tier.priceRange?.min}
                      {tier.priceRange && (
                        <span className="text-lg text-muted-foreground">
                          -${tier.priceRange.max}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {tier.features.slice(0, 5).map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-vault-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-secondary rounded-lg p-3 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>API Calls/month</span>
                      <span className="font-semibold">
                        {formatApiCalls(tier.limits.api_calls)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Storage</span>
                      <span className="font-semibold">
                        {tier.limits.storage_gb}GB
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Support</span>
                      <span className="font-semibold">
                        {tier.limits.support_level}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handlePurchase(tier)}
                  >
                    Purchase ${tier.price}/month
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Premium Partner Plans</h2>
              <p className="text-lg text-muted-foreground">
                For NGOs, governments, and organizations needing full platform
                access
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {partnerTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className="p-8 border-2 border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={cn("p-3 rounded-lg bg-secondary", tier.color)}
                    >
                      {tier.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-4xl font-bold">${tier.price}</div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-vault-green mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-secondary rounded-lg p-4 mb-6">
                    <h4 className="font-semibold mb-3">Perfect for:</h4>
                    <div className="space-y-2">
                      {tier.use_cases.map((useCase, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-vault-blue" />
                          <span className="text-sm">{useCase}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90"
                    onClick={() => handlePurchase(tier)}
                  >
                    Purchase ${tier.price}/month
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Choose VaultTap APIs?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-vault-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-vault-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Offline-First</h3>
              <p className="text-muted-foreground">
                Bluetooth mesh networking that works without internet. Perfect
                for remote areas and crisis situations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-vault-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-vault-purple" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Governance</h3>
              <p className="text-muted-foreground">
                Multi-agent AI ensures regulatory compliance across GDPR, EU AI
                Act, and cultural appropriateness.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-vault-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-vault-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Cultural Respect</h3>
              <p className="text-muted-foreground">
                Built-in cultural verification and ritual authentication that
                preserves traditional practices.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Contact our team to discuss your specific requirements and get a
            custom quote.
          </p>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-border bg-background"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
                className="w-full p-3 rounded-lg border border-border bg-background"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Company/Organization"
              value={contactForm.company}
              onChange={(e) =>
                setContactForm({ ...contactForm, company: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-border bg-background"
              required
            />

            <select
              value={contactForm.tier}
              onChange={(e) =>
                setContactForm({ ...contactForm, tier: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-border bg-background"
              required
            >
              <option value="">Select a Plan</option>
              <option value="core_sdk">Core SDK</option>
              <option value="ritual_ai">RitualAI Agent Cluster</option>
              <option value="vault_intelligence">Vault Intelligence</option>
              <option value="governance_oracle">Governance Oracle</option>
              <option value="guardian_tier">Guardian Tier</option>
              <option value="diaspora_tier">Diaspora Vault Tier</option>
              <option value="regen_banking">Regen Banking Tier</option>
              <option value="custom">Custom Solution</option>
            </select>

            <textarea
              placeholder="Tell us about your project and requirements..."
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              rows={4}
              className="w-full p-3 rounded-lg border border-border bg-background"
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90"
              size="lg"
            >
              Send Message
            </Button>
          </form>
        </Card>
      </div>

      {/* Payment Modal */}
      {showPayment && paymentTier && customerId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
                  <p className="text-muted-foreground">
                    {paymentTier.name} - ${paymentTier.price}/month
                  </p>
                </div>
                <Button variant="outline" onClick={handlePaymentCancel}>
                  Cancel
                </Button>
              </div>
            </div>
            <div className="p-6">
              <PaymentGateway
                amount={paymentTier.price}
                currency="USD"
                description={`${paymentTier.name} Monthly Subscription`}
                customerId={customerId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
                availableMethods={[
                  "stripe",
                  "paypal",
                  "crypto_bitcoin",
                  "bank_transfer",
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
