import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainScreen from "@/pages/MainScreen";
import AIPage from "@/pages/AIPage";
import ContentPage from "@/pages/ContentPage";
import MyPage from "@/pages/MyPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainScreen} />
      <Route path="/ai" component={AIPage} />
      <Route path="/content" component={ContentPage} />
      <Route path="/my" component={MyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
