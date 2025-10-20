import { useState } from "react";
import { Bot, Send, Sparkles, Utensils, MapPin, Heart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";

type Message = {
  id: number;
  type: "ai" | "user";
  content: string;
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "안녕하세요! 👋 한식당 AI 컨시어지입니다.\n\nHello! I'm your Korean restaurant AI concierge. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const suggestions = [
    { icon: Utensils, text: "비건 한식", textEn: "Vegan Korean" },
    { icon: MapPin, text: "홍대 근처", textEn: "Near Hongdae" },
    { icon: Heart, text: "로맨틱", textEn: "Romantic" },
    { icon: Sparkles, text: "특별한 날", textEn: "Special Day" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([
      ...messages,
      { id: messages.length + 1, type: "user", content: input },
    ]);
    setInput("");
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "ai",
          content: "추천 레스토랑을 찾고 있습니다... 잠시만 기다려주세요.\n\nLooking for the perfect restaurant for you...",
        },
      ]);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background pb-[72px] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold">AI 컨시어지</h1>
              <p className="text-xs text-primary-foreground/80">AI Restaurant Concierge</p>
            </div>
            <Sparkles className="ml-auto w-6 h-6 animate-pulse" />
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

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="pt-4" data-testid="suggestions-container">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              빠른 추천 받기 • Quick Suggestions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                  <Card
                    key={index}
                    className="p-4 hover-elevate active-elevate-2 cursor-pointer"
                    onClick={() => setInput(suggestion.text)}
                    data-testid={`suggestion-${index}`}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{suggestion.text}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.textEn}</p>
                      </div>
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
              placeholder="메시지를 입력하세요... Type your message..."
              className="flex-1 px-4 py-3 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-message"
            />
            <Button
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={handleSend}
              disabled={!input.trim()}
              data-testid="button-send"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
