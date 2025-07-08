import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bluetooth,
  Shield,
  Zap,
  Users,
  Globe,
  ChevronDown,
  DollarSign,
  Crown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VaultTapLogo } from "@/components/VaultTapLogo";
import { BluetoothStatus } from "@/components/BluetoothStatus";
import PricingTiers from "@/components/PricingTiers";

export default function Index() {
  const [bluetoothStatus] = useState<
    "connected" | "searching" | "disconnected"
  >("connected");

  const features = [
    {
      icon: <Bluetooth className="w-8 h-8" />,
      title: "Bluetooth Mesh Banking",
      description:
        "Send & receive payments via Bluetooth mesh networks. No internet required.",
      color: "vault-blue",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Ritual Authentication",
      description:
        "Secure your vault with voice, gestures, or elder consensus. No passwords.",
      color: "vault-purple",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Offline Resilient",
      description:
        "Works in disaster zones, remote areas, and anywhere without infrastructure.",
      color: "vault-green",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Banking",
      description:
        "Cooperative harvest banking, refugee aid distribution, and diaspora remittance.",
      color: "vault-orange",
    },
  ];

  const useCases = [
    {
      title: "Marketplace Transactions",
      description:
        "Tap phones to buy goods, confirm quality with ritual verification",
      icon: "🏪",
    },
    {
      title: "Cooperative Banking",
      description:
        "Farmers stake labor into shared seasonal vaults with mesh distribution",
      icon: "🌾",
    },
    {
      title: "Refugee Aid",
      description:
        "Dignified UBI distribution without IDs using mesh verification",
      icon: "🏕️",
    },
    {
      title: "Diaspora Remittance",
      description:
        "Elders receive funds when trusted members enter Bluetooth radius",
      icon: "🌍",
    },
  ];

  const revenueHighlights = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Pay as You Go",
      description:
        "Only pay for what you use - starting from $0.10 per vault activation",
      color: "text-vault-green",
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Enterprise APIs",
      description: "Full governance & AI agent access from $99/month",
      color: "text-vault-purple",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Partner Plans",
      description: "NGO & humanitarian pricing starting at $1,500/month",
      color: "text-vault-orange",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <VaultTapLogo />
            <div className="hidden lg:flex items-center space-x-6">
              <BluetoothStatus status={bluetoothStatus} peerCount={5} />
              <Link to="/pricing">
                <Button variant="outline">Enterprise</Button>
              </Link>
              <Link to="/revops">
                <Button variant="outline">RevOps</Button>
              </Link>
              <Link to="/dashboard">
                <Button className="bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90">
                  Open Wallet
                </Button>
              </Link>
            </div>
            <div className="lg:hidden flex items-center space-x-2">
              <Link to="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90"
                >
                  Wallet
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:hidden mt-4 flex items-center justify-center space-x-4">
            <BluetoothStatus status={bluetoothStatus} peerCount={5} />
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                Enterprise
              </Button>
            </Link>
            <Link to="/revops">
              <Button variant="outline" size="sm">
                RevOps
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold">
              Banking on{" "}
              <span className="bg-gradient-to-r from-vault-blue to-vault-purple bg-clip-text text-transparent">
                Bluetooth
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A peer-to-peer financial protocol that turns any smartphone into a
              bank node. No internet, no SIM, no central bank. Just Bluetooth +
              Trust + Ritual = Value.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90 px-8 py-6 text-lg"
              >
                Start Banking
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg border-primary/20"
            >
              Learn More
              <ChevronDown className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Core Features</h2>
          <p className="text-xl text-muted-foreground">
            Revolutionary financial sovereignty anywhere, anytime
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300 group"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${feature.color} to-${feature.color}/50 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Flexible Pricing</h2>
          <p className="text-xl text-muted-foreground">
            From personal vaults to enterprise APIs - pay for what you need
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {revenueHighlights.map((highlight, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border text-center"
            >
              <div className={`${highlight.color} mb-4 flex justify-center`}>
                {highlight.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
              <p className="text-muted-foreground">{highlight.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="border-primary/20 hover:border-primary"
            >
              View All Pricing Plans
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Real-World Applications</h2>
          <p className="text-xl text-muted-foreground">
            Empowering communities across the globe
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <span className="text-4xl">{useCase.icon}</span>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Security & Sovereignty</h2>
          <p className="text-xl text-muted-foreground">
            Built for resilience and privacy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-green to-vault-green/50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Military-Grade Encryption
            </h3>
            <p className="text-muted-foreground">
              X25519 key exchange + AES-256-GCM for all transactions
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-orange to-vault-orange/50 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Grid Independent</h3>
            <p className="text-muted-foreground">
              Works in war zones, disaster areas, and off-grid settlements
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-vault-purple to-vault-purple/50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Anonymous by Design</h3>
            <p className="text-muted-foreground">
              No accounts, phone numbers, or identity tracking
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-vault-blue/10 to-vault-purple/10 rounded-3xl p-12 border border-primary/20">
          <h2 className="text-4xl font-bold mb-4">
            Ready to become financially sovereign?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the mesh network and start banking without borders
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-vault-blue to-vault-purple hover:opacity-90 px-8 lg:px-12 py-6 text-lg"
              >
                Open Your Vault
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/revops">
              <Button
                size="lg"
                variant="outline"
                className="px-8 lg:px-12 py-6 text-lg border-primary/20"
              >
                RevOps Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <VaultTapLogo />
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-4">
                <Link
                  to="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Pricing
                </Link>
                <Link
                  to="/revenue"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Analytics
                </Link>
                <Link
                  to="/revops"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  RevOps
                </Link>
                <Link
                  to="/admin/login"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Admin
                </Link>
              </div>
              <span className="text-muted-foreground text-sm text-center">
                Building financial sovereignty for everyone, everywhere.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
