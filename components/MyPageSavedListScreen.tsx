import React, { useState } from 'react';
import { ArrowLeft, Filter, Heart, Search, MessageCircle, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Switch } from './ui/switch';

interface MyPageSavedListScreenProps {
  onNavigateBack?: () => void;
  onNavigateToDetail?: (restaurantId: string) => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onUnsaveRestaurant?: (restaurantId: string) => void;
  userId?: string;
  defaultSavedListPublic?: boolean; // For setting default visibility based on privacy settings
}

interface SavedRestaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  priceRange: string;
  image: string;
  tags: string[];
  distance?: string;
  savedDate: string;
  personalNote?: string;
}

interface SortOptionType {
  id: 'newest' | 'nearest' | 'highest-rated';
  label: string;
  active: boolean;
}

const RestaurantCard: React.FC<SavedRestaurant & { 
  onClick?: () => void; 
  onUnsave?: () => void;
}> = ({ 
  name, 
  category, 
  rating, 
  priceRange, 
  image, 
  tags, 
  distance,
  personalNote,
  onClick,
  onUnsave
}) => {
  return (
    <div 
      className="bg-card rounded-lg p-4 border border-border cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-98"
      style={{
        borderRadius: 'var(--radius-lg)',
        minHeight: '120px'
      }}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0" onClick={onClick}>
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-20 h-20 rounded-lg object-cover"
            style={{ borderRadius: 'var(--radius-md)' }}
          />
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <div className="flex items-start justify-between mb-2">
            <h3
              className="truncate"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              {name}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnsave?.();
              }}
              className="p-1 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
              style={{ minHeight: '32px', minWidth: '32px' }}
              aria-label="저장 해제"
            >
              <Heart 
                className="w-5 h-5 flex-shrink-0" 
                style={{ 
                  color: 'var(--accent)', 
                  fill: 'var(--accent)' 
                }} 
              />
            </button>
          </div>
          <p
            className="mb-2"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            {category} • {priceRange}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                {rating}
              </span>
            </div>
            {distance && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                • {distance}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {personalNote && (
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
                💭 {personalNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{
  onNavigateToDiscover?: () => void;
}> = ({ onNavigateToDiscover }) => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Heart 
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
          아직 저장한 레스토랑이 없어요!
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
          새로운 맛집을 찾아보세요!
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
};

export default function MyPageSavedListScreen({
  onNavigateBack,
  onNavigateToDetail,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onUnsaveRestaurant,
  userId = "user-vip-123",
  defaultSavedListPublic = false // Default from user's privacy settings (6.1.2_My_Page_Privacy_Settings)
}: MyPageSavedListScreenProps) {
  const [activeSort, setActiveSort] = useState<'newest' | 'nearest' | 'highest-rated'>('newest');
  const [savedListPublic, setSavedListPublic] = useState<boolean>(defaultSavedListPublic);

  // Mock saved restaurants data - i18n Ready
  const savedRestaurants: SavedRestaurant[] = [
    {
      id: 'korean-garden',
      name: '한정식 정원',
      category: '한정식',
      rating: 4.6,
      priceRange: '₩₩₩',
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['정통', '고급', '접대'],
      distance: '0.8km',
      savedDate: '2024-10-01',
      personalNote: '회식 장소로 완벽! 서비스도 좋아요'
    },
    {
      id: 'seoul-kitchen',
      name: '서울 키친',
      category: '한식',
      rating: 4.4,
      priceRange: '₩₩',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['가정식', '편안한'],
      distance: '1.2km',
      savedDate: '2024-09-28'
    },
    {
      id: 'kimchi-house',
      name: '김치의 집',
      category: '한식',
      rating: 4.5,
      priceRange: '₩₩',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['김치찌개', '현지인'],
      distance: '2.1km',
      savedDate: '2024-09-25',
      personalNote: '김치찌개가 진짜 맛있어요!'
    },
    {
      id: 'bulgogi-bros',
      name: '불고기브라더스',
      category: '고기집',
      rating: 4.7,
      priceRange: '₩₩₩',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['불고기', '숯불'],
      distance: '0.5km',
      savedDate: '2024-09-20'
    },
    {
      id: 'tofu-village',
      name: '두부마을',
      category: '순두부',
      rating: 4.3,
      priceRange: '₩',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['순두부', '건강한'],
      distance: '1.8km',
      savedDate: '2024-09-15',
      personalNote: '아침식사로 자주 가는 곳'
    },
    {
      id: 'royal-palace',
      name: '궁중요리 맛집',
      category: '궁중요리',
      rating: 4.8,
      priceRange: '₩₩₩₩',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['궁중요리', '특별한날'],
      distance: '3.2km',
      savedDate: '2024-09-10'
    },
    {
      id: 'street-food',
      name: '길거리 떡볶이',
      category: '분식',
      rating: 4.2,
      priceRange: '₩',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d25a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      tags: ['떡볶이', '분식'],
      distance: '0.3km',
      savedDate: '2024-09-05',
      personalNote: '야식으로 최고!'
    }
  ];

  // Sort options - i18n Ready
  const sortOptions: SortOptionType[] = [
    { id: 'newest', label: '최신순', active: activeSort === 'newest' },
    { id: 'nearest', label: '가까운순', active: activeSort === 'nearest' },
    { id: 'highest-rated', label: '평점 높은순', active: activeSort === 'highest-rated' }
  ];

  // Sort restaurants based on active sort
  const sortedRestaurants = [...savedRestaurants].sort((a, b) => {
    switch (activeSort) {
      case 'newest':
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      case 'nearest':
        return parseFloat(a.distance?.replace('km', '') || '0') - parseFloat(b.distance?.replace('km', '') || '0');
      case 'highest-rated':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleUnsaveRestaurant = (restaurantId: string) => {
    onUnsaveRestaurant?.(restaurantId);
    console.log(`Unsaved restaurant: ${restaurantId}`);
  };

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
          나의 저장
        </h1>

        <div style={{ width: '44px' }} /> {/* Right spacer */}
      </div>

      {/* Saved List Visibility Control Section */}
      <div
        className="sticky top-14 z-40 bg-background border-b px-4 py-4"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--background)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            내 저장 목록 공개
          </span>
          <Switch
            checked={savedListPublic}
            onCheckedChange={(checked) => {
              setSavedListPublic(checked);
              console.log(`Saved list visibility changed to: ${checked ? 'public' : 'private'}`);
              // This would sync with the user's global privacy settings
            }}
            aria-label="저장 목록 공개 설정"
          />
        </div>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.5',
            margin: 0
          }}
        >
          이 토글을 켜면 내가 저장한 맛집 목록이 내 프로필 페이지에 노출되며, 다른 사용자에게도 보일 수 있습니다.
        </p>
      </div>

      {/* Filter & Sort Options */}
      <div
        className="sticky z-40 bg-background border-b px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          top: '148px' // Adjusted to account for header (56px) + visibility control section (~92px)
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveSort(option.id)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-98 ${
                  option.active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: option.active ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)',
                  borderRadius: 'var(--radius-lg)',
                  minHeight: '36px',
                  backgroundColor: option.active ? 'var(--primary)' : 'var(--muted)',
                  color: option.active ? '#FFFFFF' : 'var(--muted-foreground)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <button
            className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
            aria-label="필터"
            onClick={() => console.log('Open filter options')}
          >
            <Filter className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {sortedRestaurants.length > 0 ? (
          /* Saved Restaurant List */
          <div style={{ padding: '16px' }}>
            <div className="space-y-4">
              {sortedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  {...restaurant}
                  onClick={() => onNavigateToDetail?.(restaurant.id)}
                  onUnsave={() => handleUnsaveRestaurant(restaurant.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <EmptyState onNavigateToDiscover={onNavigateToMain} />
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
          <button className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors border-b-2 border-primary">
            <Heart className="w-6 h-6 mb-1" style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
            <span
              className="text-xs truncate font-medium"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--primary)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Saved
            </span>
          </button>
          <button
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
          >
            <User className="w-6 h-6 mb-1" style={{ color: 'var(--muted-foreground)' }} />
            <span
              className="text-xs truncate"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
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
