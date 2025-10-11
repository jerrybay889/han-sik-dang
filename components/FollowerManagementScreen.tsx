import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Users, Search, Heart, MessageCircle, User } from 'lucide-react';

interface FollowerManagementScreenProps {
  currentUserNickname?: string;
  onNavigateBack?: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: (userId: string) => void;
  onRemoveFollower?: (userId: string) => void;
  onNavigateToUserDiscovery?: () => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToSaved?: () => void;
  onShowMoreOptions?: () => void;
}

interface UserProfile {
  id: string;
  nickname: string;
  bio: string;
  reviewCount: number;
  savedCount: number;
  location?: string;
  isFollowingBack?: boolean;
}

interface UserCardProps extends UserProfile {
  mode: 'follower' | 'following';
  onClick?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onRemove?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  nickname,
  bio,
  reviewCount,
  savedCount,
  location,
  mode,
  isFollowingBack = false,
  onClick,
  onFollow,
  onUnfollow,
  onRemove
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
        {/* Profile Avatar */}
        <div className="flex-shrink-0">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--primary)',
              minWidth: '48px',
              minHeight: '48px'
            }}
          >
            <User className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </div>
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

            {/* Action Button */}
            <div className="flex gap-2">
              {mode === 'follower' ? (
                <>
                  {/* Follow/Following Button for Followers */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isFollowingBack ? onUnfollow?.() : onFollow?.();
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98 ${
                      isFollowingBack 
                        ? 'bg-secondary text-secondary-foreground border border-border' 
                        : 'bg-primary text-white'
                    }`}
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-md)',
                      minHeight: '36px',
                      minWidth: '60px',
                      backgroundColor: isFollowingBack ? 'var(--secondary)' : 'var(--primary)',
                      color: isFollowingBack ? 'var(--secondary-foreground)' : '#FFFFFF',
                      borderColor: isFollowingBack ? 'var(--border)' : 'transparent'
                    }}
                    aria-label={isFollowingBack ? '언팔로우' : '팔로우'}
                  >
                    {isFollowingBack ? '팔로잉' : '팔로우'}
                  </button>
                  {/* Remove Follower Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.();
                    }}
                    className="px-3 py-2 rounded-lg border border-border transition-all duration-200 hover:bg-muted active:scale-98"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-md)',
                      minHeight: '36px',
                      minWidth: '48px',
                      backgroundColor: 'transparent',
                      color: 'var(--muted-foreground)',
                      borderColor: 'var(--border)'
                    }}
                    aria-label="팔로워 삭제"
                  >
                    삭제
                  </button>
                </>
              ) : (
                /* Unfollow Button for Following */
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnfollow?.();
                  }}
                  className="px-3 py-2 rounded-lg bg-secondary border border-border transition-all duration-200 hover:bg-muted active:scale-98"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    borderRadius: 'var(--radius-md)',
                    minHeight: '36px',
                    minWidth: '80px',
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    borderColor: 'var(--border)'
                  }}
                  aria-label="팔로우 취소"
                >
                  팔로우 취소
                </button>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ mode: 'follower' | 'following'; onNavigateToUserDiscovery?: () => void }> = ({ 
  mode, 
  onNavigateToUserDiscovery 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Users 
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
          {mode === 'follower' ? '아직 팔로워가 없어요!' : '아직 팔로잉하는 사람이 없어요!'}
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
          새로운 사람들을 찾아 팔로우해보세요.
        </p>
        {onNavigateToUserDiscovery && (
          <button
            onClick={onNavigateToUserDiscovery}
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
            사용자 검색하기
          </button>
        )}
      </div>
    </div>
  );
};

export default function FollowerManagementScreen({
  currentUserNickname = "한식탐험가",
  onNavigateBack,
  onNavigateToUserProfile,
  onFollowUser,
  onUnfollowUser,
  onRemoveFollower,
  onNavigateToUserDiscovery,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToSaved,
  onShowMoreOptions
}: FollowerManagementScreenProps) {
  const [activeTab, setActiveTab] = useState<'follower' | 'following'>('follower');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set(['user-follower-2']));

  // Simplified sample data to prevent timeout issues
  const followersData: UserProfile[] = [
    {
      id: 'user-follower-1',
      nickname: '부산미식가',
      bio: '부산 전통시장 맛집 전문가! 할매 손맛을 찾아서 🍲',
      reviewCount: 89,
      savedCount: 234,
      location: '부산',
      isFollowingBack: false
    },
    {
      id: 'user-follower-2',
      nickname: '김치박사',
      bio: '김치의 모든 것을 알려드립니다. 발효음식 연구중 🥬',
      reviewCount: 156,
      savedCount: 89,
      location: '전주',
      isFollowingBack: true
    },
    {
      id: 'user-follower-3',
      nickname: 'Seoul_Foodie',
      bio: 'Korean food enthusiast from NYC! Love sharing Korean culture 🇰🇷',
      reviewCount: 234,
      savedCount: 456,
      location: '강남',
      isFollowingBack: false
    }
  ];

  const followingData: UserProfile[] = [
    {
      id: 'user-following-1',
      nickname: '궁중요리연구소',
      bio: '조선왕조 궁중요리를 현대적으로 재해석하는 연구소입니다 👑',
      reviewCount: 45,
      savedCount: 123,
      location: '서울',
      isFollowingBack: false
    },
    {
      id: 'user-following-2',
      nickname: '제주할머니',
      bio: '제주 토박이 할머니의 손맛을 전해드립니다 🌊',
      reviewCount: 234,
      savedCount: 89,
      location: '제주',
      isFollowingBack: false
    }
  ];

  const currentDisplayData = activeTab === 'follower' ? followersData : followingData;

  const handleFollowToggle = (userId: string) => {
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
  };

  const handleRemoveFollower = (userId: string) => {
    console.log(`Remove follower: ${userId}`);
    onRemoveFollower?.(userId);
  };

  const followerCount = followersData.length;
  const followingCount = followingData.length;

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
          {currentUserNickname}
        </h1>

        <button
          onClick={onShowMoreOptions}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="더보기 메뉴"
        >
          <MoreHorizontal className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Tab Bar */}
      <div
        className="sticky top-14 z-40 bg-background border-b"
        style={{
          borderColor: 'var(--border)'
        }}
      >
        <div className="flex" style={{ padding: '0 16px' }}>
          <button
            onClick={() => setActiveTab('follower')}
            className={`flex-1 py-4 text-center border-b-2 transition-all duration-200 ${
              activeTab === 'follower' ? 'border-primary' : 'border-transparent'
            }`}
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: activeTab === 'follower' ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: activeTab === 'follower' ? 'var(--primary)' : 'var(--muted-foreground)',
              minHeight: '44px'
            }}
          >
            팔로워 {followerCount}
          </button>
          
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 text-center border-b-2 transition-all duration-200 ${
              activeTab === 'following' ? 'border-primary' : 'border-transparent'
            }`}
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: activeTab === 'following' ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: activeTab === 'following' ? 'var(--primary)' : 'var(--muted-foreground)',
              minHeight: '44px'
            }}
          >
            팔로잉 {followingCount}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {currentDisplayData.length > 0 ? (
          <div style={{ padding: '16px' }}>
            <div className="space-y-4">
              {currentDisplayData.map((user) => (
                <UserCard
                  key={user.id}
                  {...user}
                  mode={activeTab}
                  isFollowingBack={followingUsers.has(user.id)}
                  onClick={() => onNavigateToUserProfile?.(user.id)}
                  onFollow={() => handleFollowToggle(user.id)}
                  onUnfollow={() => handleFollowToggle(user.id)}
                  onRemove={() => handleRemoveFollower(user.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState 
            mode={activeTab} 
            onNavigateToUserDiscovery={onNavigateToUserDiscovery}
          />
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
