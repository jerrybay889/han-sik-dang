import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainScreen from "@/pages/MainScreen";
import AIPage from "@/pages/AIPage";
import ContentPage from "@/pages/ContentPage";
import MyPage from "@/pages/MyPage";
import RestaurantDetailPage from "@/pages/RestaurantDetailPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainScreen} />
      <Route path="/ai" component={AIPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/my" component={MyPage} />
      <Route path="/restaurant/:id" component={RestaurantDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
