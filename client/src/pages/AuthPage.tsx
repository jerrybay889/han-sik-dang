import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const authMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await apiRequest("POST", endpoint, { username, password });
      const data = await response.json();
      return data as { id: string; username: string };
    },
    onSuccess: (data) => {
      login(data);
      toast({
        title: isLogin ? t("auth.loginSuccess") : t("auth.signupSuccess"),
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: t("auth.error"),
        description: error.message || (isLogin ? t("auth.loginError") : t("auth.signupError")),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: t("auth.error"),
        description: t("auth.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    if (!isLogin) {
      if (username.length < 3) {
        toast({
          title: t("auth.error"),
          description: t("auth.usernameMinLength"),
          variant: "destructive",
        });
        return;
      }

      if (password.length < 6) {
        toast({
          title: t("auth.error"),
          description: t("auth.passwordMinLength"),
          variant: "destructive",
        });
        return;
      }
    }

    authMutation.mutate();
  };

  return (
    <>
      <SEO
        title={isLogin ? t("auth.login") : t("auth.signup")}
        description={isLogin ? t("auth.loginDescription") : t("auth.signupDescription")}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" data-testid="text-auth-title">
              {isLogin ? t("auth.login") : t("auth.signup")}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.usernamePlaceholder")}
                disabled={authMutation.isPending}
                data-testid="input-username"
              />
            </div>

            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                disabled={authMutation.isPending}
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={authMutation.isPending}
              data-testid="button-submit"
            >
              {authMutation.isPending ? "..." : isLogin ? t("auth.login") : t("auth.signup")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setUsername("");
                setPassword("");
              }}
              className="text-sm text-primary hover:underline"
              data-testid="button-toggle-mode"
            >
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
