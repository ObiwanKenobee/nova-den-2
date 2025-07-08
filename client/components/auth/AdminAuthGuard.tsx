import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Shield, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Admin | null;
  error: string | null;
}

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
  fallbackPath?: string;
}

const useAdminAuth = () => {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isLoading: true,
    admin: null,
    error: null,
  });

  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/admin/verify", {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.valid) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          admin: data.admin,
          error: null,
        });
      } else {
        // Try to refresh token
        const refreshResponse = await fetch("/api/admin/refresh", {
          method: "POST",
          credentials: "include",
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok && refreshData.success) {
          localStorage.setItem("admin_token", refreshData.token);
          // Retry verification
          await checkAuth();
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            admin: null,
            error: data.message || "Authentication failed",
          });
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        admin: null,
        error: "Network error",
      });
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("admin_token");
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        admin: null,
        error: null,
      });
    }
  };

  useEffect(() => {
    checkAuth();

    // Set up token refresh interval
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return { ...authState, checkAuth, logout };
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          <Shield className="w-12 h-12 text-primary" />
          <Loader2 className="w-6 h-6 absolute -top-1 -right-1 animate-spin text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Verifying Access</h3>
          <p className="text-sm text-muted-foreground">
            Checking admin credentials...
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ErrorScreen: React.FC<{
  error: string;
  onRetry: () => void;
  onLogin: () => void;
}> = ({ error, onRetry, onLogin }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <span>Access Denied</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-2">
          <Button onClick={onLogin} className="w-full">
            Go to Login
          </Button>
          <Button onClick={onRetry} variant="outline" className="w-full">
            Retry Verification
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            If you believe this is an error, contact your system administrator.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const InsufficientPermissionsScreen: React.FC<{
  requiredPermissions?: string[];
  requiredRole?: string;
  userRole: string;
  userPermissions: string[];
}> = ({ requiredPermissions, requiredRole, userRole, userPermissions }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-600">
          <Shield className="w-5 h-5" />
          <span>Insufficient Permissions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50 text-orange-800">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have the required permissions to access this area.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Your Role:</span> {userRole}
          </div>

          {requiredRole && (
            <div>
              <span className="font-medium">Required Role:</span> {requiredRole}
            </div>
          )}

          {requiredPermissions && requiredPermissions.length > 0 && (
            <div>
              <span className="font-medium">Required Permissions:</span>
              <ul className="mt-1 ml-4 list-disc list-inside text-xs">
                {requiredPermissions.map((permission) => (
                  <li
                    key={permission}
                    className={
                      userPermissions.includes(permission)
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {permission}
                    {userPermissions.includes(permission) ? " ✓" : " ✗"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          onClick={() => (window.location.href = "/admin/login")}
          variant="outline"
          className="w-full"
        >
          Back to Login
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>Contact your administrator to request additional permissions.</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  fallbackPath = "/admin/login",
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, admin, error, checkAuth, logout } =
    useAdminAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an authentication error
  if (error && !isAuthenticated) {
    return (
      <ErrorScreen
        error={error}
        onRetry={checkAuth}
        onLogin={() => (window.location.href = fallbackPath)}
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !admin) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && admin.role !== requiredRole) {
    return (
      <InsufficientPermissionsScreen
        requiredRole={requiredRole}
        userRole={admin.role}
        userPermissions={admin.permissions}
      />
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      admin.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return (
        <InsufficientPermissionsScreen
          requiredPermissions={requiredPermissions}
          userRole={admin.role}
          userPermissions={admin.permissions}
        />
      );
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

// Hook for using admin auth in components
export const useAdminAuthContext = () => {
  return useAdminAuth();
};

// Higher-order component for admin authentication
export const withAdminAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AdminAuthGuardProps, "children">,
) => {
  return (props: P) => (
    <AdminAuthGuard {...options}>
      <Component {...props} />
    </AdminAuthGuard>
  );
};

// Specific guards for common use cases
export const RequireRevOpsAccess: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AdminAuthGuard requiredPermissions={["revops:view"]}>
    {children}
  </AdminAuthGuard>
);

export const RequireUserManagement: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AdminAuthGuard requiredPermissions={["users:manage"]}>
    {children}
  </AdminAuthGuard>
);

export const RequireBillingAccess: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AdminAuthGuard requiredPermissions={["billing:manage"]}>
    {children}
  </AdminAuthGuard>
);

export const RequireSuperAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <AdminAuthGuard requiredRole="super_admin">{children}</AdminAuthGuard>;

export default AdminAuthGuard;
