import { useState } from "react";
import { 
  Home, 
  Users, 
  UtensilsCrossed, 
  MessageSquare, 
  Megaphone, 
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  UserCog,
  FileText,
  CreditCard,
  Bell,
  UserCheck,
  BarChart3,
  Video,
  BookOpen,
  Calendar,
  HelpCircle,
  Handshake
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "레스토랑",
    icon: UtensilsCrossed,
    items: [
      {
        title: "레스토랑 관리",
        url: "/admin/restaurants",
        icon: UtensilsCrossed,
      },
    ],
  },
  {
    title: "광고업체관리",
    icon: UserCog,
    items: [
      {
        title: "입점신청",
        url: "/admin/restaurants/applications",
        icon: FileText,
      },
      {
        title: "업주 문의",
        url: "/admin/restaurants/owner-inquiries",
        icon: HelpCircle,
      },
      {
        title: "결제 내역",
        url: "/admin/restaurants/payments",
        icon: CreditCard,
      },
      {
        title: "업주 공지",
        url: "/admin/restaurants/owner-notices",
        icon: Bell,
      },
    ],
  },
  {
    title: "Users",
    icon: Users,
    items: [
      {
        title: "User Management",
        url: "/admin/users",
        icon: UserCheck,
      },
      {
        title: "By Tier",
        url: "/admin/users/tiers",
        icon: Users,
      },
      {
        title: "Analytics",
        url: "/admin/users/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Reviews",
    url: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    title: "Content",
    icon: Megaphone,
    items: [
      {
        title: "YouTube Videos",
        url: "/admin/content/youtube",
        icon: Video,
      },
      {
        title: "Blog Posts",
        url: "/admin/content/blog",
        icon: BookOpen,
      },
      {
        title: "Events",
        url: "/admin/content/events",
        icon: Calendar,
      },
      {
        title: "Announcements",
        url: "/admin/content/announcements",
        icon: Bell,
      },
    ],
  },
  {
    title: "Inquiries",
    icon: HelpCircle,
    items: [
      {
        title: "Customer Inquiries",
        url: "/admin/inquiries/customer",
        icon: MessageSquare,
      },
      {
        title: "Partnership Inquiries",
        url: "/admin/inquiries/partnership",
        icon: Handshake,
      },
    ],
  },
];

interface MenuItemComponentProps {
  item: MenuItem;
  level?: number;
}

function MenuItemComponent({ item, level = 0 }: MenuItemComponentProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    if (!item.items) return false;
    
    const checkActive = (items: MenuItem[]): boolean => {
      return items.some(subItem => {
        if (subItem.url && location.startsWith(subItem.url)) return true;
        if (subItem.items) return checkActive(subItem.items);
        return false;
      });
    };
    
    return checkActive(item.items);
  });

  if (item.items) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              data-testid={`button-menu-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon />
              <span>{item.title}</span>
              {isOpen ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <MenuItemComponent key={subItem.title} item={subItem} level={level + 1} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  if (level > 0) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          asChild
          isActive={location === item.url}
        >
          <Link href={item.url!} data-testid={`link-admin-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={location === item.url}>
        <Link href={item.url!} data-testid={`link-admin-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminSidebar() {
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <img
            src="/attached_assets/흰색배경png메인_1761805151469.png"
            alt="한식당"
            className="h-8"
          />
          <div>
            <h2 className="font-bold">한식당</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <MenuItemComponent key={item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {user?.firstName?.[0] || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="w-full mt-2" data-testid="button-back-to-main">
            <Home className="w-4 h-4 mr-2" />
            Main Site
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
