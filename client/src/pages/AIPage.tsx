import { useState } from "react";
import { Bot, Send, Sparkles, Utensils, MapPin, Heart, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { useLanguage } from "@/contexts/LanguageContext";

type Message = {
  id: number;
  type: "ai" | "user";
  content: string;
};

export default function AIPage() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: t("ai.welcome"),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    { icon: Utensils, text: t("ai.suggestions.vegan") },
    { icon: MapPin, text: t("ai.suggestions.nearby") },
    { icon: Heart, text: t("ai.suggestions.romantic") },
    { icon: Sparkles, text: t("ai.suggestions.special") },
  ];

  const handleSend = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;
    
    const newUserMessage = { id: messages.length + 1, type: "user" as const, content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage, language }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: "ai",
          content: data.response,
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: "ai",
          content: "Sorry, I encountered an error. Please try again. 죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={t("ai.title")}
        description="Get personalized Korean restaurant recommendations with AI. Perfect for tourists visiting Korea."
        keywords={["AI recommendations", "Korean food guide", "restaurant finder", "tourist guide", "AI concierge"]}
        url="/ai"
      />
      <div className="min-h-screen bg-background pb-[72px] flex flex-col">
        {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold">{t("ai.title")}</h1>
                <p className="text-xs text-primary-foreground/80">{t("app.tagline")}</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Ad Banner */}
      <div className="px-4 pt-4">
        <AdSlot variant="banner" />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card text-foreground border border-border rounded-bl-sm"
              }`}
              data-testid={`message-${message.type}-${message.id}`}
            >
              {message.type === "ai" && (
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card text-foreground border border-border rounded-bl-sm">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-primary">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="pt-4" data-testid="suggestions-container">
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <Card
                    key={index}
                    className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                    onClick={() => handleSend(suggestion.text)}
                    data-testid={`suggestion-${index}`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium">{suggestion.text}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-[72px] bg-background border-t border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("ai.placeholder")}
              className="flex-1 px-4 py-3 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-message"
            />
            <Button
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              data-testid="button-send"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
    </>
  );
}
