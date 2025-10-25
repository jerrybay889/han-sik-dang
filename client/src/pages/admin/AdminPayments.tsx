import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Eye } from "lucide-react";
import type { Payment } from "@shared/schema";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "완료", variant: "default" },
  pending: { label: "대기중", variant: "secondary" },
  failed: { label: "실패", variant: "destructive" },
  refunded: { label: "환불", variant: "outline" },
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  subscription: "구독",
  advertising: "광고",
  premium: "프리미엄",
  other: "기타",
};

interface PaymentWithDetails extends Payment {
  restaurant?: {
    name: string;
    nameEn: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminPayments() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch payments
  const { data: payments = [], isLoading } = useQuery<PaymentWithDetails[]>({
    queryKey: ["/api/admin/payments"],
  });

  // Filter payments
  const filteredPayments = payments.filter(payment => 
    statusFilter === "all" || payment.status === statusFilter
  );

  const handleView = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const completedCount = payments.filter(p => p.status === "completed").length;
  const pendingCount = payments.filter(p => p.status === "pending").length;
  const failedCount = payments.filter(p => p.status === "failed").length;
  const totalAmount = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">결제 내역 관리</h1>
          <p className="text-muted-foreground">레스토랑 업주의 결제 내역을 관리합니다</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체 결제</div>
          <div className="text-2xl font-bold">{payments.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">완료</div>
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">대기중</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">총 매출</div>
          <div className="text-2xl font-bold">₩{totalAmount.toLocaleString()}</div>
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
            전체 ({payments.length})
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
            data-testid="filter-completed"
          >
            완료 ({completedCount})
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
            variant={statusFilter === "failed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("failed")}
            data-testid="filter-failed"
          >
            실패 ({failedCount})
          </Button>
        </div>
      </Card>

      {/* Payments List */}
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
                <TableHead>레스토랑</TableHead>
                <TableHead>결제 유형</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>결제 방법</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                    결제 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payment.createdAt), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>{payment.restaurant?.name || "-"}</div>
                      <div className="text-xs text-muted-foreground">
                        {payment.restaurant?.nameEn || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PAYMENT_TYPE_LABELS[payment.paymentType] || payment.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₩{payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.paymentMethod || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_LABELS[payment.status].variant}>
                        {STATUS_LABELS[payment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(payment)}
                        data-testid={`button-view-${payment.id}`}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>결제 상세</DialogTitle>
            <DialogDescription>
              결제 정보를 확인합니다.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">레스토랑</div>
                  <div className="font-medium">{selectedPayment.restaurant?.name || "-"}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPayment.restaurant?.nameEn || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">결제자</div>
                  <div className="font-medium">
                    {selectedPayment.user 
                      ? `${selectedPayment.user.firstName} ${selectedPayment.user.lastName}` 
                      : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPayment.user?.email || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">결제 유형</div>
                  <Badge variant="outline">
                    {PAYMENT_TYPE_LABELS[selectedPayment.paymentType] || selectedPayment.paymentType}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">결제 금액</div>
                  <div className="text-xl font-bold">
                    ₩{selectedPayment.amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">결제 방법</div>
                  <div className="font-medium">{selectedPayment.paymentMethod || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">상태</div>
                  <Badge variant={STATUS_LABELS[selectedPayment.status].variant}>
                    {STATUS_LABELS[selectedPayment.status].label}
                  </Badge>
                </div>
                {selectedPayment.transactionId && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">거래 ID</div>
                    <div className="font-mono text-sm">{selectedPayment.transactionId}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">생성일</div>
                  <div className="font-medium">
                    {format(new Date(selectedPayment.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </div>
                </div>
                {selectedPayment.paidAt && (
                  <div>
                    <div className="text-sm text-muted-foreground">결제 완료일</div>
                    <div className="font-medium">
                      {format(new Date(selectedPayment.paidAt), "yyyy-MM-dd HH:mm:ss")}
                    </div>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">메모</div>
                    <div className="text-sm whitespace-pre-wrap">{selectedPayment.notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
