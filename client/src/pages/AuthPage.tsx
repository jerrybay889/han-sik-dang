import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEO } from "@/components/SEO";
import { LogIn } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    // Redirect to Replit Auth login
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={t("auth.login")}
        description={t("auth.loginDescription")}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="text-auth-title">
              {t("auth.login")}
            </h1>
            <p className="text-muted-foreground">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
            data-testid="button-submit"
          >
            <LogIn className="w-5 h-5 mr-2" />
            {t("auth.login")}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Powered by Replit Auth
          </p>
        </Card>
      </div>
    </>
  );
}
