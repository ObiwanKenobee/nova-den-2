import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Bitcoin,
  Smartphone,
  Building2,
  Globe,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  paymentDetails: Record<string, any>;
}

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  description: string;
  customerId: string;
  subscriptionId?: string;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  availableMethods?: PaymentMethod[];
  defaultMethod?: PaymentMethod;
}

interface SupportedMethod {
  method: PaymentMethod;
  available: boolean;
  currencies: string[];
  countries: string[];
}

const PAYMENT_METHOD_CONFIG = {
  stripe: {
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
    processingTime: "Instant",
    fees: "2.9% + $0.30",
    color: "text-blue-600",
  },
  paypal: {
    name: "PayPal",
    icon: Globe,
    description: "Pay with your PayPal account",
    processingTime: "Instant",
    fees: "2.9% + $0.30",
    color: "text-blue-500",
  },
  crypto_bitcoin: {
    name: "Bitcoin",
    icon: Bitcoin,
    description: "Pay with Bitcoin (BTC)",
    processingTime: "10-60 minutes",
    fees: "Network fees apply",
    color: "text-orange-500",
  },
  crypto_ethereum: {
    name: "Ethereum",
    icon: Bitcoin,
    description: "Pay with Ethereum (ETH)",
    processingTime: "2-10 minutes",
    fees: "Network fees apply",
    color: "text-purple-500",
  },
  crypto_usdc: {
    name: "USD Coin",
    icon: Bitcoin,
    description: "Pay with USDC stablecoin",
    processingTime: "2-10 minutes",
    fees: "Network fees apply",
    color: "text-green-500",
  },
  bank_transfer: {
    name: "Bank Transfer",
    icon: Building2,
    description: "Direct bank transfer (ACH)",
    processingTime: "1-3 business days",
    fees: "$0.50",
    color: "text-gray-600",
  },
  wire_transfer: {
    name: "Wire Transfer",
    icon: Building2,
    description: "International wire transfer",
    processingTime: "1-5 business days",
    fees: "$15-25",
    color: "text-gray-700",
  },
  mobile_money: {
    name: "Mobile Money",
    icon: Smartphone,
    description: "M-Pesa, Mobile Money",
    processingTime: "Instant",
    fees: "1-3%",
    color: "text-green-600",
  },
};

