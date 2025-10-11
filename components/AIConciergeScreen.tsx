// 3.0_AI_Concierge - AI Chat Interface Screen
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Send, Bot, User } from 'lucide-react';

interface AIConciergeScreenProps {
  onNavigateBack?: () => void;
}

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

export default function AIConciergeScreen({ onNavigateBack }: AIConciergeScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '안녕하세요, Jerry님! 👋 한식당 AI 컨시어지입니다.\n\n🎯 **새로운 스마트 추천 방식을 소개해드릴게요!**\n\n**1단계: 여러 조건을 동시에 선택하세요** 🔘\n• 아래 버튼들을 여러 개 클릭해보세요\n• 선택된 버튼은 파란색으로 변해요\n• 음식 종류 + 상황 + 조건을 함께 선택 가능!\n\n**2단계: 선택된 옵션들이 상단에 표시됩니다** 📋\n• 선택한 조건들이 태그로 정리되어 보여져요\n• 개별 제거(×) 또는 전체 지우기 가능\n\n**3단계: 추가 메시지를 입력하세요** ✏️\n• "강남 근처에서", "2만원 이하로", "분위기 좋은 곳" 등\n• 더 구체적인 요청사항을 자유롭게 추가하세요\n\n**4단계: 한 번에 전송하면 완벽한 맞춤 추천!** ✨\n• 선택한 조건들과 추가 메시지를 종합 분석\n• 딱 맞는 한식당들을 정확하게 추천해드려요\n\n지금 바로 아래 버튼들을 여러 개 선택해보세요! 🚀',
      timestamp: new Date(Date.now() - 60000)
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    // 첫 번째 줄 - 주요 카테고리
    ['🍲 한식 추천', '🌶️ 매운 음식', '🥩 BBQ 맛집', '🍜 국물 요리', '🥘 전골/찌개', '🍚 밥류'],
    // 두 번째 줄 - 상황별/조건별
    ['💑 데이트 맛집', '👨‍👩‍👧‍👦 가족식사', '🍻 회식 장소', '😋 혼밥 추천', '🌱 비건 메뉴', '🕰️ 24시간 운영', '💰 가성비 맛집', '🌟 미슐랭 맛집']
  ];

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (selectedOptions.length > 0 || inputMessage.trim()) {
      // Combine selected options and input message
      const optionText = selectedOptions.length > 0 
        ? `선택한 옵션: ${selectedOptions.join(', ')}\n\n` 
        : '';
      const fullMessage = optionText + inputMessage.trim();
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: fullMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setSelectedOptions([]);
      
      // Simulate AI typing response
      setIsTyping(true);
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: generateAIResponse(selectedOptions, inputMessage.trim()),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleQuickReply = (reply: string) => {
    // Toggle selection instead of immediate sending
    setSelectedOptions(prev => {
      if (prev.includes(reply)) {
        // Remove if already selected
        return prev.filter(option => option !== reply);
      } else {
        // Add if not selected
        return [...prev, reply];
      }
    });
  };

  const generateAIResponse = (options: string[], additionalMessage: string) => {
    if (options.length === 0 && additionalMessage) {
      return '말씀해주신 내용을 바탕으로 맞춤 추천을 해드릴게요! 조금 더 구체적인 정보를 알려주시면 더 정확한 추천이 가능해요 😊';
    }

    let response = '선택해주신 조건들을 종합해서 완벽한 추천을 해드릴게요! ✨\n\n';
    
    // Analyze selected options
    const categories = options.filter(opt => ['🍲 한식 추천', '🌶️ 매운 음식', '🥩 BBQ 맛집', '🍜 국물 요리', '🥘 전골/찌개', '🍚 밥류'].includes(opt));
    const situations = options.filter(opt => ['💑 데이트 맛집', '👨‍👩‍👧‍👦 가족식사', '🍻 회식 장소', '😋 혼밥 추천'].includes(opt));
    const conditions = options.filter(opt => ['🌱 비건 메뉴', '🕰️ 24시간 운영', '💰 가성비 맛집', '🌟 미슐랭 맛집'].includes(opt));

    if (categories.length > 1) {
      response += `**다양한 음식 스타일**: ${categories.join(', ')}\n`;
    } else if (categories.length === 1) {
      response += `**음식 선호**: ${categories[0]}\n`;
    }

    if (situations.length > 0) {
      response += `**상황/목적**: ${situations.join(', ')}\n`;
    }

    if (conditions.length > 0) {
      response += `**특별 조건**: ${conditions.join(', ')}\n`;
    }

    if (additionalMessage) {
      response += `**추가 요청사항**: "${additionalMessage}"\n`;
    }

    response += '\n🔍 **맞춤 추천 결과**:\n';
    
    // Generate contextual recommendations based on combinations
    if (options.includes('💑 데이트 맛집') && options.includes('🌶️ 매운 음식')) {
      response += '🌶️ **신사동 가마솥 김치찌개**: 로맨틱한 분위기의 매운 맛집\n';
    }
    if (options.includes('🍻 회식 장소') && options.includes('🥩 BBQ 맛집')) {
      response += '🥩 **강남 왕갈비**: 넓은 룸과 최고급 한우 갈비\n';
    }
    if (options.includes('👨‍👩‍👧‍👦 가족식사') && options.includes('🍜 국물 요리')) {
      response += '🍜 **명동 설렁탕**: 3대째 이어온 전통 사골국물\n';
    }
    if (options.includes('💰 가성비 맛집') && options.includes('😋 혼밥 추천')) {
      response += '🍚 **혼밥천국 비빔밥**: 8,000원 푸짐한 1인분\n';
    }

    response += '\n더 구체적인 정보(지역, 예산, 시간 등)를 알려주시면 더 정확한 추천을 해드릴게요! 🎯';
    
    return response;
  };

  // Keep the old handleQuickReply logic for backward compatibility but update to use new system
  const handleOldQuickReply = (reply: string) => {
    // This is now unused but keeping structure
    setIsTyping(true);
    setTimeout(() => {
      let aiResponse = '';
      switch (reply) {
        case '🍲 한식 추천':
          aiResponse = '한식 전체 카테고리에서 추천 드릴게요! 🇰🇷\n\n어떤 스타일을 선호하시나요?\n• **전통 한식**: 한정식, 정통 궁중요리\n• **캐주얼 한식**: 김치찌개, 불고기, 비빔밥\n• **모던 한식**: 퓨전 스타일, 창작 요리\n\n지역이나 예산대도 알려주시면 더 정확히 추천해드려요!';
          break;
        case '🌶️ 매운 음식':
          aiResponse = '매콤한 한식 좋아하시는군요! 🔥\n\n**추천 매운 메뉴**:\n🌶️ **김치찌개** - 클래식한 매운맛\n🔥 **떡볶이** - 달콤매콤한 인기 간식\n🥵 **마라탕** - 얼얼한 중독성\n🌶️ **매운갈비찜** - 진짜 매운 걸 원한다면\n\n매운 정도는 어느 정도까지 괜찮으신가요?';
          break;
        case '🥩 BBQ 맛집':
          aiResponse = '한국 BBQ는 정말 최고죠! 🥩\n\n**추천 BBQ 맛집**:\n🔥 **삼겹살 전문점** - 두툼한 생삼겹\n🥩 **갈비 맛집** - LA갈비, 왕갈비\n🍖 **소고기 전문점** - 한우, 와규\n🐷 **목살/항정살** - 부드러운 부위\n\n어떤 고기를 가장 좋아하시나요?';
          break;
        case '🍜 국물 요리':
          aiResponse = '따뜻한 국물 요리로 몸과 마음을 따뜻하게! 🍜\n\n**인기 국물 요리**:\n🍲 **김치찌개** - 한국인의 소울푸드\n🍜 **설렁탕** - 진한 사골 국물\n🍲 **순두부찌개** - 부드럽고 얼큰한\n🍜 **냉면** - 시원한 물냉면, 비냉면\n\n따뜻한 국물과 차가운 국물 중 어떤 걸 원하시나요?';
          break;
        case '🥘 전골/찌개':
          aiResponse = '여럿이 함께 나눠 먹는 전골/찌개! 🥘\n\n**인기 전골/찌개**:\n🔥 **부대찌개** - 햄, 소시지가 들어간\n🦀 **게장찌개** - 진한 게의 풍미\n🐟 **생선찌개** - 신선한 생선으로\n🍄 **버섯전골** - 다양한 버섯의 조화\n\n몇 명이서 드실 예정인가요?';
          break;
        case '🍚 밥류':
          aiResponse = '든든한 한국 밥 요리들! 🍚\n\n**추천 밥 요리**:\n🌈 **비빔밥** - 영양 만점 컬러풀\n🍳 **김치볶음밥** - 고소하고 짭짤한\n🐄 **소고기덮밥** - 단백질 가득\n🦪 **굴밥** - 바다의 우유와 함께\n\n어떤 토핑을 좋아하시나요?';
          break;
        case '💑 데이트 맛집':
          aiResponse = '로맨틱한 데이트에 완벽한 곳들이에요! 💕\n\n**데이트 추천 포인트**:\n🕯️ **분위기 좋은 곳** - 조명, 인테리어\n🤫 **조용한 곳** - 대화하기 좋은\n📸 **인스타 감성** - 사진 찍기 좋은\n🍷 **술과 안주** - 분위기 있는 주점\n\n어떤 분위기를 원하시나요?';
          break;
        case '👨‍👩‍👧‍👦 가족식사':
          aiResponse = '온 가족이 함께 즐길 수 있는 곳들! 👨‍👩‍👧‍👦\n\n**가족 식사 추천**:\n🏠 **넓은 룸** - 아이들과 편안하게\n🍽️ **다양한 메뉴** - 취향 다른 가족들도\n👶 **아이 친화적** - 유아용 의자, 키즈 메뉴\n🅿️ **주차 편리** - 가족 나들이에 필수\n\n가족 구성원은 어떻게 되시나요?';
          break;
        case '🍻 회식 장소':
          aiResponse = '회식하기 좋은 장소들을 추천해드릴게요! 🍻\n\n**회식 맛집 포인트**:\n🍖 **고기 + 술** - 삼겹살, 갈비와 소주\n🍺 **치킨 + 맥주** - 치킨과 시원한 맥주\n🏢 **단체 룸** - 많은 인원 수용 가능\n🎤 **노래방 연계** - 2차까지 한 번에\n\n몇 명 정도 회식인가요?';
          break;
        case '😋 혼밥 추천':
          aiResponse = '혼자서도 편안하게 즐길 수 있는 곳들! 😋\n\n**혼밥 친화적인 곳**:\n🍜 **카운터석** - 혼자 앉기 편한\n⚡ **빠른 서빙** - 기다리지 않고\n💰 **합리적 가격** - 1인분도 부담 없이\n📱 **키오스크 주문** - 말 안 해도 되는\n\n어떤 음식이 먹고 싶으신가요?';
          break;
        case '🌱 비건 메뉴':
          aiResponse = '건강한 비건 한식 옵션들! 🌱\n\n**비건 친화 메뉴**:\n🥬 **사찰음식** - 100% 식물성 재료\n🍄 **버섯 요리** - 다양한 버섯 활용\n🥕 **나물 비빔밥** - 영양 가득한\n🌿 **두부 요리** - 단백질 보충까지\n\n완전 비건식을 원하시나요, 아니면 일부 채식 메뉴만?';
          break;
        case '🕰️ 24시간 운영':
          aiResponse = '언제든 찾을 수 있는 24시간 맛집! 🕰️\n\n**24시간 한식당**:\n🌙 **야식 메뉴** - 밤늦게 생각나는\n☕ **해장 요리** - 속 풀리는 국물\n🍜 **간단한 식사** - 빠르고 든든한\n🏢 **접근성 좋은** - 지하철역 근처\n\n언제쯤 방문 예정이신가요?';
          break;
        case '💰 가성비 맛집':
          aiResponse = '맛있고 저렴한 가성비 끝판왕! 💰\n\n**가성비 포인트**:\n🍽️ **양 많은 곳** - 배부르게 먹을 수 있는\n💵 **만원 이하** - 부담 없는 가격대\n🔄 **무한리필** - 밑반찬, 국물 등\n🏪 **동네 맛집** - 숨은 진주 같은\n\n예산대는 어느 정도로 생각하고 계시나요?';
          break;
        case '🌟 미슐랭 맛집':
          aiResponse = '특별한 날을 위한 미슐랭 맛집! 🌟\n\n**미슐랭 가이드 한식당**:\n⭐ **미슐랭 스타** - 세계가 인정한 맛\n🏆 **빕 구르망** - 가성비 좋은 미슐랭\n👨‍🍳 **셰프 특선** - 창작 한식의 정수\n🍽️ **코스 요리** - 품격 있는 식사\n\n어떤 특별한 날인지 알려주시면 더 좋은 추천을 해드릴게요!';
          break;
        default:
          aiResponse = '좋은 선택이에요! 더 자세한 추천을 위해 조금 더 알려주세요 😊\n\n• 선호하는 지역이 있나요?\n• 예산대는 어느 정도인가요?\n• 몇 명이서 가실 예정인가요?\n• 특별한 상황이나 목적이 있나요?';
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleBackClick = () => {
    console.log('Navigate back to 2.0_Main_Screen (Slide Out Down)');
    onNavigateBack?.();
  };

  const handleOptionsClick = () => {
    console.log('Open AI Concierge options menu');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="w-[390px] h-[852px] bg-secondary mx-auto relative overflow-hidden flex flex-col" style={{ fontFamily: 'var(--font-family-primary)' }}>
      {/* Frame: 3.0_AI_Concierge - iPhone 14 Pro */}
      
      {/* Screen Title Header */}
      <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground p-2 text-center z-50">
        <span style={{ fontSize: 'var(--text-sm)' }}>3.0 AI Concierge</span>
      </div>
      
      {/* Top Header - Global / Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border" style={{ boxShadow: 'var(--elevation-sm)' }}>
        <div className="flex items-center justify-between px-4 py-3 pt-12" style={{ gap: '8px' }}>
          {/* Left Item - Back Arrow */}
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors duration-200 active:scale-95"
            onClick={handleBackClick}
            aria-label="Back to Main Screen"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          
          {/* Center Title - AI Concierge */}
          <div className="flex-1 text-center">
            <h2 className="text-foreground" style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-medium)' }}>
              AI Concierge
            </h2>
          </div>
          
          {/* Right Item - Options */}
          <button 
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors duration-200 active:scale-95"
            onClick={handleOptionsClick}
            aria-label="Options Menu"
          >
            <MoreHorizontal className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Message Area - Main Content (Vertical Scrollable) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-col" style={{ gap: '16px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[280px] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`} style={{ gap: '8px' }}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'ai' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {message.type === 'ai' ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className="flex flex-col" style={{ gap: '4px' }}>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.type === 'ai'
                        ? 'bg-background text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                    style={{ 
                      boxShadow: 'var(--elevation-sm)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`px-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex" style={{ gap: '8px' }}>
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-background px-4 py-3 rounded-lg" style={{ boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="flex" style={{ gap: '4px' }}>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Area (Sticky at bottom) */}
      <div className="sticky bottom-0 z-40 bg-background border-t border-border px-4 py-4" style={{ boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        {/* Selected Options Display */}
        {selectedOptions.length > 0 && (
          <div className="mb-3 p-3 bg-card rounded-lg border border-border" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div className="flex items-center mb-2" style={{ gap: '8px' }}>
              <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                선택된 옵션:
              </span>
              <button
                onClick={() => setSelectedOptions([])}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                모두 지우기
              </button>
            </div>
            <div className="flex flex-wrap" style={{ gap: '6px' }}>
              {selectedOptions.map((option, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary text-white rounded-md text-xs"
                  style={{ 
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-md)',
                    color: '#FFFFFF',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {option}
                  <button
                    onClick={() => setSelectedOptions(prev => prev.filter(opt => opt !== option))}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 text-white"
                    style={{ color: '#FFFFFF' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Reply Chips - 2 Rows with Horizontal Scroll */}
        <div className="mb-3" style={{ gap: '8px' }}>
          {quickReplies.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-2">
              <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {row.map((reply, index) => {
                  const isSelected = selectedOptions.includes(reply);
                  return (
                    <button
                      key={`${rowIndex}-${index}`}
                      className={`flex-shrink-0 px-3 py-2 border rounded-full transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
                      }`}
                      style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-normal)',
                        borderRadius: 'var(--radius-xl)',
                        minWidth: 'fit-content',
                        color: isSelected ? '#FFFFFF' : undefined
                      }}
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Enhanced Quick Tips with Examples */}
          <div className="text-center mt-2 mb-1">
            <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-sm)' }}>
              💡 <strong>사용 예시:</strong> "🌶️ 매운 음식 + 💑 데이트 맛집" 선택 후 "홍대 근처에서 분위기 좋은 곳으로" 입력
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              🎯 더 많은 조건을 선택할수록 더 정확한 추천을 받을 수 있어요!
            </p>
          </div>
        </div>
        
        {/* Message Input Field */}
        <div className="flex items-center" style={{ gap: '8px' }}>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedOptions.length > 0 ? "추가 메시지를 입력하세요..." : "메시지를 입력하세요..."}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-normal)',
                fontFamily: 'var(--font-family-primary)',
                borderRadius: 'var(--radius-lg)'
              }}
            />
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={selectedOptions.length === 0 && !inputMessage.trim()}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-95 ${
              (selectedOptions.length > 0 || inputMessage.trim())
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            style={{ 
              borderRadius: 'var(--radius-lg)',
              color: (selectedOptions.length > 0 || inputMessage.trim()) ? '#FFFFFF' : undefined
            }}
            aria-label="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
