import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { useState } from "react";
import { Check, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PartnershipInquiry } from "@shared/schema";

export default function AdminPartnershipInquiries() {
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<PartnershipInquiry | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [action, setAction] = useState<"accept" | "reject" | null>(null);

  const { data: inquiries, isLoading } = useQuery<PartnershipInquiry[]>({
    queryKey: ["/api/admin/partnership-inquiries"],
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note: string }) => {
      return await apiRequest("POST", `/api/admin/partnership-inquiries/${id}/process`, { status, adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partnership-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/priority-tasks"] });
      toast({
        title: "Success",
        description: "Partnership inquiry processed successfully",
      });
      setSelectedInquiry(null);
      setAdminNote("");
      setAction(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process partnership inquiry",
        variant: "destructive",
      });
    },
  });

  const handleProcess = () => {
    if (!selectedInquiry || !action) return;
    processMutation.mutate({
      id: selectedInquiry.id,
      status: action === "accept" ? "accepted" : "rejected",
      note: adminNote,
    });
  };

  const openDialog = (inquiry: PartnershipInquiry, actionType: "accept" | "reject") => {
    setSelectedInquiry(inquiry);
    setAction(actionType);
    setAdminNote(inquiry.adminNote || "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingInquiries = inquiries?.filter(inq => inq.status === "pending") || [];
  const processedInquiries = inquiries?.filter(inq => inq.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partnership Inquiries</h1>
        <p className="text-muted-foreground">Review and manage partnership proposals</p>
      </div>

      {/* Pending Inquiries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Inquiries</h2>
          <Badge variant="secondary">{pendingInquiries.length}</Badge>
        </div>
        
        {pendingInquiries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending partnership inquiries</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{inquiry.companyName}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.contactName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{inquiry.partnershipType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{inquiry.phone}</p>
                      <p className="text-muted-foreground">{inquiry.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(inquiry, "accept")}
                        data-testid={`button-accept-${inquiry.id}`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(inquiry, "reject")}
                        data-testid={`button-reject-${inquiry.id}`}
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

      {/* Processed Inquiries */}
      {processedInquiries.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Processed Inquiries</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.companyName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inquiry.partnershipType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={inquiry.status === "accepted" ? "default" : "destructive"}>
                      {inquiry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inquiry.processedAt ? new Date(inquiry.processedAt).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Process Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => {
        setSelectedInquiry(null);
        setAction(null);
        setAdminNote("");
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {action === "accept" ? "Accept" : "Reject"} Partnership
            </DialogTitle>
            <DialogDescription>
              Company: {selectedInquiry?.companyName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Contact Details</p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Contact Person: {selectedInquiry?.contactName}</p>
                <p>Email: {selectedInquiry?.email}</p>
                <p>Phone: {selectedInquiry?.phone}</p>
                <p>Type: {selectedInquiry?.partnershipType}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Proposal Description</p>
              <div className="p-3 rounded-lg bg-muted text-sm">
                {selectedInquiry?.description}
              </div>
            </div>

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
              setSelectedInquiry(null);
              setAction(null);
              setAdminNote("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              disabled={processMutation.isPending}
              variant={action === "accept" ? "default" : "destructive"}
              data-testid="button-confirm-process"
            >
              {processMutation.isPending ? "Processing..." : `Confirm ${action === "accept" ? "Acceptance" : "Rejection"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
