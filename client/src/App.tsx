import { useEffect } from "react";
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
import MainScreen from "@/pages/MainScreen";
import AIPage from "@/pages/AIPage";
import ContentPage from "@/pages/ContentPage";
import MyPage from "@/pages/MyPage";
import RestaurantDetailPage from "@/pages/RestaurantDetailPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

function Router() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={MainScreen} />
      <Route path="/ai" component={AIPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/my" component={MyPage} />
      <Route path="/restaurant/:id" component={RestaurantDetailPage} />
      <Route path="/login" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
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
