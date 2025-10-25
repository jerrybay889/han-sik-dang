import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TierStats {
  tier: string;
  count: number;
  users: any[];
}

export default function AdminUsersByTier() {
  const { data: tierStats, isLoading } = useQuery<TierStats[]>({
    queryKey: ["/api/admin/users/by-tier"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "gold": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "silver": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      default: return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users by Tier</h1>
        <p className="text-muted-foreground">View users organized by membership tier</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tierStats?.map((stat) => (
          <Card key={stat.tier} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getTierColor(stat.tier)}`}>
                <Users className="w-6 h-6" />
              </div>
              <Badge className={getTierColor(stat.tier)}>{stat.tier.toUpperCase()}</Badge>
            </div>
            <p className="text-3xl font-bold">{stat.count}</p>
            <p className="text-sm text-muted-foreground mt-1">members</p>
          </Card>
        ))}
      </div>

      {tierStats?.map((stat) => stat.count > 0 && (
        <Card key={`list-${stat.tier}`} className="p-6">
          <h2 className="text-xl font-semibold mb-4 capitalize">{stat.tier} Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stat.users.map((user) => (
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
      ))}
    </div>
  );
}