export default function PaymentGateway({
  amount,
  currency = "USD",
  description,
  customerId,
  subscriptionId,
  onSuccess,
  onError,
  onCancel,
  availableMethods,
  defaultMethod = "stripe",
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>(defaultMethod);
  const [supportedMethods, setSupportedMethods] = useState<SupportedMethod[]>(
    [],
  );
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("US");

  // Card form state
  const [cardForm, setCardForm] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  useEffect(() => {
    loadSupportedMethods();
  }, [country]);

  const loadSupportedMethods = async () => {
    try {
      const response = await fetch(
        `/api/payments/methods?country=${country}&currency=${currency}`,
      );
      const data = await response.json();

      if (data.success) {
        setSupportedMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          method: selectedMethod,
          customerId,
          subscriptionId,
          description,
          metadata: {
            paymentGateway: "vaulttap",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentIntent(data.paymentIntent);
        if (data.paymentIntent.status === "completed") {
          onSuccess(data.paymentIntent);
        } else if (data.paymentIntent.status === "failed") {
          onError(data.paymentIntent.paymentDetails.error || "Payment failed");
        }
      } else {
        onError(data.message || "Failed to create payment");
      }
    } catch (error) {
      console.error("Payment creation error:", error);
      onError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderPaymentForm = () => {
    if (!paymentIntent) return null;

    switch (selectedMethod) {
      case "stripe":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Card Number</label>
                <Input
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.number}
                  onChange={(e) =>
                    setCardForm((prev) => ({ ...prev, number: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Expiry</label>
                  <Input
                    placeholder="MM/YY"
                    value={cardForm.expiry}
                    onChange={(e) =>
                      setCardForm((prev) => ({
                        ...prev,
                        expiry: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CVC</label>
                  <Input
                    placeholder="123"
                    value={cardForm.cvc}
                    onChange={(e) =>
                      setCardForm((prev) => ({ ...prev, cvc: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Cardholder Name</label>
                <Input
                  placeholder="John Doe"
                  value={cardForm.name}
                  onChange={(e) =>
                    setCardForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </div>
            {paymentIntent.status === "completed" && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Payment successful! Transaction ID:{" "}
                  {paymentIntent.paymentDetails.stripePaymentIntentId}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "crypto_bitcoin":
      case "crypto_ethereum":
      case "crypto_usdc":
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <QrCode className="w-32 h-32 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Scan QR code or copy address below
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Address</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={paymentIntent.paymentDetails.address || ""}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopyToClipboard(
                        paymentIntent.paymentDetails.address,
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Amount:</span>
                  <div>
                    {paymentIntent.paymentDetails.amount}{" "}
                    {paymentIntent.paymentDetails.currency}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Confirmations:</span>
                  <div>
                    {paymentIntent.paymentDetails.confirmations || 0} /{" "}
                    {paymentIntent.paymentDetails.requiredConfirmations}
                  </div>
                </div>
              </div>

              {paymentIntent.status === "pending" && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Waiting for payment confirmation. This may take several
                    minutes.
                  </AlertDescription>
                </Alert>
              )}

              {paymentIntent.status === "completed" && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment confirmed! Your transaction has been processed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      case "bank_transfer":
      case "wire_transfer":
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-medium">Bank Account Details</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Bank Name:</span>
                  <span className="font-medium">
                    {paymentIntent.paymentDetails.bankName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Account Number:</span>
                  <span className="font-mono">
                    {paymentIntent.paymentDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Routing Number:</span>
                  <span className="font-mono">
                    {paymentIntent.paymentDetails.routingNumber}
                  </span>
                </div>
                {selectedMethod === "wire_transfer" && (
                  <div className="flex justify-between">
                    <span>SWIFT Code:</span>
                    <span className="font-mono">
                      {paymentIntent.paymentDetails.swiftCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-mono font-bold text-primary">
                    {paymentIntent.paymentDetails.reference}
                  </span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Please include the reference number{" "}
                <span className="font-mono font-bold">
                  {paymentIntent.paymentDetails.reference}
                </span>{" "}
                in your transfer to ensure proper processing.
              </AlertDescription>
            </Alert>

            {paymentIntent.status === "pending" && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Waiting for bank transfer. Processing typically takes 1-5
                  business days.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case "mobile_money":
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h4 className="font-medium">Mobile Money Payment</h4>
                <p className="text-sm text-muted-foreground">
                  Pay using your mobile money account
                </p>
              </div>

              {paymentIntent.status === "completed" && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment successful! Transaction ID:{" "}
                    {paymentIntent.paymentDetails.transactionId}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        );

      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Payment method configuration not available.
            </AlertDescription>
          </Alert>
        );
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    const config = PAYMENT_METHOD_CONFIG[method];
    const Icon = config.icon;
    return <Icon className={cn("w-5 h-5", config.color)} />;
  };

  const isMethodAvailable = (method: PaymentMethod) => {
    if (availableMethods && !availableMethods.includes(method)) return false;
    return supportedMethods.some((m) => m.method === method && m.available);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Payment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-lg">
            <span>Total Amount:</span>
            <span className="font-bold">{formatAmount(amount, currency)}</span>
          </div>
          <div className="text-sm text-muted-foreground">{description}</div>
          <Separator />
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span className="text-sm">Payment processed securely</span>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Method Selection */}
      {!paymentIntent && (
        <Card>
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedMethod}
              onValueChange={(value) =>
                setSelectedMethod(value as PaymentMethod)
              }
            >
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {Object.entries(PAYMENT_METHOD_CONFIG)
                  .filter(([method]) =>
                    isMethodAvailable(method as PaymentMethod),
                  )
                  .map(([method, config]) => (
                    <TabsTrigger
                      key={method}
                      value={method}
                      className="flex items-center space-x-2"
                    >
                      {getMethodIcon(method as PaymentMethod)}
                      <span className="hidden sm:inline">{config.name}</span>
                    </TabsTrigger>
                  ))}
              </TabsList>

              {Object.entries(PAYMENT_METHOD_CONFIG)
                .filter(([method]) =>
                  isMethodAvailable(method as PaymentMethod),
                )
                .map(([method, config]) => (
                  <TabsContent key={method} value={method} className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        {getMethodIcon(method as PaymentMethod)}
                        <div>
                          <h4 className="font-medium">{config.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Processing Time:</span>
                          <div>{config.processingTime}</div>
                        </div>
                        <div>
                          <span className="font-medium">Fees:</span>
                          <div>{config.fees}</div>
                        </div>
                      </div>

                      <Button
                        onClick={handleCreatePayment}
                        disabled={loading}
                        className="w-full"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Pay {formatAmount(amount, currency)}</>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {paymentIntent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Complete Payment</span>
              <Badge
                variant={
                  paymentIntent.status === "completed"
                    ? "default"
                    : paymentIntent.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {paymentIntent.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>{renderPaymentForm()}</CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <div className="text-xs text-muted-foreground">
          Powered by VaultTap Secure Payments
        </div>
      </div>
    </div>
  );
}
