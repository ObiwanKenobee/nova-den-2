import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Mail,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  email?: string;
  tier: "free" | "ritual_vault" | "diaspora_unlock" | "multi_party_vault";
  status: "active" | "inactive" | "suspended";
  created_at: Date;
  last_active: Date;
  revenue_generated: number;
  vault_count: number;
  transaction_count: number;
  location?: string;
  device_type: "ios" | "android" | "web";
  mesh_connections: number;
}

interface UserManagementProps {
  searchQuery: string;
}

export function UserManagement({ searchQuery }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, filterTier, filterStatus, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUsers: User[] = [
        {
          id: "user1",
          username: "amara_kenya",
          email: "amara@example.com",
          tier: "diaspora_unlock",
          status: "active",
          created_at: new Date("2024-01-15"),
          last_active: new Date(),
          revenue_generated: 142.5,
          vault_count: 3,
          transaction_count: 247,
          location: "Nairobi, Kenya",
          device_type: "android",
          mesh_connections: 8,
        },
        {
          id: "user2",
          username: "elderly_wisdom",
          tier: "ritual_vault",
          status: "active",
          created_at: new Date("2024-02-03"),
          last_active: new Date(Date.now() - 3600000),
          revenue_generated: 67.3,
          vault_count: 2,
          transaction_count: 89,
          location: "Lagos, Nigeria",
          device_type: "android",
          mesh_connections: 15,
        },
        {
          id: "user3",
          username: "refugee_aid_001",
          tier: "free",
          status: "active",
          created_at: new Date("2024-02-20"),
          last_active: new Date(Date.now() - 1800000),
          revenue_generated: 0,
          vault_count: 1,
          transaction_count: 12,
          location: "Dadaab, Kenya",
          device_type: "android",
          mesh_connections: 4,
        },
        {
          id: "user4",
          username: "farmer_collective",
          tier: "multi_party_vault",
          status: "active",
          created_at: new Date("2024-01-08"),
          last_active: new Date(Date.now() - 7200000),
          revenue_generated: 245.8,
          vault_count: 7,
          transaction_count: 1543,
          location: "Kumasi, Ghana",
          device_type: "android",
          mesh_connections: 23,
        },
        {
          id: "user5",
          username: "diaspora_sender",
          tier: "diaspora_unlock",
          status: "inactive",
          created_at: new Date("2023-12-15"),
          last_active: new Date(Date.now() - 86400000 * 7),
          revenue_generated: 89.2,
          vault_count: 2,
          transaction_count: 67,
          location: "New York, USA",
          device_type: "ios",
          mesh_connections: 0,
        },
        {
          id: "user6",
          username: "market_trader",
          tier: "ritual_vault",
          status: "active",
          created_at: new Date("2024-02-28"),
          last_active: new Date(Date.now() - 900000),
          revenue_generated: 23.4,
          vault_count: 1,
          transaction_count: 156,
          location: "Accra, Ghana",
          device_type: "android",
          mesh_connections: 6,
        },
      ];

      // Apply filters
      let filteredUsers = mockUsers;

      if (searchQuery) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.location?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (filterTier !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.tier === filterTier,
        );
      }

      if (filterStatus !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.status === filterStatus,
        );
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "multi_party_vault":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "diaspora_unlock":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "ritual_vault":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "multi_party_vault":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "diaspora_unlock":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "ritual_vault":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const totalRevenue = users.reduce((sum, u) => sum + u.revenue_generated, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {((activeUsers / totalUsers) * 100).toFixed(1)}% active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalRevenue / totalUsers)} per user
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Mesh Connections
                </p>
                <p className="text-2xl font-bold">
                  {(
                    users.reduce((sum, u) => sum + u.mesh_connections, 0) /
                    users.length
                  ).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by username, email, or location..."
                  className="pl-9"
                  value={searchQuery}
                  readOnly
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="ritual_vault">Ritual Vault</SelectItem>
                  <SelectItem value="diaspora_unlock">
                    Diaspora Unlock
                  </SelectItem>
                  <SelectItem value="multi_party_vault">
                    Multi-Party Vault
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 animate-pulse"
                >
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Mesh</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            {user.email && (
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {user.created_at.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn("text-xs", getTierColor(user.tier))}
                        >
                          <div className="flex items-center space-x-1">
                            {getTierIcon(user.tier)}
                            <span className="capitalize">
                              {user.tier.replace("_", " ")}
                            </span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn("text-xs", getStatusColor(user.status))}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{user.location || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(user.revenue_generated)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.transaction_count} transactions
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {formatTimeAgo(user.last_active)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.vault_count} vaults
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <Activity className="w-3 h-3 text-green-500" />
                          <span>{user.mesh_connections}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <UserCheck className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination would go here */}
      <div className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Showing {users.length} users
        </p>
      </div>
    </div>
  );
}
