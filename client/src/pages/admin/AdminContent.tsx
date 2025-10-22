import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import type { Announcement, EventBanner } from "@shared/schema";

export default function AdminContent() {
  const { data: announcements, isLoading: loadingAnnouncements } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const { data: banners, isLoading: loadingBanners } = useQuery<EventBanner[]>({
    queryKey: ["/api/admin/event-banners"],
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete announcement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/event-banners/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete banner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/event-banners"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage announcements and event banners</p>
      </div>

      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="banners">Event Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-4">
          <Button data-testid="button-add-announcement">
            <Plus className="w-4 h-4 mr-2" />
            Add Announcement
          </Button>

          {loadingAnnouncements ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {announcements?.map((announcement) => (
                <Card key={announcement.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{announcement.titleEn}</p>
                      <p className="text-sm">{announcement.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                        data-testid={`button-delete-announcement-${announcement.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <Button data-testid="button-add-banner">
            <Plus className="w-4 h-4 mr-2" />
            Add Event Banner
          </Button>

          {loadingBanners ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners?.map((banner) => (
                <Card key={banner.id} className="overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{banner.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{banner.titleEn}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBannerMutation.mutate(banner.id)}
                          data-testid={`button-delete-banner-${banner.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
