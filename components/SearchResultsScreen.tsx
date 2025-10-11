import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Filter, Grid3X3, Map, Star, Heart, MapPin, Search, MessageCircle, User, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import FilterOverlay from './FilterOverlay';
import SortDropdown from './SortDropdown';
import { InlineBannerAd } from './AdComponents';

interface SearchResultsScreenProps {
  onNavigateBack: () => void;
  onNavigateToDetail: (restaurantId: string) => void;
  onNavigateToAI: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: (userId: string) => void;
  searchQuery?: string;
}

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  description: string;
  priceRange: string;
  distance: string;
  imageUrl: string;
  isAIRecommended?: boolean;
  tags: string[];
}

interface UserProfile {
  id: string;
  nickname: string;
  bio?: string;
  profileImage: string;
  isFollowing: boolean;
  reviewCount: number;
  savedCount: number;
  location?: string;
  interests?: string[];
}

// Mock restaurant data
const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: '한국일식당',
    rating: 4.8,
    reviewCount: 234,
    category: '한식',
    description: '정통 한식을 현대적으로 재해석한 미쉐린 가이드 맛집',
    priceRange: '₩₩₩',
    distance: '0.3km',
    imageUrl: 'https://images.unsplash.com/photo-1661366394743-fe30fe478ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwZm9vZCUyMGJpYmltYmFwfGVufDF8fHx8MTc1OTU5MTUyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isAIRecommended: true,
    tags: ['매운맛', '데이트', '분위기 좋은']
  },
  {
    id: '2',
    name: '서울갈비',
    rating: 4.6,
    reviewCount: 189,
    category: '고기구이',
    description: '50년 전통의 갈비 전문점, SNS에서 화제',
    priceRange: '₩₩₩₩',
    distance: '0.5km',
    imageUrl: 'https://images.unsplash.com/photo-1749880191161-a7fcab31c4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBiYnElMjBnYWxiaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5NTkxNTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isAIRecommended: false,
    tags: ['고기', '가족모임', '전통']
  },
  {
    id: '3',
    name: '김치찌개 마을',
    rating: 4.4,
    reviewCount: 156,
    category: '찌개/탕',
    description: '할머니의 손맛을 그대로 재현한 김치찌개',
    priceRange: '₩₩',
    distance: '0.7km',
    imageUrl: 'https://images.unsplash.com/photo-1540138279543-b3728f037467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBraW1jaGklMjBqamlnYWUlMjBzb3VwfGVufDF8fHx8MTc1OTU5MTUzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    isAIRecommended: true,
    tags: ['매운맛', '든든한', '혼밥']
  }
];

// Mock user data
const mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    nickname: '서울미식가',
    bio: '한식 전문 블로거입니다. 전국 맛집을 찾아 떠나는 여행 중! 🍽️',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    isFollowing: false,
    reviewCount: 45,
    savedCount: 123,
    location: '서울',
    interests: ['한식', '카페', '디저트']
  },
  {
    id: 'user-2',
    nickname: '김치사랑',
    bio: '김치찌개는 사랑입니다 ❤️ 전통 한식을 현대적으로 해석하는 셰프',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    isFollowing: true,
    reviewCount: 89,
    savedCount: 234,
    location: '부산',
    interests: ['전통요리', '김치', '발효음식']
  },
  {
    id: 'user-3',
    nickname: 'K-Food탐험가',
    bio: '외국인 친구들에게 한국 음식을 소개하는 것이 취미예요!',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    isFollowing: false,
    reviewCount: 67,
    savedCount: 189,
    location: '경기',
    interests: ['K-Food', '외국인', '문화교류']
  }
];

