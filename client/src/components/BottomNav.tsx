import { Compass, Bot, BookText, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Compass, label: t("nav.discover"), testId: "nav-discover" },
    { path: "/ai", icon: Bot, label: t("nav.ai"), testId: "nav-ai" },
    { path: "/content", icon: BookText, label: t("nav.content"), testId: "nav-content" },
    { path: "/my", icon: User, label: t("nav.my"), testId: "nav-my" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="max-w-md mx-auto h-[72px] flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              data-testid={item.testId}
            >
              <button
                className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-[56px] rounded-md transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover-elevate"
                }`}
              >
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
