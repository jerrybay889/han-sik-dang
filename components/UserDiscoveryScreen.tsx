import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Search, X, MessageCircle, User, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UserDiscoveryScreenProps {
  onNavigateBack?: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: (userId: string) => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToSaved?: () => void;
}

interface UserProfile {
  id: string;
  nickname: string;
  bio: string;
  profileImage: string;
  isFollowing: boolean;
  reviewCount: number;
  savedCount: number;
  location?: string;
  interests?: string[];
}

interface UserCardProps extends UserProfile {
  onClick?: () => void;
  onFollow?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  nickname,
  bio,
  profileImage,
  isFollowing,
  reviewCount,
  savedCount,
  location,
  interests,
  onClick,
  onFollow
}) => {
  return (
    <div 
      className="bg-card rounded-lg p-4 border border-border cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98"
      style={{
        borderRadius: 'var(--radius-lg)',
        minHeight: '96px',
        backgroundColor: 'var(--card)'
      }}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <ImageWithFallback
            src={profileImage}
            alt={`${nickname} 프로필 이미지`}
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
                {nickname}
              </h3>
              {bio && (
                <p
                  className="text-muted-foreground line-clamp-2"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  {bio}
                </p>
              )}
            </div>

            {/* Follow Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFollow?.();
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98 ${
                isFollowing 
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
                backgroundColor: isFollowing ? 'var(--secondary)' : 'var(--primary)',
                color: isFollowing ? 'var(--secondary-foreground)' : '#FFFFFF',
                borderColor: isFollowing ? 'var(--border)' : 'transparent'
              }}
              aria-label={isFollowing ? '언팔로우' : '팔로우'}
            >
              {isFollowing ? '팔로잉' : '팔로우'}
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
              리뷰 {reviewCount}
            </span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              저장 {savedCount}
            </span>
            {location && (
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                📍 {location}
              </span>
            )}
          </div>

          {/* Interests Tags */}
          {interests && interests.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {interests.slice(0, 3).map((interest, index) => (
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

const EmptySearchState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Search 
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <h3
          className="mb-3"
          style={{
            fontSize: 'var(--text-xl)',
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
};

export default function UserDiscoveryScreen({
  onNavigateBack,
  onNavigateToUserProfile,
  onFollowUser,
  onUnfollowUser,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToSaved
}: UserDiscoveryScreenProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set(['user-trending-2']));

  // Sample trending/recommended users data - i18n Ready
  const trendingUsers: UserProfile[] = useMemo(() => [
    {
      id: 'user-trending-1',
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
      id: 'user-trending-2',
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
      id: 'user-trending-3',
      nickname: 'K-Food탐험가',
      bio: 'Exploring Korean food culture 🇰🇷 K-food lover from Canada!',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      isFollowing: false,
      reviewCount: 156,
      savedCount: 89,
      location: '강남',
      interests: ['K-Food', '문화체험', '여행']
    },
    {
      id: 'user-trending-4',
      nickname: '한옥맛집',
      bio: '한옥에서 먹는 전통 한식이 최고! 문화와 음식을 함께 즐기는 삶',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      isFollowing: false,
      reviewCount: 67,
      savedCount: 178,
      location: '인사동',
      interests: ['한옥', '전통', '문화']
    },
    {
      id: 'user-trending-5',
      nickname: '야식러버',
      bio: '밤늦게 먹는 한식이 제일 맛있어요! 야식 맛집 전문가 🌙',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      isFollowing: false,
      reviewCount: 234,
      savedCount: 567,
      location: '홍대',
      interests: ['야식', '치킨', '술집']
    }
  ], []);

  // Sample search results data - i18n Ready
  const sampleSearchResults: UserProfile[] = useMemo(() => [
    {
      id: 'user-search-1',
      nickname: '한식마니아',
      bio: '한식을 사랑하는 마음으로 매일 새로운 맛집을 탐험합니다!',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      isFollowing: false,
      reviewCount: 78,
      savedCount: 234,
      location: '서울',
      interests: ['한정식', '궁중요리', '전통']
    },
    {
      id: 'user-search-2',
      nickname: '맛집헌터',
      bio: '숨은 맛집을 찾아내는 것이 취미! 맛있는 곳이 있다면 알려주세요~',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      isFollowing: false,
      reviewCount: 45,
      savedCount: 123,
      location: '경기',
      interests: ['맛집탐방', '리뷰', '사진']
    }
  ], []);

  // Determine search mode and results
  const { searchMode, displayUsers } = useMemo(() => {
    if (!searchQuery.trim()) {
      return { searchMode: 'initial', displayUsers: trendingUsers };
    }
    
    if (searchQuery.includes('한식') || searchQuery.includes('맛집')) {
      return { searchMode: 'results', displayUsers: sampleSearchResults };
    }
    
    return { searchMode: 'empty', displayUsers: [] };
  }, [searchQuery, trendingUsers, sampleSearchResults]);

  // Update users with current following status
  const usersWithFollowStatus = useMemo(() => 
    displayUsers.map(user => ({
      ...user,
      isFollowing: followingUsers.has(user.id)
    })), [displayUsers, followingUsers]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleFollowUser = useCallback((userId: string) => {
    setFollowingUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        onUnfollowUser?.(userId);
      } else {
        newSet.add(userId);
        onFollowUser?.(userId);
      }
      return newSet;
    });
    
    console.log(`${followingUsers.has(userId) ? 'Unfollowed' : 'Followed'} user: ${userId}`);
  }, [followingUsers, onFollowUser, onUnfollowUser]);

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
          사용자 검색
        </h1>

        <div style={{ width: '44px' }} /> {/* Right spacer */}
      </div>

      {/* Search Input Section */}
      <div
        className="sticky top-14 z-40 bg-background border-b px-4 py-3"
        style={{
          borderColor: 'var(--border)'
        }}
      >
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
            style={{ color: 'var(--muted-foreground)' }} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="닉네임, 관심사 등으로 사용자 검색"
            className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-input-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              backgroundColor: 'var(--input-background)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-lg)',
              minHeight: '44px'
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted active:scale-95"
              style={{
                minHeight: '24px',
                minWidth: '24px'
              }}
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Initial State / Trending Users Section */}
        {searchMode === 'initial' && (
          <div style={{ padding: '16px' }}>
            <div className="mb-6">
              <h2
                className="mb-2"
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                추천 사용자
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                ���로운 팔로워를 찾아보세요!
              </p>
            </div>
            <div className="space-y-4">
              {usersWithFollowStatus.map((user) => (
                <UserCard
                  key={user.id}
                  {...user}
                  onClick={() => onNavigateToUserProfile?.(user.id)}
                  onFollow={() => handleFollowUser(user.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search Results Section */}
        {searchMode === 'results' && (
          <div style={{ padding: '16px' }}>
            <div className="mb-4">
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                '{searchQuery}' 검색 결과 {usersWithFollowStatus.length}명
              </p>
            </div>
            <div className="space-y-4">
              {usersWithFollowStatus.map((user) => (
                <UserCard
                  key={user.id}
                  {...user}
                  onClick={() => onNavigateToUserProfile?.(user.id)}
                  onFollow={() => handleFollowUser(user.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Search Results */}
        {searchMode === 'empty' && <EmptySearchState />}
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
          <button
            onClick={onNavigateToSaved}
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
          >
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
