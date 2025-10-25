import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";

export default function AdminYouTube() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">YouTube Content Management</h1>
        <p className="text-muted-foreground">Manage YouTube videos and content</p>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-6 rounded-full bg-muted mb-4">
            <Video className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">YouTube Management</h3>
          <p className="text-muted-foreground max-w-md">
            Video content management features will be available here.
            Manage YouTube videos linked to restaurants and general content.
          </p>
        </div>
      </Card>
    </div>
  );
}
