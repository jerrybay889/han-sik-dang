import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function AdminEvents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Management</h1>
        <p className="text-muted-foreground">Manage platform events and promotions</p>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-6 rounded-full bg-muted mb-4">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Event Management</h3>
          <p className="text-muted-foreground max-w-md">
            Event management features are integrated with the existing Event Banners system.
            Create and manage events through the Content section.
          </p>
        </div>
      </Card>
    </div>
  );
}
