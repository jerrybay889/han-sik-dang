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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pin, Eye, Trash2 } from "lucide-react";
import type { OwnerNotice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "공지사항",
  update: "업데이트",
  maintenance: "시스템 점검",
  promotion: "프로모션",
};

export default function AdminOwnerNotices() {
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<OwnerNotice | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("announcement");
  const [isPinned, setIsPinned] = useState(false);

  // Fetch notices
  const { data: notices = [], isLoading } = useQuery<OwnerNotice[]>({
    queryKey: ["/api/admin/owner-notices"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; isPinned: number }) => {
      return await apiRequest("POST", "/api/admin/owner-notices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/owner-notices"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "공지 생성 완료",
        description: "새 공지사항이 등록되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "공지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("announcement");
    setIsPinned(false);
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category,
      isPinned: isPinned ? 1 : 0,
    });
  };

  const handleView = (notice: OwnerNotice) => {
    setSelectedNotice(notice);
    setIsViewDialogOpen(true);
  };

  const pinnedNotices = notices.filter(n => n.isPinned === 1);
  const regularNotices = notices.filter(n => n.isPinned !== 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">업주 공지 관리</h1>
          <p className="text-muted-foreground">레스토랑 업주를 위한 공지사항을 관리합니다</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-notice">
              <Plus className="w-4 h-4 mr-2" />
              새 공지 작성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 공지 작성</DialogTitle>
              <DialogDescription>
                레스토랑 업주에게 전달할 공지사항을 작성하세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">제목</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  data-testid="input-notice-title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">카테고리</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">공지사항</SelectItem>
                    <SelectItem value="update">업데이트</SelectItem>
                    <SelectItem value="maintenance">시스템 점검</SelectItem>
                    <SelectItem value="promotion">프로모션</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">내용</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지 내용을 입력하세요"
                  rows={8}
                  data-testid="textarea-notice-content"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pin-notice"
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(checked === true)}
                  data-testid="checkbox-pin"
                />
                <label
                  htmlFor="pin-notice"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  상단 고정
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                data-testid="button-cancel"
              >
                취소
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !title.trim() || !content.trim()}
                data-testid="button-submit-notice"
              >
                {createMutation.isPending ? "작성 중..." : "공지 등록"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체 공지</div>
          <div className="text-2xl font-bold">{notices.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">고정 공지</div>
          <div className="text-2xl font-bold text-blue-600">{pinnedNotices.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">일반 공지</div>
          <div className="text-2xl font-bold">{regularNotices.length}</div>
        </Card>
      </div>

      {/* Notices List */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>등록된 공지사항이 없습니다.</p>
            <p className="text-sm mt-2">새 공지를 작성하여 업주들에게 알려주세요.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>제목</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>작성일</TableHead>
                <TableHead>게시일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    {notice.isPinned === 1 && (
                      <Pin className="w-4 h-4 text-primary" data-testid={`icon-pinned-${notice.id}`} />
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-md truncate">
                    {notice.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[notice.category] || notice.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(notice.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {notice.publishedAt 
                      ? format(new Date(notice.publishedAt), "yyyy-MM-dd")
                      : <Badge variant="secondary">미발행</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(notice)}
                      data-testid={`button-view-${notice.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotice?.isPinned === 1 && <Pin className="w-5 h-5 text-primary" />}
              {selectedNotice?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedNotice && CATEGORY_LABELS[selectedNotice.category]} | 
              {selectedNotice && ` ${format(new Date(selectedNotice.createdAt), "yyyy-MM-dd HH:mm")}`}
            </DialogDescription>
          </DialogHeader>

          {selectedNotice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">카테고리</div>
                  <Badge variant="outline">
                    {CATEGORY_LABELS[selectedNotice.category] || selectedNotice.category}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">고정 여부</div>
                  <div className="font-medium">
                    {selectedNotice.isPinned === 1 ? "고정됨" : "일반"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">작성일</div>
                  <div className="font-medium">
                    {format(new Date(selectedNotice.createdAt), "yyyy-MM-dd HH:mm")}
                  </div>
                </div>
                {selectedNotice.publishedAt && (
                  <div>
                    <div className="text-sm text-muted-foreground">게시일</div>
                    <div className="font-medium">
                      {format(new Date(selectedNotice.publishedAt), "yyyy-MM-dd HH:mm")}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">내용</div>
                <div className="p-4 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              data-testid="button-close-view"
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
