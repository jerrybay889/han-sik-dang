import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Users, UtensilsCrossed, MessageSquare, Megaphone } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Line, LineChart } from "recharts";

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

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
