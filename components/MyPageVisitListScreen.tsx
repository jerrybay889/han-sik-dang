import React, { useState, useCallback } from 'react';
import { ArrowLeft, MapPin, Edit, Star, Search, MessageCircle, Heart, User } from 'lucide-react';

interface MyPageVisitListScreenProps {
  onNavigateBack?: () => void;
  onNavigateToDetail?: (restaurantId: string) => void;
  onAddMemo?: (visitId: string) => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToDiscover?: () => void;
  userId?: string;
}

interface Visit {
  id: string;
  date: string;
  time: string;
  dayOfWeek: string;
  restaurantName: string;
  restaurantId: string;
  category: string;
  rating: number;
  memo?: string;
  hasImage?: boolean;
}

interface MonthlyGroup {
  year: number;
  month: number;
  monthName: string;
  totalVisits: number;
  visits: Visit[];
}

const VisitCard = React.memo<Visit & {
  onNavigateToDetail?: () => void;
  onAddMemo?: () => void;
}>(({
  date,
  time,
  dayOfWeek,
  restaurantName,
  category,
  rating,
  memo,
  hasImage,
  onNavigateToDetail,
  onAddMemo
}) => {
  return (
    <div 
      className="bg-card rounded-lg border border-border p-4 transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{
        borderRadius: 'var(--radius-lg)'
      }}
      onClick={onNavigateToDetail}
    >
      <div className="flex items-start gap-3">
        {/* Optional Image Placeholder */}
        {hasImage && (
          <div
            className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <MapPin className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}

        {/* Visit Info */}
        <div className="flex-1 min-w-0">
          {/* Date & Time */}
          <p
            className="text-muted-foreground mb-1"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            {date} ({dayOfWeek}) {time}
          </p>

          {/* Restaurant Name */}
          <h4
            className="mb-1 truncate"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            {restaurantName}
          </h4>

          {/* Category & Rating */}
          <div className="flex items-center gap-2 mb-2">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              {category}
            </span>
            <div className="flex items-center gap-1">
              <Star 
                className="w-3 h-3" 
                style={{ 
                  color: 'var(--accent)', 
                  fill: 'var(--accent)' 
                }} 
              />
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--accent)'
                }}
              >
                {rating.toFixed(1)}점
              </span>
            </div>
          </div>

          {/* Memo */}
          {memo && (
            <div 
              className="mt-2 p-2 rounded-md"
              style={{
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)',
                  fontStyle: 'italic'
                }}
              >
                💭 {memo}
              </p>
            </div>
          )}
        </div>

        {/* Add Memo Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddMemo?.();
          }}
          className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '36px',
            minWidth: '36px'
          }}
          aria-label="메모 추가"
        >
          <Edit className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>
    </div>
  );
});

const MonthHeader = React.memo<{
  year: number;
  month: number;
  monthName: string;
  totalVisits: number;
}>(({ year, monthName, totalVisits }) => {
  return (
    <div className="mb-4">
      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--muted-foreground)'
        }}
      >
        {monthName} (총 {totalVisits}회 방문)
      </h3>
    </div>
  );
});

const EmptyState = React.memo<{
  onNavigateToDiscover?: () => void;
}>(({ onNavigateToDiscover }) => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <MapPin 
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <h3
          className="mb-3"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          아직 방문 기록이 없어요!
        </h3>
        <p
          className="mb-6"
          style={{
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.5'
          }}
        >
          새로운 곳을 방문해보세요!
        </p>
        <button
          onClick={onNavigateToDiscover}
          className="px-6 py-3 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98"
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px'
          }}
        >
          맛집 찾으러 가기
        </button>
      </div>
    </div>
  );
});

// Optimized mock visit history data - moved outside component for performance
const mockVisitHistory: MonthlyGroup[] = [
  {
    year: 2024,
    month: 10,
    monthName: '2024년 10월',
    totalVisits: 3,
    visits: [
      {
        id: 'visit-001',
        date: '2024.10.25',
        time: '19:00',
        dayOfWeek: '금',
        restaurantName: '한정식 정원',
        restaurantId: 'korean-garden',
        category: '한정식',
        rating: 4.6,
        memo: '가족 모임으로 방문',
        hasImage: true
      },
      {
        id: 'visit-002',
        date: '2024.10.18',
        time: '12:30',
        dayOfWeek: '금',
        restaurantName: '불고기브라더스',
        restaurantId: 'bulgogi-bros',
        category: '고기집',
        rating: 4.8,
        hasImage: true
      },
      {
        id: 'visit-003',
        date: '2024.10.12',
        time: '18:45',
        dayOfWeek: '토',
        restaurantName: '김치의 집',
        restaurantId: 'kimchi-house',
        category: '한식',
        rating: 4.2
      }
    ]
  },
  {
    year: 2024,
    month: 9,
    monthName: '2024년 9월',
    totalVisits: 2,
    visits: [
      {
        id: 'visit-004',
        date: '2024.09.28',
        time: '20:00',
        dayOfWeek: '토',
        restaurantName: '궁중요리 맛집',
        restaurantId: 'royal-palace',
        category: '궁중요리',
        rating: 4.9,
        memo: '생일 기념 방문',
        hasImage: true
      },
      {
        id: 'visit-005',
        date: '2024.09.15',
        time: '11:30',
        dayOfWeek: '일',
        restaurantName: '두부마을',
        restaurantId: 'tofu-village',
        category: '순두부',
        rating: 4.1
      }
    ]
  }
];

export default function MyPageVisitListScreen({
  onNavigateBack,
  onNavigateToDetail,
  onAddMemo,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToDiscover,
  userId = "user-vip-123"
}: MyPageVisitListScreenProps) {

  // Use the external data for better performance
  const visitHistory = mockVisitHistory;

  const handleVisitDetail = useCallback((restaurantId: string) => {
    onNavigateToDetail?.(restaurantId);
    console.log(`Navigate to restaurant detail: ${restaurantId}`);
  }, [onNavigateToDetail]);

  const handleAddMemo = useCallback((visitId: string) => {
    onAddMemo?.(visitId);
    console.log(`Add memo to visit: ${visitId}`);
  }, [onAddMemo]);

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        maxWidth: '390px',
        margin: '0 auto'
      }}
    >
      {/* Global Header */}
      <div
        className="sticky top-0 z-50 bg-background flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <button
          onClick={onNavigateBack}
          className="p-2 -ml-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>

        <h1
          className="flex-1 text-center"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          나의 방문
        </h1>

        <div style={{ width: '44px' }} /> {/* Right spacer */}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {visitHistory.length > 0 ? (
          /* Visit History Content */
          <div style={{ padding: '16px' }}>
            {visitHistory.map((monthGroup) => (
              <div key={`${monthGroup.year}-${monthGroup.month}`} className="mb-8">
                {/* Month Header */}
                <MonthHeader
                  year={monthGroup.year}
                  month={monthGroup.month}
                  monthName={monthGroup.monthName}
                  totalVisits={monthGroup.totalVisits}
                />

                {/* Visit Cards */}
                <div className="space-y-3">
                  {monthGroup.visits.map((visit) => (
                    <VisitCard
                      key={visit.id}
                      {...visit}
                      onNavigateToDetail={() => handleVisitDetail(visit.restaurantId)}
                      onAddMemo={() => handleAddMemo(visit.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <EmptyState onNavigateToDiscover={onNavigateToDiscover} />
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        className="sticky bottom-0 bg-background border-t"
        style={{
          borderColor: 'var(--border)',
          padding: '8px 0',
          zIndex: 40
        }}
      >
        <div className="flex items-center justify-around py-2">
          <button
            onClick={onNavigateToMain}
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
          >
            <Search className="w-6 h-6 mb-1" style={{ color: 'var(--muted-foreground)' }} />
            <span
              className="text-xs truncate"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Discover
            </span>
          </button>
          <button
            onClick={onNavigateToAI}
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
          >
            <MessageCircle className="w-6 h-6 mb-1" style={{ color: 'var(--muted-foreground)' }} />
            <span
              className="text-xs truncate"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              AI Concierge
            </span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors">
            <Heart className="w-6 h-6 mb-1" style={{ color: 'var(--muted-foreground)' }} />
            <span
              className="text-xs truncate"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Saved
            </span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors border-b-2 border-primary">
            <User className="w-6 h-6 mb-1" style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
            <span
              className="text-xs truncate font-medium"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--primary)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              MY
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
