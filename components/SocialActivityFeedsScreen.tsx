import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Search, User, Star, Users, Globe, TrendingUp, MapPin } from 'lucide-react';

interface SocialActivityFeedsScreenProps {
  onNavigateBack?: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
  onNavigateToRestaurantDetail?: (restaurantId: string) => void;
  onNavigateToUserDiscovery?: () => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToSaved?: () => void;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'ai' | 'trending' | 'local';
  title: string;
  time: string;
  likes: number;
  comments: number;
  restaurant?: {
    name: string;
    rating: number;
    category: string;
  };
}

export default function SocialActivityFeedsScreen({
  onNavigateBack,
  onNavigateToUserProfile,
  onNavigateToRestaurantDetail,
  onNavigateToUserDiscovery,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToSaved
}: SocialActivityFeedsScreenProps) {
  const [activeTab, setActiveTab] = useState<'following' | 'all'>('following');

  // Simplified mock data
  const followingActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'user',
      title: '서울미식가님이 새로운 리뷰를 작성했어요!',
      time: '2시간 전',
      likes: 12,
      comments: 3,
      restaurant: { name: '경복궁 한식당', rating: 4.8, category: '한식' }
    },
    {
      id: '2',
      type: 'user',
      title: '김치사랑님이 새로운 맛집을 저장했어요!',
      time: '4시간 전',
      likes: 8,
      comments: 1,
      restaurant: { name: '명동교자', rating: 4.6, category: '만두' }
    }
  ];

  const allActivities: ActivityItem[] = [
    {
      id: 'ai1',
      type: 'ai',
      title: 'AI 추천: 김치찌개 맛집 베스트 5',
      time: '30분 전',
      likes: 24,
      comments: 8,
      restaurant: { name: '할매집 김치찌개', rating: 4.9, category: '찌개/탕' }
    },
    {
      id: 't1',
      type: 'trending',
      title: '트렌딩: 이번 주 가장 인기 있는 레스토랑',
      time: '2시간 전',
      likes: 56,
      comments: 23,
      restaurant: { name: '장수갈비', rating: 4.8, category: '고기구이' }
    }
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ai': return <Star className="w-4 h-4" style={{ color: '#FFFFFF' }} />;
      case 'trending': return <TrendingUp className="w-4 h-4" style={{ color: '#FFFFFF' }} />;
      case 'local': return <MapPin className="w-4 h-4" style={{ color: '#FFFFFF' }} />;
      default: return <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'ai': return 'var(--accent)';
      case 'trending': return 'var(--chart-3)';
      case 'local': return 'var(--chart-2)';
      default: return 'var(--primary)';
    }
  };

  const ActivityCard = ({ activity }: { activity: ActivityItem }) => (
    <div 
      className="bg-card rounded-lg p-4 border border-border mb-4"
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: getColorForType(activity.type),
              minWidth: '32px',
              minHeight: '32px'
            }}
          >
            {getIconForType(activity.type)}
          </div>
          <h4
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            {activity.type === 'ai' || activity.type === 'trending' ? '한식당 AI' : '사용자'}
          </h4>
        </div>
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)'
          }}
        >
          {activity.time}
        </span>
      </div>

      {/* Content */}
      <p
        className="mb-3"
        style={{
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--foreground)',
          lineHeight: '1.5'
        }}
      >
        {activity.title}
      </p>

      {/* Restaurant Card */}
      {activity.restaurant && (
        <div 
          className="bg-background rounded-lg p-3 mb-3 border border-border"
          style={{
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--muted)',
                minWidth: '48px',
                minHeight: '48px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <span style={{ fontSize: 'var(--text-lg)' }}>🍲</span>
            </div>
            <div className="flex-1">
              <h5
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  marginBottom: '4px'
                }}
              >
                {activity.restaurant.name}
              </h5>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--accent)'
                    }}
                  >
                    {activity.restaurant.rating}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {activity.restaurant.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)'
          }}
        >
          <Heart className="w-4 h-4" />
          <span>{activity.likes}</span>
        </button>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)'
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{activity.comments}</span>
        </button>
      </div>
    </div>
  );

  const EmptyState = ({ type }: { type: 'following' | 'all' }) => (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        {type === 'following' ? (
          <Users className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--muted-foreground)' }} />
        ) : (
          <Globe className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--muted-foreground)' }} />
        )}
        <h3
          className="mb-3"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          {type === 'following' 
            ? '팔로우한 사용자들의 새로운 소식이 없어요!'
            : '아직 새로운 활동이 없어요!'
          }
        </h3>
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.5'
          }}
        >
          {type === 'following'
            ? '새로운 사용자를 팔로우하거나 활동을 시작해보세요.'
            : '주변의 다양한 맛집을 탐험하거나 리뷰를 남겨보세요.'
          }
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-card flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-3" style={{ minHeight: '44px' }}>
          <button
            onClick={onNavigateBack}
            className="flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full"
            style={{ borderRadius: 'var(--radius-xl)' }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            커뮤니티 피드
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[60px] z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex bg-secondary rounded-lg p-1" style={{ borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md ${
              activeTab === 'following' ? 'bg-primary text-white' : 'text-muted-foreground'
            }`}
            style={{
              minHeight: '44px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: activeTab === 'following' ? '#FFFFFF' : undefined
            }}
          >
            <Users className="w-5 h-5 mr-2" />
            팔로잉
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md ${
              activeTab === 'all' ? 'bg-primary text-white' : 'text-muted-foreground'
            }`}
            style={{
              minHeight: '44px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: activeTab === 'all' ? '#FFFFFF' : undefined
            }}
          >
            <Globe className="w-5 h-5 mr-2" />
            전체
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {activeTab === 'following' ? (
            followingActivities.length > 0 ? (
              followingActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <EmptyState type="following" />
            )
          ) : (
            <div>
              {/* AI 추천 Section */}
              <h3
                className="mb-4"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                AI 추천
              </h3>
              {allActivities.filter(a => a.type === 'ai').map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}

              {/* 트렌딩 Section */}
              <h3
                className="mb-4 mt-6"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                트렌딩
              </h3>
              {allActivities.filter(a => a.type === 'trending').map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}

              {/* 주변 지역 소식 Section */}
              <h3
                className="mb-4 mt-6"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                주변 지역 소식
              </h3>
              <div className="text-center py-8">
                <p
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  새로운 소식이 준비 중입니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 z-40 bg-background border-t border-border">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={onNavigateToSearch}
            className="flex flex-col items-center py-2 px-4 text-muted-foreground"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <Search className="w-6 h-6 mb-1" />
            <span style={{ fontSize: 'var(--text-sm)' }}>Discover</span>
          </button>
          <button 
            onClick={onNavigateToAI}
            className="flex flex-col items-center py-2 px-4 text-muted-foreground"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span style={{ fontSize: 'var(--text-sm)' }}>AI Concierge</span>
          </button>
          <button 
            onClick={onNavigateToSaved}
            className="flex flex-col items-center py-2 px-4 text-muted-foreground"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <Heart className="w-6 h-6 mb-1" />
            <span style={{ fontSize: 'var(--text-sm)' }}>Saved</span>
          </button>
          <button 
            className="flex flex-col items-center py-2 px-4 text-primary border-b-2 border-primary"
            style={{ fontFamily: 'var(--font-family-primary)' }}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="font-medium" style={{ fontSize: 'var(--text-sm)' }}>MY</span>
          </button>
        </div>
      </div>
    </div>
  );
}
