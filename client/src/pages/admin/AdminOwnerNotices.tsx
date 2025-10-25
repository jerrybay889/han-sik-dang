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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, Pin } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OwnerNotice } from "@shared/schema";

export default function AdminOwnerNotices() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("announcement");
  const [isPinned, setIsPinned] = useState(false);

  const { data: notices, isLoading } = useQuery<OwnerNotice[]>({
    queryKey: ["/api/admin/owner-notices"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; isPinned: number }) => {
      return await apiRequest("POST", "/api/admin/owner-notices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/owner-notices"] });
      toast({
        title: "Success",
        description: "Notice created successfully",
      });
      setIsDialogOpen(false);
      setTitle("");
      setContent("");
      setCategory("announcement");
      setIsPinned(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create notice",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      category,
      isPinned: isPinned ? 1 : 0,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Owner Notices</h1>
          <p className="text-muted-foreground">Manage announcements for restaurant owners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-notice">
              <Plus className="w-4 h-4 mr-2" />
              New Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notice title"
                  data-testid="input-notice-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Notice content"
                  rows={5}
                  data-testid="textarea-notice-content"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  id="pin-notice"
                  data-testid="checkbox-pin"
                />
                <label htmlFor="pin-notice" className="text-sm">Pin this notice</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !title.trim() || !content.trim()}
                data-testid="button-submit-notice"
              >
                {createMutation.isPending ? "Creating..." : "Create Notice"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {!notices || notices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No notices yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Published</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {notice.isPinned === 1 && <Pin className="w-4 h-4 text-primary" />}
                      <span className="font-medium">{notice.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{notice.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString() : "Draft"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
