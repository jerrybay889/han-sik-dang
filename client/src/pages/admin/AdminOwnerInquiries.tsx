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
import { MessageSquare } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OwnerInquiry } from "@shared/schema";

export default function AdminOwnerInquiries() {
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<OwnerInquiry | null>(null);
  const [response, setResponse] = useState("");

  const { data: inquiries, isLoading } = useQuery<OwnerInquiry[]>({
    queryKey: ["/api/admin/owner-inquiries"],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: string; response: string }) => {
      return await apiRequest("POST", `/api/admin/owner-inquiries/${id}/respond`, { adminResponse: response, status: "answered" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/owner-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/priority-tasks"] });
      toast({
        title: "Success",
        description: "Response sent successfully",
      });
      setSelectedInquiry(null);
      setResponse("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    },
  });

  const handleRespond = () => {
    if (!selectedInquiry || !response.trim()) return;
    respondMutation.mutate({ id: selectedInquiry.id, response });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingInquiries = inquiries?.filter(inq => inq.status === "pending") || [];
  const answeredInquiries = inquiries?.filter(inq => inq.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Owner Inquiries</h1>
        <p className="text-muted-foreground">Manage restaurant owner questions and support requests</p>
      </div>

      {/* Pending Inquiries */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Inquiries</h2>
          <Badge variant="secondary">{pendingInquiries.length}</Badge>
        </div>
        
        {pendingInquiries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending inquiries</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    <Badge variant="outline">{inquiry.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{inquiry.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inquiry.restaurantId || "General"}
                  </TableCell>
                  <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setResponse(inquiry.adminResponse || "");
                      }}
                      data-testid={`button-respond-${inquiry.id}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Respond
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Answered Inquiries */}
      {answeredInquiries.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Answered Inquiries</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Answered Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {answeredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.title}</TableCell>
                  <TableCell>
                    <Badge>{inquiry.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {inquiry.answeredAt ? new Date(inquiry.answeredAt).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Response Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => {
        setSelectedInquiry(null);
        setResponse("");
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInquiry?.title}</DialogTitle>
            <DialogDescription>
              Category: {selectedInquiry?.category} | Submitted: {selectedInquiry && new Date(selectedInquiry.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Inquiry Content</p>
              <div className="p-3 rounded-lg bg-muted text-sm">
                {selectedInquiry?.content}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Admin Response</label>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                rows={5}
                data-testid="textarea-response"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedInquiry(null);
              setResponse("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleRespond}
              disabled={respondMutation.isPending || !response.trim()}
              data-testid="button-send-response"
            >
              {respondMutation.isPending ? "Sending..." : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
