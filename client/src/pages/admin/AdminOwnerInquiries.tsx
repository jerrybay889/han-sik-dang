import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Eye } from "lucide-react";
import type { OwnerInquiry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기중", variant: "secondary" },
  answered: { label: "답변완료", variant: "default" },
  closed: { label: "종료", variant: "outline" },
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "일반문의",
  technical: "기술지원",
  billing: "결제문의",
  other: "기타",
};

interface InquiryWithDetails extends OwnerInquiry {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  restaurant?: {
    name: string;
  };
}

export default function AdminOwnerInquiries() {
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");

  // Fetch inquiries
  const { data: inquiries = [], isLoading } = useQuery<InquiryWithDetails[]>({
    queryKey: ["/api/admin/owner-inquiries"],
  });

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inq => 
    statusFilter === "all" || inq.status === statusFilter
  );

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: async (data: { id: string; adminResponse: string; status: string }) => {
      return await apiRequest("POST", `/api/admin/owner-inquiries/${data.id}/respond`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/owner-inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/priority-tasks"] });
      setIsDialogOpen(false);
      setAdminResponse("");
      toast({
        title: "답변 완료",
        description: "문의에 답변이 등록되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "답변 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleView = (inquiry: InquiryWithDetails) => {
    setSelectedInquiry(inquiry);
    setAdminResponse(inquiry.adminResponse || "");
    setIsDialogOpen(true);
  };

  const handleRespond = () => {
    if (selectedInquiry && adminResponse.trim()) {
      respondMutation.mutate({
        id: selectedInquiry.id,
        adminResponse,
        status: "answered",
      });
    }
  };

  const pendingCount = inquiries.filter(i => i.status === "pending").length;
  const answeredCount = inquiries.filter(i => i.status === "answered").length;
  const closedCount = inquiries.filter(i => i.status === "closed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">업주 문의 관리</h1>
          <p className="text-muted-foreground">레스토랑 업주의 문의 사항을 관리합니다</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체</div>
          <div className="text-2xl font-bold">{inquiries.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">대기중</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">답변완료</div>
          <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">종료</div>
          <div className="text-2xl font-bold text-gray-600">{closedCount}</div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            data-testid="filter-all"
          >
            전체 ({inquiries.length})
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
            data-testid="filter-pending"
          >
            대기중 ({pendingCount})
          </Button>
          <Button
            variant={statusFilter === "answered" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("answered")}
            data-testid="filter-answered"
          >
            답변완료 ({answeredCount})
          </Button>
          <Button
            variant={statusFilter === "closed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("closed")}
            data-testid="filter-closed"
          >
            종료 ({closedCount})
          </Button>
        </div>
      </Card>

      {/* Inquiries List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>업주</TableHead>
                <TableHead>레스토랑</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                    문의 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(inquiry.createdAt), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CATEGORY_LABELS[inquiry.category] || inquiry.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {inquiry.title}
                    </TableCell>
                    <TableCell className="text-sm">
                      {inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inquiry.restaurant?.name || "일반문의"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_LABELS[inquiry.status].variant}>
                        {STATUS_LABELS[inquiry.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(inquiry)}
                        data-testid={`button-view-${inquiry.id}`}
                      >
                        {inquiry.status === "pending" ? (
                          <MessageSquare className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Detail & Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInquiry?.title}</DialogTitle>
            <DialogDescription>
              {CATEGORY_LABELS[selectedInquiry?.category || ""] || selectedInquiry?.category} | 
              {selectedInquiry && ` ${format(new Date(selectedInquiry.createdAt), "yyyy-MM-dd HH:mm")}`}
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">업주</div>
                  <div className="font-medium">
                    {selectedInquiry.user ? `${selectedInquiry.user.firstName} ${selectedInquiry.user.lastName}` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">레스토랑</div>
                  <div className="font-medium">
                    {selectedInquiry.restaurant?.name || "일반문의"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">문의 내용</div>
                <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                  {selectedInquiry.content}
                </div>
              </div>

              {selectedInquiry.status === "pending" ? (
                <div>
                  <label className="text-sm font-medium mb-2 block">관리자 답변</label>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="답변을 입력하세요..."
                    rows={5}
                    data-testid="textarea-response"
                  />
                </div>
              ) : (
                selectedInquiry.adminResponse && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">관리자 답변</div>
                    <div className="p-3 rounded-lg bg-primary/5 text-sm whitespace-pre-wrap">
                      {selectedInquiry.adminResponse}
                    </div>
                    {selectedInquiry.answeredAt && (
                      <div className="text-xs text-muted-foreground mt-2">
                        답변일: {format(new Date(selectedInquiry.answeredAt), "yyyy-MM-dd HH:mm")}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-close"
            >
              닫기
            </Button>
            {selectedInquiry?.status === "pending" && (
              <Button
                onClick={handleRespond}
                disabled={respondMutation.isPending || !adminResponse.trim()}
                data-testid="button-send-response"
              >
                {respondMutation.isPending ? "전송 중..." : "답변 전송"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
