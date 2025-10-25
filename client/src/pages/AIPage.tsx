import { useState, useRef, useEffect } from "react";
import { Bot, Send, MapPin, Loader2, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<"nearby" | "other" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const keywords = [
    { key: "nearby", label: t("ai.keywords.nearby"), icon: MapPin },
    { key: "vegan", label: t("ai.keywords.vegan"), icon: Sparkles },
    { key: "popular", label: t("ai.keywords.popular"), icon: Sparkles },
    { key: "bbq", label: t("ai.keywords.bbq"), icon: Sparkles },
    { key: "bibimbap", label: t("ai.keywords.bibimbap"), icon: Sparkles },
    { key: "traditional", label: t("ai.keywords.traditional"), icon: Sparkles },
    { key: "modern", label: t("ai.keywords.modern"), icon: Sparkles },
    { key: "streetFood", label: t("ai.keywords.streetFood"), icon: Sparkles },
    { key: "chinese", label: t("ai.keywords.chinese"), icon: Sparkles },
    { key: "trending", label: t("ai.keywords.trending"), icon: Sparkles },
  ];

  const handleLocationSelect = (location: "nearby" | "other") => {
    setSelectedLocation(location);
    setLocationSelected(true);
    
    // Add location selection as user message
    const locationText = location === "nearby" 
      ? t("ai.nearbyButton") 
      : t("ai.otherAreaButton");
    
    const newUserMessage = { 
      id: messages.length + 1, 
      type: "user" as const, 
      content: locationText 
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Add AI response about location
    const aiResponse = location === "nearby"
      ? (language === "en" 
          ? "Great! I'll help you find nearby restaurants. What type of cuisine or dish are you interested in?" 
          : "좋아요! 근처 맛집을 찾아드리겠습니다. 어떤 음식이나 요리에 관심이 있으신가요?")
      : (language === "en"
          ? "Perfect! Which area would you like to explore? Feel free to tell me the district or neighborhood you're interested in."
          : "좋아요! 어떤 지역을 탐색하고 싶으신가요? 관심 있는 구역이나 동네를 알려주세요.");

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: "ai",
        content: aiResponse,
      }]);
    }, 500);
  };

  const handleKeywordClick = (keyword: string) => {
    handleSend(keyword);
  };

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
        body: JSON.stringify({ 
          message: userMessage, 
          language,
          location: selectedLocation 
        }),
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
          content: language === "en" 
            ? "Sorry, I encountered an error. Please try again." 
            : "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.",
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
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        >
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
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Thinking..." : "생각 중..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Location Selection - Shows first */}
          {messages.length === 1 && !locationSelected && !isLoading && (
            <div className="pt-4" data-testid="location-selection">
              <div className="flex justify-start mb-4">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-card text-foreground border border-border rounded-bl-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Assistant</span>
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {t("ai.locationQuestion")}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover-elevate active-elevate-2"
                  onClick={() => handleLocationSelect("nearby")}
                  data-testid="button-nearby"
                >
                  <MapPin className="w-6 h-6 text-primary" />
                  <span className="font-medium">{t("ai.nearbyButton")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover-elevate active-elevate-2"
                  onClick={() => handleLocationSelect("other")}
                  data-testid="button-other-area"
                >
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="font-medium">{t("ai.otherAreaButton")}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Keyword Suggestions - Shows after location is selected */}
          {locationSelected && messages.length <= 4 && !isLoading && (
            <div className="pt-4" data-testid="keyword-suggestions">
              <p className="text-xs text-muted-foreground mb-3 px-1">
                {t("ai.quickSuggestions")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {keywords.map((keyword, index) => {
                  const Icon = keyword.icon;
                  return (
                    <Card
                      key={index}
                      className="p-3 hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => handleKeywordClick(keyword.label)}
                      data-testid={`keyword-${keyword.key}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm font-medium leading-tight flex-1">
                          {keyword.label}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
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
