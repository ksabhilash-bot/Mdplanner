import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users,
  Utensils,
  Plus,
  Settings,
  TrendingUp,
  Activity,
  UserPlus,
  ChefHat,
  BarChart3,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchRecentActivities,
  fetchSystemStatus,
} from "./dashboard.api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFoods: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    growthPercentage: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    api: "unknown",
    database: "unknown",
    serverLoad: "unknown",
    uptime: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStats(), loadActivities(), loadSystemStatus()]);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await fetchDashboardStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
      // Set default values if API fails
      setStats({
        totalUsers: 0,
        totalFoods: 0,
        activeUsers: 0,
        newUsersThisWeek: 0,
        growthPercentage: 0,
      });
    }
  };

  const loadActivities = async () => {
    try {
      const activities = await fetchRecentActivities();
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error loading activities:", error);
      setRecentActivities([]);
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await fetchSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      console.error("Error loading system status:", error);
      // Set default status if API fails
      setSystemStatus({
        api: "error",
        database: "error",
        serverLoad: "unknown",
        uptime: "0%",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "operational":
      case "connected":
      case "normal":
        return "outline";
      case "degraded":
      case "slow":
        return "secondary";
      case "error":
      case "disconnected":
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
      case "connected":
      case "normal":
        return "text-green-600 bg-green-50";
      case "degraded":
      case "slow":
        return "text-yellow-600 bg-yellow-50";
      case "error":
      case "disconnected":
      case "high":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const quickActions = [
    {
      title: "Add New Food",
      description: "Create a new food item",
      icon: Plus,
      action: () => navigate("/admin/addfood"),
      color: "bg-blue-500",
    },
    {
      title: "Manage Users",
      description: "View and manage all users",
      icon: Users,
      action: () => navigate("/admin/usermanagement"),
      color: "bg-green-500",
    },
    {
      title: "Manage Foods",
      description: "View and edit food items",
      icon: Utensils,
      action: () => navigate("/admin/managefoods"),
      color: "bg-orange-500",
    },
    {
      title: "Dashboard",
      description: "View admin dashboard",
      icon: BarChart3,
      action: () => navigate("/admin/admindashboard"),
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your nutrition app administration
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently using the app
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Foods</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFoods}</div>
            <p className="text-xs text-muted-foreground">
              Food items in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.growthPercentage}%</div>
            <p className="text-xs text-muted-foreground">Since last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Quickly access common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-start justify-start gap-2 text-left min-h-[100px]"
                  onClick={action.action}
                >
                  <div
                    className={`p-2 rounded-full ${action.color} text-white flex-shrink-0`}
                  >
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden w-full">
                    <div className="font-semibold text-sm sm:text-base truncate">
                      {action.title}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                No recent activities
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        activity.type === "user"
                          ? "bg-blue-100"
                          : "bg-orange-100"
                      }`}
                    >
                      {activity.type === "user" ? (
                        <UserPlus className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ChefHat className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={
                            activity.type === "user"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }
                        >
                          {activity.type === "user" ? "User" : "Food"}
                        </Badge>
                        <div className="font-medium text-sm sm:text-base truncate">
                          {activity.type === "user"
                            ? activity.user
                            : activity.item}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                        <span className="font-normal">{activity.action}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current status of your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge
                  variant={getStatusBadgeVariant(systemStatus.api)}
                  className={getStatusColor(systemStatus.api)}
                >
                  {systemStatus.api.charAt(0).toUpperCase() +
                    systemStatus.api.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge
                  variant={getStatusBadgeVariant(systemStatus.database)}
                  className={getStatusColor(systemStatus.database)}
                >
                  {systemStatus.database.charAt(0).toUpperCase() +
                    systemStatus.database.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Load</span>
                <Badge
                  variant={getStatusBadgeVariant(systemStatus.serverLoad)}
                  className={getStatusColor(systemStatus.serverLoad)}
                >
                  {systemStatus.serverLoad.charAt(0).toUpperCase() +
                    systemStatus.serverLoad.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <Badge variant="outline">{systemStatus.uptime}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>Helpful tips for administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="text-sm">
                  Regularly review user feedback to improve the app experience
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="text-sm">
                  Keep food database updated with accurate nutritional
                  information
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="text-sm">
                  Monitor user activity to identify popular features
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="text-sm">
                  Backup your database regularly to prevent data loss
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