interface UserCardProps {
  user: UserProfile;
  onUserClick: (userId: string) => void;
  onFollowClick: (userId: string, isFollowing: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onUserClick, onFollowClick }) => {
  return (
    <div 
      className="bg-card rounded-lg p-4 border border-border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98 mb-4 last:mb-0"
      style={{
        borderRadius: 'var(--radius-lg)',
        minHeight: '96px',
        backgroundColor: 'var(--card)'
      }}
      onClick={() => onUserClick(user.id)}
    >
      <div className="flex gap-3">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <ImageWithFallback
            src={user.profileImage}
            alt={`${user.nickname} 프로필 이미지`}
            className="w-12 h-12 rounded-full object-cover"
            style={{ 
              borderRadius: '50%',
              minWidth: '48px',
              minHeight: '48px'
            }}
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className="truncate mb-1"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                {user.nickname}
              </h3>
              {user.bio && (
                <p
                  className="text-muted-foreground line-clamp-2"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  {user.bio}
                </p>
              )}
            </div>

            {/* Follow Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollowClick(user.id, user.isFollowing);
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98 ${
                user.isFollowing 
                  ? 'bg-secondary text-secondary-foreground border border-border' 
                  : 'bg-primary text-white'
              }`}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                borderRadius: 'var(--radius-md)',
                minHeight: '36px',
                minWidth: '68px',
                backgroundColor: user.isFollowing ? 'var(--secondary)' : 'var(--primary)',
                color: user.isFollowing ? 'var(--secondary-foreground)' : '#FFFFFF',
                borderColor: user.isFollowing ? 'var(--border)' : 'transparent'
              }}
              aria-label={user.isFollowing ? '언팔로우' : '팔로우'}
            >
              {user.isFollowing ? '팔로잉' : '팔로우'}
            </button>
          </div>

          {/* Activity Stats */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              리뷰 {user.reviewCount}
            </span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              저장 {user.savedCount}
            </span>
            {user.location && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                📍 {user.location}
              </span>
            )}
          </div>

          {/* Interests Tags */}
          {user.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  #{interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SearchResultsScreen({
  onNavigateBack,
  onNavigateToDetail,
  onNavigateToAI,
  onNavigateToUserProfile,
  onFollowUser,
  onUnfollowUser,
  searchQuery = "매콤한 저녁 데이트"
}: SearchResultsScreenProps) {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'users'>('restaurants');
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list');
  const [sortOption, setSortOption] = useState('추천순');
  const [savedRestaurants, setSavedRestaurants] = useState<Set<string>>(new Set());
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set(['user-2']));
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  const handleSaveRestaurant = (restaurantId: string) => {
    const newSaved = new Set(savedRestaurants);
    if (newSaved.has(restaurantId)) {
      newSaved.delete(restaurantId);
    } else {
      newSaved.add(restaurantId);
    }
    setSavedRestaurants(newSaved);
  };

  const handleUserFollow = (userId: string, isCurrentlyFollowing: boolean) => {
    const newFollowing = new Set(followingUsers);
    if (isCurrentlyFollowing) {
      newFollowing.delete(userId);
      onUnfollowUser?.(userId);
    } else {
      newFollowing.add(userId);
      onFollowUser?.(userId);
    }
    setFollowingUsers(newFollowing);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // TODO: Apply filters to restaurant/user list
  };

  const handleSortSelect = (sortOption: string) => {
    setSortOption(sortOption);
    console.log('Selected sort:', sortOption);
    // TODO: Apply sorting to restaurant/user list
  };

  // Update user following status based on state
  const updatedUsers = mockUsers.map(user => ({
    ...user,
    isFollowing: followingUsers.has(user.id)
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortButtonRef.current && !sortButtonRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSortDropdown]);

  const renderRestaurantCard = (restaurant: Restaurant) => (
    <div
      key={restaurant.id}
      className="bg-card border border-border rounded-lg overflow-hidden mb-4 last:mb-0 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98"
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--elevation-sm)'
      }}
      onClick={() => onNavigateToDetail(restaurant.id)}
    >
      <div className="relative">
        {restaurant.isAIRecommended && (
          <div 
            className="absolute top-3 left-3 z-10 bg-accent text-white px-2 py-1 rounded-md"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: 'var(--radius-md)',
              color: '#FFFFFF'
            }}
          >
            AI 추천
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSaveRestaurant(restaurant.id);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-background active:scale-95"
          style={{ borderRadius: 'var(--radius-xl)' }}
          aria-label="Save Restaurant"
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              savedRestaurants.has(restaurant.id) 
                ? 'text-accent fill-accent' 
                : 'text-muted-foreground'
            }`} 
          />
        </button>
        <ImageWithFallback
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
      </div>
      
      <div className="p-4" style={{ gap: '8px' }}>
        <div className="flex items-start justify-between mb-2" style={{ gap: '8px' }}>
          <div className="flex-1">
            <h3 
              className="text-foreground mb-1"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                lineHeight: '1.4'
              }}
            >
              {restaurant.name}
            </h3>
            <div className="flex items-center mb-1" style={{ gap: '4px' }}>
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span 
                className="text-foreground"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {restaurant.rating}
              </span>
              <span 
                className="text-muted-foreground"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                ({restaurant.reviewCount})
              </span>
              <span 
                className="text-muted-foreground"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                • {restaurant.category}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="text-foreground mb-1"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              {restaurant.priceRange}
            </div>
            <div className="flex items-center text-muted-foreground" style={{ gap: '2px' }}>
              <MapPin className="w-3 h-3" />
              <span style={{ fontSize: 'var(--text-sm)' }}>
                {restaurant.distance}
              </span>
            </div>
          </div>
        </div>
        
        <p 
          className="text-muted-foreground mb-3"
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: '1.4'
          }}
        >
          {restaurant.description}
        </p>
        
        <div className="flex flex-wrap" style={{ gap: '6px' }}>
          {restaurant.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
              style={{
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Empty State Components
  const EmptyRestaurantsState = () => (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Search 
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
          검색 결과가 없어요!
        </h3>
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.5'
          }}
        >
          다른 검색어로 찾아보세요.
        </p>
      </div>
    </div>
  );

  const EmptyUsersState = () => (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Users 
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
          검색 결과가 없어요!
        </h3>
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.5'
          }}
        >
          다른 닉네임이나 관심사로 검색해보세요.
        </p>
      </div>
    </div>
  );

  if (showFilterOverlay) {
    return (
      <FilterOverlay
        onClose={() => setShowFilterOverlay(false)}
        onApplyFilters={handleApplyFilters}
      />
    );
  }

  return (
    <div className="min-h-screen bg-card flex flex-col" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Sticky Top Header with Search Input */}
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
          
          {/* Search Input */}
          <div className="flex-1 mx-3">
            <div 
              className="relative bg-input border border-border rounded-lg px-3 py-2 flex items-center"
              style={{
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--input-background)',
                minHeight: '40px'
              }}
            >
              <Search className="w-4 h-4 text-muted-foreground mr-2" />
              <input
                type="text"
                placeholder="레스토랑, 닉네임, 메뉴 검색"
                className="flex-1 bg-transparent border-none outline-none"
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
                defaultValue={searchQuery}
              />
            </div>
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

      {/* Tab Bar for Results */}
      <div className="sticky top-[72px] z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex bg-secondary rounded-lg p-1 border border-border" style={{ borderRadius: 'var(--radius-lg)' }}>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 active:scale-95 ${
              activeTab === 'restaurants'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
            style={{
              minHeight: '44px',
              borderRadius: 'var(--radius-md)',
              gap: '8px',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: activeTab === 'restaurants' ? '#FFFFFF' : undefined
            }}
          >
            <Search className="w-5 h-5" />
            레스토랑 {mockRestaurants.length}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 active:scale-95 ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
            style={{
              minHeight: '44px',
              borderRadius: 'var(--radius-md)',
              gap: '8px',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: activeTab === 'users' ? '#FFFFFF' : undefined
            }}
          >
            <Users className="w-5 h-5" />
            사용자 {updatedUsers.length}
          </button>
        </div>
      </div>

      {/* Conditional Filter & Sort Options for Restaurants */}
      {activeTab === 'restaurants' && (
        <>
          {/* Sticky Filter & Sort Options */}
          <div className="sticky top-[132px] z-40 bg-background border-b border-border px-4 py-3">
            <div className="flex items-center justify-between" style={{ gap: '16px' }}>
              <button
                onClick={() => setShowFilterOverlay(true)}
                className="flex items-center hover:bg-muted px-3 py-2 rounded-lg transition-colors duration-200 active:scale-95"
                style={{
                  minHeight: '44px',
                  borderRadius: 'var(--radius-lg)',
                  gap: '8px'
                }}
              >
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span 
                  className="text-muted-foreground"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)'
                  }}
                >
                  필터
                </span>
              </button>
              
              {/* Vertical Divider */}
              <div 
                className="w-px bg-border"
                style={{ height: '24px' }}
              ></div>
              
              <div className="relative">
                <button
                  ref={sortButtonRef}
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center hover:bg-muted px-3 py-2 rounded-lg transition-colors duration-200 active:scale-95"
                  style={{
                    minHeight: '44px',
                    borderRadius: 'var(--radius-lg)',
                    gap: '8px'
                  }}
                >
                  <Grid3X3 className="w-5 h-5 text-muted-foreground" />
                  <span 
                    className="text-muted-foreground"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    정렬: {sortOption}
                  </span>
                </button>
                
                {showSortDropdown && (
                  <SortDropdown
                    onClose={() => setShowSortDropdown(false)}
                    currentSort={sortOption}
                    onSortSelect={handleSortSelect}
                    buttonRef={sortButtonRef}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sticky Map/List View Toggle for Restaurants */}
          <div className="sticky top-[192px] z-40 bg-background border-b border-border px-4 py-3">
            <div className="flex bg-secondary rounded-lg p-1 border border-border" style={{ borderRadius: 'var(--radius-lg)' }}>
              <button
                onClick={() => setCurrentView('list')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 active:scale-95 ${
                  currentView === 'list'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
                style={{
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  gap: '8px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: currentView === 'list' ? '#FFFFFF' : undefined
                }}
              >
                <Grid3X3 className="w-5 h-5" />
                목록
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md transition-all duration-200 active:scale-95 ${
                  currentView === 'map'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
                style={{
                  minHeight: '44px',
                  borderRadius: 'var(--radius-md)',
                  gap: '8px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: currentView === 'map' ? '#FFFFFF' : undefined
                }}
              >
                <Map className="w-5 h-5" />
                지도
              </button>
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Dynamic Info Message based on active tab */}
          <div className="bg-card border border-border rounded-lg p-3 mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
            <p 
              className="text-foreground mb-1"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              jerry871님을 위한 맞춤 추천!
            </p>
            <p 
              className="text-muted-foreground"
              style={{ 
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              {activeTab === 'restaurants' 
                ? `총 ${mockRestaurants.length}개 검색 결과` 
                : `총 ${updatedUsers.length}명의 사용자`
              }
            </p>
          </div>

          {/* Results Section - Conditional content based on active tab */}
          {activeTab === 'restaurants' ? (
            // Restaurant Results
            currentView === 'list' ? (
              mockRestaurants.length > 0 ? (
                <div className="space-y-4">
                  {mockRestaurants.map((restaurant) => renderRestaurantCard(restaurant))}
                  
                  {/* Single Ad at the end */}
                  <InlineBannerAd 
                    title="한식 전문가 추천" 
                    subtitle="AI가 분석한 당신 취향의 맛집을 찾아보세요"
                    className="mt-4" 
                  />
                </div>
              ) : (
                <EmptyRestaurantsState />
              )
            ) : (
              // Map View Placeholder
              <div 
                className="bg-secondary border border-border rounded-lg flex items-center justify-center"
                style={{
                  height: '400px',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div className="text-center">
                  <Map className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p 
                    className="text-muted-foreground"
                    style={{ 
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    지도 뷰 준비 중
                  </p>
                </div>
              </div>
            )
          ) : (
            // User Results
            updatedUsers.length > 0 ? (
              <div className="space-y-4">
                {updatedUsers.map((user) => (
                  <UserCard 
                    key={user.id}
                    user={user}
                    onUserClick={(userId) => {
                      console.log(`Navigate to user profile: ${userId}`);
                      onNavigateToUserProfile?.(userId);
                    }}
                    onFollowClick={handleUserFollow}
                  />
                ))}
              </div>
            ) : (
              <EmptyUsersState />
            )
          )}
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="sticky bottom-0 z-40 bg-background border-t border-border" style={{ boxShadow: 'var(--elevation-sm)' }}>
        <div className="flex items-center justify-around py-2">
          <button 
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-300 text-primary border-b-2 border-primary"
            style={{
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="font-medium" style={{ fontSize: 'var(--text-sm)' }}>
              Discover
            </span>
          </button>
          <button 
            onClick={onNavigateToAI}
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-300 text-muted-foreground hover:text-foreground"
            style={{
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span style={{ fontSize: 'var(--text-sm)' }}>
              AI Concierge
            </span>
          </button>
          <button 
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-300 text-muted-foreground hover:text-foreground"
            style={{
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            <Heart className="w-6 h-6 mb-1" />
            <span style={{ fontSize: 'var(--text-sm)' }}>
              Saved
            </span>
          </button>
          <button 
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-300 text-muted-foreground hover:text-foreground"
            style={{
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            <User className="w-6 h-6 mb-1" />
            <span style={{ fontSize: 'var(--text-sm)' }}>
              MY
            </span>
          </button>
        </div>
      </div>

      {/* Filter Overlay */}
      {showFilterOverlay && (
        <FilterOverlay
          onClose={() => setShowFilterOverlay(false)}
          onApplyFilters={handleApplyFilters}
        />
      )}
    </div>
  );
}
