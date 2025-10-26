import { useEffect, lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { useTranslation } from "react-i18next";

// User pages
const MainScreen = lazy(() => import("@/pages/MainScreen"));
const AIPage = lazy(() => import("@/pages/AIPage"));
const ContentPage = lazy(() => import("@/pages/ContentPage"));
const MyPage = lazy(() => import("@/pages/MyPage"));
const RestaurantDetailPage = lazy(() => import("@/pages/RestaurantDetailPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Admin pages (wrapped with AdminLayout)
import {
  AdminDashboard,
  AdminRestaurants,
  AdminRestaurantApplications,
  AdminOwnerInquiries,
  AdminPayments,
  AdminOwnerNotices,
  AdminUsers,
  AdminUsersByTier,
  AdminUsersAnalytics,
  AdminReviews,
  AdminContent,
  AdminYouTube,
  AdminBlog,
  AdminEvents,
  AdminAnnouncements,
  AdminCustomerInquiries,
  AdminPartnershipInquiries,
} from "@/pages/admin-pages";

function LoadingFallback() {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>
  );
}

function Router() {
  useAnalytics();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* User Routes */}
        <Route path="/" component={MainScreen} />
        <Route path="/ai" component={AIPage} />
        <Route path="/chat" component={AIPage} />
        <Route path="/content" component={ContentPage} />
        <Route path="/my" component={MyPage} />
        <Route path="/restaurant/:id" component={RestaurantDetailPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/login" component={AuthPage} />
        
        {/* Admin Routes - specific routes first */}
        <Route path="/admin/restaurants/applications" component={AdminRestaurantApplications} />
        <Route path="/admin/restaurants/owner-inquiries" component={AdminOwnerInquiries} />
        <Route path="/admin/restaurants/payments" component={AdminPayments} />
        <Route path="/admin/restaurants/owner-notices" component={AdminOwnerNotices} />
        <Route path="/admin/restaurants" component={AdminRestaurants} />
        
        <Route path="/admin/users/tiers" component={AdminUsersByTier} />
        <Route path="/admin/users/analytics" component={AdminUsersAnalytics} />
        <Route path="/admin/users" component={AdminUsers} />
        
        <Route path="/admin/reviews" component={AdminReviews} />
        
        <Route path="/admin/content/youtube" component={AdminYouTube} />
        <Route path="/admin/content/blog" component={AdminBlog} />
        <Route path="/admin/content/events" component={AdminEvents} />
        <Route path="/admin/content/announcements" component={AdminAnnouncements} />
        <Route path="/admin/content" component={AdminContent} />
        
        <Route path="/admin/inquiries/customer" component={AdminCustomerInquiries} />
        <Route path="/admin/inquiries/partnership" component={AdminPartnershipInquiries} />
        
        <Route path="/admin" component={AdminDashboard} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
