import { Home, Bot, BookText, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "발견", labelEn: "Discover" },
    { path: "/ai", icon: Bot, label: "AI 추천", labelEn: "AI" },
    { path: "/content", icon: BookText, label: "콘텐츠", labelEn: "Content" },
    { path: "/my", icon: User, label: "마이", labelEn: "My" },
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
              data-testid={`nav-${item.labelEn.toLowerCase()}`}
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
