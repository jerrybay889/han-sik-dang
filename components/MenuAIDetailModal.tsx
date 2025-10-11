import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';

interface MenuAIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuId: string;
  menuName: string;
}

interface AISection {
  id: string;
  title: string;
  content: string;
  expanded: boolean;
  feedback?: 'helpful' | 'not-helpful' | 'incorrect' | null;
}

export default function MenuAIDetailModal({
  isOpen,
  onClose,
  menuId,
  menuName
}: MenuAIDetailModalProps) {
  const [aiSections, setAiSections] = useState<AISection[]>([
    {
      id: 'menu-description',
      title: 'AI 메뉴 설명',
      content: `AI가 분석한 ${menuName}의 상세 설명입니다. 이 메뉴는 전통적인 한국 요리법을 따라 만들어지며, 신선한 재료와 정성스러운 조리 과정을 통해 깊은 맛을 자랑합니다. [Italian: Descrizione dettagliata del menu basata sull'IA] 영양 성분과 칼로리 정보도 포함되어 있으며, 알레르기 정보도 확인하실 수 있습니다.`,
      expanded: true,
      feedback: null
    },
    {
      id: 'how-to-eat',
      title: 'AI 먹는 법',
      content: `가장 맛있게 즐기는 AI 추천 방법입니다. [Japanese: AIが推奨する美味しい食べ方] 먼저 국물을 한 모금 드신 후 면과 함께 드시면 더욱 깊은 맛을 경험하실 수 있습니다. 김치나 단무지와 함께 곁들이면 풍미가 더욱 풍부해집니다. 뜨거울 때 드시는 것이 가장 좋으며, 젓가락 사용법도 함께 안내드립니다.`,
      expanded: false,
      feedback: null
    },
    {
      id: 'ordering-tips',
      title: 'AI 주문 팁',
      content: `이 메뉴를 더 잘 즐기기 위한 AI 추천 팁입니다. [Chinese: AI推荐订购技巧] 주문시 '매운맛 조절 가능'이라고 말씀하시면 개인의 취향에 맞게 조절해드립니다. 곁들임 메뉴로는 군만두나 김치전을 추천하며, 음료는 생맥주나 막걸리가 잘 어울립니다. 2-3인 기준으로 주문하시면 적당한 양입니다.`,
      expanded: false,
      feedback: null
    },
    {
      id: 'review-analysis',
      title: 'AI 리뷰 분석',
      content: `수많은 리뷰 데이터를 기반으로 AI가 분석한 내용입니다. [Vietnamese: Phân tích đánh giá bằng AI] 고객들이 가장 만족하는 점은 진한 육수와 쫄깃한 면발이며, 전체 만족도는 4.7/5점입니다. 특히 외국인 고객들은 정통 한국 맛을 경험할 수 있다는 점을 높이 평가했습니다. 개선점으로는 대기시간 단축이 언급되었습니다.`,
      expanded: false,
      feedback: null
    }
  ]);

  const toggleSection = (sectionId: string) => {
    setAiSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  const handleFeedback = (sectionId: string, feedbackType: 'helpful' | 'not-helpful' | 'incorrect') => {
    setAiSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, feedback: section.feedback === feedbackType ? null : feedbackType }
          : section
      )
    );
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Semi-transparent Overlay - Background / Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)' // Semi-transparent overlay
        }}
      />

      {/* Modal Container - Background / Primary, Elevation / Large */}
      <div 
        className="relative w-full max-w-sm rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--background)', // Background / Primary
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Elevation / Large
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header - i18n Ready */}
        <div 
          className="sticky top-0 flex items-center justify-between px-6 py-4 border-b z-10"
          style={{
            backgroundColor: 'var(--background)', // Background / Primary
            borderColor: 'var(--border)',
            boxShadow: 'var(--elevation-sm)' // Elevation / Small
          }}
        >
          {/* Menu Name - H2 / Bold / 20px, i18n Ready */}
          <h2 
            className="flex-1 min-w-0 pr-4 break-words"
            style={{
              fontSize: 'var(--text-xl)', // H2 / Bold / 20px
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)', // Text / Primary
              lineHeight: '1.3'
            }}
          >
            {menuName}
          </h2>

          {/* Close Button - Icon / Standard */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors duration-200 hover:bg-muted active:scale-95"
            style={{
              borderRadius: 'var(--radius-md)',
              minHeight: '44px',
              minWidth: '44px'
            }}
            aria-label="닫기"
          >
            <X className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* Modal Content - Scrollable Vertical Auto Layout */}
        <div 
          className="overflow-y-auto p-6"
          style={{ 
            maxHeight: 'calc(90vh - 80px)' // Account for header height
          }}
        >
          <div className="space-y-4">
            {aiSections.map((section) => (
              <div 
                key={section.id}
                className="rounded-lg border"
                style={{
                  backgroundColor: 'var(--background)', // Background / Primary for sections
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {/* Accordion Header - i18n Ready */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between transition-colors duration-200 hover:bg-muted/50"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    minHeight: '44px'
                  }}
                >
                  <h3 
                    className="break-words flex-1 min-w-0 text-left"
                    style={{
                      fontSize: 'var(--text-lg)', // H3 / Bold / 18px
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      lineHeight: '1.3'
                    }}
                  >
                    {section.title}
                  </h3>
                  
                  {/* Expand/Collapse Icon */}
                  {section.expanded ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: 'var(--muted-foreground)' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: 'var(--muted-foreground)' }} />
                  )}
                </button>

                {/* Accordion Content - i18n Ready */}
                {section.expanded && (
                  <div 
                    className="px-4 pb-4"
                    style={{
                      borderTop: '1px solid var(--border)'
                    }}
                  >
                    <div className="pt-4">
                      <p 
                        className="break-words mb-4"
                        style={{
                          fontSize: 'var(--text-base)', // Body / Regular / 16px
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--foreground)',
                          lineHeight: '1.5'
                        }}
                      >
                        {section.content}
                      </p>

                      {/* AI Feedback Buttons - i18n Ready */}
                      <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between">
                          {/* Feedback Question - i18n Ready */}
                          <p 
                            className="break-words flex-1 mr-4"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--muted-foreground)',
                              lineHeight: '1.4'
                            }}
                          >
                            이 정보가 도움이 되셨나요?
                          </p>

                          {/* Feedback Buttons Container */}
                          <div className="flex items-center gap-2">
                            {/* Helpful Button - i18n Ready */}
                            <button
                              onClick={() => handleFeedback(section.id, 'helpful')}
                              className="p-2 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-95 flex items-center justify-center"
                              style={{
                                borderColor: section.feedback === 'helpful' ? 'var(--primary)' : 'var(--border)',
                                backgroundColor: section.feedback === 'helpful' ? 'rgba(26, 95, 122, 0.1)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                minHeight: '36px',
                                minWidth: '36px'
                              }}
                              aria-label="도움됨"
                            >
                              <ThumbsUp 
                                className="w-4 h-4" 
                                style={{ 
                                  color: section.feedback === 'helpful' ? 'var(--primary)' : 'var(--muted-foreground)'
                                }} 
                              />
                            </button>

                            {/* Not Helpful Button - i18n Ready */}
                            <button
                              onClick={() => handleFeedback(section.id, 'not-helpful')}
                              className="p-2 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-95 flex items-center justify-center"
                              style={{
                                borderColor: section.feedback === 'not-helpful' ? 'var(--accent)' : 'var(--border)',
                                backgroundColor: section.feedback === 'not-helpful' ? 'rgba(255, 123, 84, 0.1)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                minHeight: '36px',
                                minWidth: '36px'
                              }}
                              aria-label="도움되지 않음"
                            >
                              <ThumbsDown 
                                className="w-4 h-4" 
                                style={{ 
                                  color: section.feedback === 'not-helpful' ? 'var(--accent)' : 'var(--muted-foreground)'
                                }} 
                              />
                            </button>

                            {/* Report Incorrect Button - i18n Ready */}
                            <button
                              onClick={() => handleFeedback(section.id, 'incorrect')}
                              className="p-2 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-95 flex items-center justify-center"
                              style={{
                                borderColor: section.feedback === 'incorrect' ? 'var(--destructive)' : 'var(--border)',
                                backgroundColor: section.feedback === 'incorrect' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                minHeight: '36px',
                                minWidth: '36px'
                              }}
                              aria-label="틀린 정보 신고"
                            >
                              <Flag 
                                className="w-4 h-4" 
                                style={{ 
                                  color: section.feedback === 'incorrect' ? 'var(--destructive)' : 'var(--muted-foreground)'
                                }} 
                              />
                            </button>
                          </div>
                        </div>

                        {/* Feedback Status Message - i18n Ready */}
                        {section.feedback && (
                          <div className="mt-2">
                            <p 
                              className="break-words"
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family-primary)',
                                color: 
                                  section.feedback === 'helpful' ? 'var(--primary)' :
                                  section.feedback === 'not-helpful' ? 'var(--accent)' :
                                  'var(--destructive)',
                                lineHeight: '1.4'
                              }}
                            >
                              {section.feedback === 'helpful' && '✓ 피드백 감사합니다!'}
                              {section.feedback === 'not-helpful' && '💭 더 나은 정보로 개선하겠습니다'}
                              {section.feedback === 'incorrect' && '🚨 신고가 접수되었습니다'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Google In-App Banner Ad - Strategic Placement, i18n Ready */}
            <div 
              className="mt-6 p-4 rounded-lg border-2 border-dashed text-center transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--secondary)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '100px' // Standard mobile banner height + padding
              }}
            >
              {/* Ad Label - i18n Ready */}
              <div className="mb-2">
                <span 
                  className="px-2 py-1 rounded text-center"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    fontWeight: 'var(--font-weight-normal)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  광고
                </span>
              </div>

              {/* Google Ad Banner Placeholder - Standard 320x50 Mobile Banner */}
              <div 
                className="mx-auto border rounded"
                style={{
                  width: '320px',
                  height: '50px',
                  maxWidth: '100%',
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="text-center">
                  <div 
                    className="mb-1"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Google AdMob
                  </div>
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Banner Ad Space
                  </div>
                </div>
              </div>

              {/* Ad Integration Note - Development Helper */}
              <div className="mt-2">
                <p 
                  className="break-words"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  실제 구현시 Google AdMob SDK와 연동
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Padding for scroll comfort */}
          <div style={{ height: '24px' }} />
        </div>
      </div>
    </div>
  );
}
