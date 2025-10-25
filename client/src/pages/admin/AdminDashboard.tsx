import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, UtensilsCrossed, MessageSquare, Megaphone, AlertCircle, FileText, HelpCircle, Handshake, Star, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Line, LineChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface DashboardStats {
  totalRestaurants: number;
  totalUsers: number;
  totalReviews: number;
  totalAnnouncements: number;
  recentUsers: any[];
  recentReviews: any[];
  restaurantsByCuisine: { cuisine: string; count: number }[];
  reviewsPerDay: { date: string; count: number }[];
}

interface PriorityTask {
  id: string;
  title: string;
  description: string;
  count: number;
  priority: "high" | "medium" | "low";
  link: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PriorityTasksData {
  pendingApplications: any[];
  pendingOwnerInquiries: any[];
  pendingCustomerInquiries: any[];
  pendingPartnershipInquiries: any[];
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
  });

  const { data: priorityTasksData, isLoading: tasksLoading } = useQuery<PriorityTasksData>({
    queryKey: ["/api/admin/dashboard/priority-tasks"],
  });

  // Transform priority tasks data into display format
  const priorityTasks: PriorityTask[] = priorityTasksData ? [
    {
      id: "restaurant-applications",
      title: "Restaurant Applications",
      description: "New partnership applications pending review",
      count: priorityTasksData.pendingApplications?.length || 0,
      priority: "high" as const,
      link: "/admin/restaurant-applications",
      icon: FileText,
    },
    {
      id: "owner-inquiries",
      title: "Owner Inquiries",
      description: "Restaurant owner support requests",
      count: priorityTasksData.pendingOwnerInquiries?.length || 0,
      priority: "medium" as const,
      link: "/admin/owner-inquiries",
      icon: HelpCircle,
    },
    {
      id: "customer-inquiries",
      title: "Customer Inquiries",
      description: "Customer support requests",
      count: priorityTasksData.pendingCustomerInquiries?.length || 0,
      priority: "medium" as const,
      link: "/admin/customer-inquiries",
      icon: MessageSquare,
    },
    {
      id: "partnership-inquiries",
      title: "Partnership Inquiries",
      description: "Business partnership requests",
      count: priorityTasksData.pendingPartnershipInquiries?.length || 0,
      priority: "low" as const,
      link: "/admin/partnership-inquiries",
      icon: Handshake,
    },
  ].filter(task => task.count > 0) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    }
  };

  const statCards = [
    {
      title: "Total Restaurants",
      value: stats?.totalRestaurants || 0,
      icon: UtensilsCrossed,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Reviews",
      value: stats?.totalReviews || 0,
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Announcements",
      value: stats?.totalAnnouncements || 0,
      icon: Megaphone,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform statistics</p>
      </div>

      {/* AI Priority Tasks Section */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Priority Tasks</h2>
            <p className="text-sm text-muted-foreground">
              Items requiring immediate attention
            </p>
          </div>
        </div>

        {tasksLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !priorityTasks || priorityTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No urgent tasks at the moment. Great job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityTasks.map((task) => (
              <Link key={task.id} href={task.link}>
                <Card className="p-4 hover-elevate active-elevate-2 cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)}`}>
                        <task.icon className="w-4 h-4" />
                      </div>
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                        {task.count}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`w-12 h-12 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurants by Cuisine */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Restaurants by Cuisine</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.restaurantsByCuisine || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cuisine" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Reviews Per Day */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Reviews (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.reviewsPerDay || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recentUsers.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {user.firstName?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
          <div className="space-y-3">
            {stats?.recentReviews.slice(0, 5).map((review) => (
              <div key={review.id} className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{review.userName}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm font-medium">{review.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
