import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Pie, PieChart, Cell } from "recharts";

interface UserAnalytics {
  usersByCountry: { country: string; count: number }[];
  usersByRegion: { region: string; count: number }[];
  usersByTier: { tier: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminUsersAnalytics() {
  const { data: analytics, isLoading } = useQuery<UserAnalytics>({
    queryKey: ["/api/admin/users/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Analytics</h1>
        <p className="text-muted-foreground">Insights into user demographics and distribution</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Country */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users by Country</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.usersByCountry || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Users by Tier */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Users by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics?.usersByTier || []}
                dataKey="count"
                nameKey="tier"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics?.usersByTier.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Users by Region */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Users by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.usersByRegion || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
