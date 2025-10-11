import React from 'react';
import { ArrowLeft, RotateCcw, Search, RefreshCw, MessageCircle, Heart, User } from 'lucide-react';

interface SearchResultsEmptyProps {
  onNavigateBack: () => void;
  onNavigateToAI: () => void;
  onResetFilters: () => void;
  searchQuery?: string;
}

export default function SearchResultsEmpty({
  onNavigateBack,
  onNavigateToAI,
  onResetFilters,
  searchQuery = "매콤한 저녁 데이트"
}: SearchResultsEmptyProps) {

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3" style={{ minHeight: '44px' }}>
          <button
            onClick={onNavigateBack}
            className="flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full transition-colors duration-200 active:scale-95"
            style={{ borderRadius: 'var(--radius-xl)' }}
            aria-label="Go Back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          
          <div className="flex-1 text-center mx-4">
            <h1 
              className="text-foreground truncate"
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              검색 결과 없음
            </h1>
          </div>
          
          <button
            onClick={onNavigateToAI}
            className="flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full transition-colors duration-200 active:scale-95"
            style={{ borderRadius: 'var(--radius-xl)' }}
            aria-label="Refresh Search"
          >
            <RotateCcw className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content Area - Empty State */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-sm" style={{ gap: '24px' }}>
          
          {/* Empty State Icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 bg-muted rounded-full flex items-center justify-center"
              style={{ 
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--muted)'
              }}
            >
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
          </div>

          {/* Headline */}
          <h2 
            className="text-foreground mb-3"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-medium)',
              lineHeight: '1.4'
            }}
          >
            검색 결과가 없어요 😭
          </h2>

          {/* Subtext */}
          <div 
            className="text-muted-foreground mb-8"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-normal)',
              lineHeight: '1.5'
            }}
          >
            <p>"{searchQuery}"에 맞는 레스토랑을 찾을 수 없습니다.</p>
            <p>필터를 다시 조정하거나, 다른 검색어로 시도해보세요.</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3" style={{ gap: '12px' }}>
            {/* Primary Action - Reset Filters */}
            <button
              onClick={onResetFilters}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg transition-all duration-200 hover:bg-primary/90 active:scale-98"
              style={{
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                minHeight: '44px',
                color: '#FFFFFF'
              }}
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              필터 초기화
            </button>

            {/* Secondary Action - Try AI Concierge */}
            <button
              onClick={onNavigateToAI}
              className="w-full bg-secondary text-secondary-foreground border border-border py-3 px-4 rounded-lg transition-all duration-200 hover:bg-muted active:scale-98"
              style={{
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-normal)',
                minHeight: '44px'
              }}
            >
              AI 컨시어지에게 물어보기
            </button>
          </div>

          {/* Alternative Suggestions */}
          <div className="mt-8">
            <p 
              className="text-muted-foreground mb-4"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)'
              }}
            >
              이런 검색어는 어떠세요?
            </p>
            <div className="flex flex-wrap justify-center" style={{ gap: '8px' }}>
              {['김치찌개', '불고기', '비빔밥', '한식 뷔페'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => console.log(`Search for: ${suggestion}`)}
                  className="px-3 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-normal)',
                    minHeight: '36px'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="sticky bottom-0 z-40 bg-background border-t border-border" style={{ boxShadow: 'var(--elevation-sm)' }}>
        <div className="flex items-center justify-around py-2">
          {[
            { name: 'Discover', active: true, icon: Search },
            { name: 'AI Concierge', active: false, icon: MessageCircle },
            { name: 'Saved', active: false, icon: Heart },
            { name: 'MY', active: false, icon: User }
          ].map((tab) => (
            <button
              key={tab.name}
              className={`flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-300 ${
                tab.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{
                fontFamily: 'var(--font-family-primary)'
              }}
              onClick={() => {
                if (tab.name === 'AI Concierge') onNavigateToAI();
                console.log(`Navigate to ${tab.name}`);
              }}
            >
              <tab.icon className="w-6 h-6 mb-1" />
              <span className={tab.active ? 'font-medium' : ''} style={{ fontSize: 'var(--text-sm)' }}>
                {tab.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
