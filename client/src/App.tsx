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

const MainScreen = lazy(() => import("@/pages/MainScreen"));
const AIPage = lazy(() => import("@/pages/AIPage"));
const ContentPage = lazy(() => import("@/pages/ContentPage"));
const MyPage = lazy(() => import("@/pages/MyPage"));
const RestaurantDetailPage = lazy(() => import("@/pages/RestaurantDetailPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminRestaurants = lazy(() => import("@/pages/admin/AdminRestaurants"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const NotFound = lazy(() => import("@/pages/not-found"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  useAnalytics();
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={MainScreen} />
        <Route path="/ai" component={AIPage} />
        <Route path="/content" component={ContentPage} />
        <Route path="/my" component={MyPage} />
        <Route path="/restaurant/:id" component={RestaurantDetailPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/login" component={AuthPage} />
        
        {/* Admin Routes */}
        <Route path="/admin">
          {() => (
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/restaurants">
          {() => (
            <AdminLayout>
              <AdminRestaurants />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/users">
          {() => (
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/reviews">
          {() => (
            <AdminLayout>
              <AdminReviews />
            </AdminLayout>
          )}
        </Route>
        <Route path="/admin/content">
          {() => (
            <AdminLayout>
              <AdminContent />
            </AdminLayout>
          )}
        </Route>
        
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
