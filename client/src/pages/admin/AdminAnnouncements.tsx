import { Card } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function AdminAnnouncements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Announcement Management</h1>
        <p className="text-muted-foreground">Manage public announcements</p>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-6 rounded-full bg-muted mb-4">
            <Megaphone className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Announcement Management</h3>
          <p className="text-muted-foreground max-w-md">
            Public announcement features are integrated with the existing system.
            Manage announcements through the main Content section.
          </p>
        </div>
      </Card>
    </div>
  );
}
