import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RestaurantApplication } from "@shared/schema";

export default function AdminRestaurantApplications() {
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<RestaurantApplication | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { data: applications, isLoading } = useQuery<RestaurantApplication[]>({
    queryKey: ["/api/admin/restaurant-applications"],
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note: string }) => {
      return await apiRequest("POST", `/api/admin/restaurant-applications/${id}/process`, { status, adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/restaurant-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/priority-tasks"] });
      toast({
        title: "Success",
        description: "Application processed successfully",
      });
      setSelectedApplication(null);
      setAdminNote("");
      setAction(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process application",
        variant: "destructive",
      });
    },
  });

  const handleProcess = () => {
    if (!selectedApplication || !action) return;
    processMutation.mutate({
      id: selectedApplication.id,
      status: action === "approve" ? "approved" : "rejected",
      note: adminNote,
    });
  };

  const openDialog = (application: RestaurantApplication, actionType: "approve" | "reject") => {
    setSelectedApplication(application);
    setAction(actionType);
    setAdminNote(application.adminNote || "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingApplications = applications?.filter(app => app.status === "pending") || [];
  const processedApplications = applications?.filter(app => app.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Restaurant Applications</h1>
        <p className="text-muted-foreground">Review and process restaurant owner applications</p>
      </div>

      {/* Pending Applications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Applications</h2>
          <Badge variant="secondary">{pendingApplications.length}</Badge>
        </div>
        
        {pendingApplications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending applications</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Business Number</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.restaurantName}</p>
                      <p className="text-sm text-muted-foreground">{app.restaurantNameEn}</p>
                    </div>
                  </TableCell>
                  <TableCell>{app.businessNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{app.phone}</p>
                      <p className="text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(app, "approve")}
                        data-testid={`button-approve-${app.id}`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(app, "reject")}
                        data-testid={`button-reject-${app.id}`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Processed Applications */}
      {processedApplications.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Processed Applications</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead>Admin Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.restaurantName}</p>
                      <p className="text-sm text-muted-foreground">{app.restaurantNameEn}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.status === "approved" ? "default" : "destructive"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.processedAt ? new Date(app.processedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{app.adminNote || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Process Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => {
        setSelectedApplication(null);
        setAction(null);
        setAdminNote("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              Restaurant: {selectedApplication?.restaurantName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Business Details</p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Business Number: {selectedApplication?.businessNumber}</p>
                <p>Address: {selectedApplication?.address}</p>
                <p>Phone: {selectedApplication?.phone}</p>
                <p>Email: {selectedApplication?.email}</p>
              </div>
            </div>
            
            {selectedApplication?.description && (
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Admin Note</label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this decision..."
                rows={3}
                data-testid="textarea-admin-note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedApplication(null);
              setAction(null);
              setAdminNote("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={processMutation.isPending}
              variant={action === "approve" ? "default" : "destructive"}
              data-testid="button-confirm-process"
            >
              {processMutation.isPending ? "Processing..." : `Confirm ${action === "approve" ? "Approval" : "Rejection"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
