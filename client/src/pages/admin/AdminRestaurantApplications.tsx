import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Check, X, Eye } from "lucide-react";
import type { RestaurantApplication } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기중", variant: "secondary" },
  approved: { label: "승인", variant: "default" },
  rejected: { label: "거부", variant: "destructive" },
};

interface ApplicationWithUser extends RestaurantApplication {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminRestaurantApplications() {
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithUser | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<"approved" | "rejected">("approved");
  const [adminNote, setAdminNote] = useState("");

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery<ApplicationWithUser[]>({
    queryKey: ["/api/admin/restaurant-applications"],
  });

  // Filter applications
  const filteredApplications = applications.filter(app => 
    statusFilter === "all" || app.status === statusFilter
  );

  // Process mutation
  const processMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; adminNote: string }) => {
      return await apiRequest("POST", `/api/admin/restaurant-applications/${data.id}/process`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/restaurant-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard/priority-tasks"] });
      setIsProcessDialogOpen(false);
      setIsDetailDialogOpen(false);
      setAdminNote("");
      toast({
        title: "처리 완료",
        description: "입점신청이 처리되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "입점신청 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (application: ApplicationWithUser) => {
    setSelectedApplication(application);
    setAdminNote(application.adminNote || "");
    setIsDetailDialogOpen(true);
  };

  const handleProcess = (action: "approved" | "rejected") => {
    setProcessAction(action);
    setIsProcessDialogOpen(true);
  };

  const handleConfirmProcess = () => {
    if (selectedApplication) {
      processMutation.mutate({
        id: selectedApplication.id,
        status: processAction,
        adminNote,
      });
    }
  };

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;
  const rejectedCount = applications.filter(a => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">입점신청 관리</h1>
          <p className="text-muted-foreground">레스토랑 입점 신청을 검토하고 처리합니다</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체</div>
          <div className="text-2xl font-bold">{applications.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">대기중</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">승인</div>
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">거부</div>
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
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
            전체 ({applications.length})
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
            variant={statusFilter === "approved" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
            data-testid="filter-approved"
          >
            승인 ({approvedCount})
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
            data-testid="filter-rejected"
          >
            거부 ({rejectedCount})
          </Button>
        </div>
      </Card>

      {/* Applications List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신청일</TableHead>
                <TableHead>레스토랑명</TableHead>
                <TableHead>신청자</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                    신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(app.createdAt), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{app.restaurantName}</div>
                      <div className="text-xs text-muted-foreground">{app.restaurantNameEn}</div>
                    </TableCell>
                    <TableCell>
                      {app.user ? `${app.user.firstName} ${app.user.lastName}` : "-"}
                    </TableCell>
                    <TableCell>{app.businessNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">{app.phone}</div>
                      <div className="text-xs text-muted-foreground">{app.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_LABELS[app.status].variant}>
                        {STATUS_LABELS[app.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(app)}
                        data-testid={`button-view-${app.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>입점신청 상세</DialogTitle>
            <DialogDescription>
              신청 정보를 확인하고 처리하세요.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">레스토랑명 (한글)</div>
                  <div className="font-medium">{selectedApplication.restaurantName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">레스토랑명 (영문)</div>
                  <div className="font-medium">{selectedApplication.restaurantNameEn}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">사업자번호</div>
                  <div className="font-medium">{selectedApplication.businessNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">전화번호</div>
                  <div className="font-medium">{selectedApplication.phone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">이메일</div>
                  <div className="font-medium">{selectedApplication.email}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">주소</div>
                  <div className="font-medium">{selectedApplication.address}</div>
                </div>
                {selectedApplication.description && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">설명</div>
                    <div className="font-medium whitespace-pre-wrap">{selectedApplication.description}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">신청일</div>
                  <div className="font-medium">
                    {format(new Date(selectedApplication.createdAt), "yyyy-MM-dd HH:mm")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">상태</div>
                  <Badge variant={STATUS_LABELS[selectedApplication.status].variant}>
                    {STATUS_LABELS[selectedApplication.status].label}
                  </Badge>
                </div>
                {selectedApplication.processedAt && (
                  <div>
                    <div className="text-sm text-muted-foreground">처리일</div>
                    <div className="font-medium">
                      {format(new Date(selectedApplication.processedAt), "yyyy-MM-dd HH:mm")}
                    </div>
                  </div>
                )}
                {selectedApplication.adminNote && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">관리자 메모</div>
                    <div className="font-medium whitespace-pre-wrap">{selectedApplication.adminNote}</div>
                  </div>
                )}
              </div>

              {selectedApplication.status === "pending" && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => handleProcess("rejected")}
                    data-testid="button-reject"
                  >
                    <X className="w-4 h-4 mr-2" />
                    거부
                  </Button>
                  <Button
                    onClick={() => handleProcess("approved")}
                    data-testid="button-approve"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    승인
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === "approved" ? "신청 승인" : "신청 거부"}
            </DialogTitle>
            <DialogDescription>
              관리자 메모를 입력하세요. (선택사항)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="관리자 메모를 입력하세요..."
              rows={4}
              data-testid="input-admin-note"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProcessDialogOpen(false)}
              data-testid="button-cancel"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmProcess}
              disabled={processMutation.isPending}
              variant={processAction === "rejected" ? "destructive" : "default"}
              data-testid="button-confirm"
            >
              {processMutation.isPending ? "처리 중..." : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
