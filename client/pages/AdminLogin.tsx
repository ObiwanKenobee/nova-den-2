import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VaultTapLogo } from "@/components/VaultTapLogo";
import { cn } from "@/lib/utils";

interface LoginForm {
  email: string;
  password: string;
  twoFactorCode: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  requiresTwoFactor?: boolean;
  admin?: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  token?: string;
  expiresAt?: string;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    twoFactorCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/verify", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.valid) {
          // Already authenticated, redirect to RevOps
          const from = (location.state as any)?.from?.pathname || "/revops";
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      // Not authenticated, stay on login page
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: any = {
        email: form.email,
        password: form.password,
      };

      if (requiresTwoFactor && form.twoFactorCode) {
        payload.twoFactorCode = form.twoFactorCode;
      }

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        localStorage.setItem("admin_token", data.token || "");

        // Redirect after short delay
        setTimeout(() => {
          const from = (location.state as any)?.from?.pathname || "/revops";
          navigate(from, { replace: true });
        }, 1000);
      } else if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setSuccess("Please enter your two-factor authentication code");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setForm({
      email: "admin@vaulttap.com",
      password: "VaultTap2024!",
      twoFactorCode: "",
    });
    setError(null);
    setSuccess("Demo credentials loaded. Click 'Sign In' to continue.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <VaultTapLogo className="h-12 w-auto" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground">
              Sign in to VaultTap Revenue Operations
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Demo Credentials Helper */}
            <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border">
              <div className="text-sm space-y-2">
                <p className="font-medium text-muted-foreground">
                  Demo Credentials:
                </p>
                <div className="text-xs font-mono space-y-1">
                  <div>Email: admin@vaulttap.com</div>
                  <div>Password: VaultTap2024!</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDemoLogin}
                  className="w-full text-xs"
                >
                  Load Demo Credentials
                </Button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@vaulttap.com"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Code Field */}
              {requiresTwoFactor && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Two-Factor Code</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={form.twoFactorCode}
                      onChange={(e) =>
                        handleInputChange("twoFactorCode", e.target.value)
                      }
                      className="pl-10"
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Demo codes: 123456 or 000000
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : requiresTwoFactor ? (
                  "Verify & Sign In"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Secure Access</p>
                  <p>
                    This is a protected area. All access attempts are logged and
                    monitored.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 VaultTap. All rights reserved.</p>
          <p>Revenue Operations Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
}
