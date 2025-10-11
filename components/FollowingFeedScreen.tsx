import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Heart, MessageCircle, Search, User, Star, Sparkles } from 'lucide-react';

interface FollowingFeedScreenProps {
  onNavigateBack?: () => void;
  onRefreshFeed?: () => void;
  onNavigateToUserProfile?: (userId: string) => void;
  onNavigateToRestaurantDetail?: (restaurantId: string) => void;
  onNavigateToReviewDetail?: (reviewId: string) => void;
  onLikeActivity?: (activityId: string) => void;
  onCommentActivity?: (activityId: string) => void;
  onNavigateToUserDiscovery?: () => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToSaved?: () => void;
}

interface RestaurantMini {
  id: string;
  name: string;
  rating: number;
  category: string;
  location: string;
}

interface ActivityData {
  id: string;
  type: 'review' | 'saved' | 'follow';
  userId: string;
  userNickname: string;
  timeAgo: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  restaurant?: RestaurantMini;
  reviewText?: string;
  followedUserId?: string;
  followedUserNickname?: string;
}

interface ActivityCardProps extends ActivityData {
  onUserClick?: () => void;
  onRestaurantClick?: () => void;
  onReviewClick?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  type,
  userNickname,
  timeAgo,
  likeCount,
  commentCount,
  isLiked = false,
  restaurant,
  reviewText,
  followedUserNickname,
  onUserClick,
  onRestaurantClick,
  onReviewClick,
  onLike,
  onComment
}) => {
  const getActivityText = () => {
    switch (type) {
      case 'review':
        return `${userNickname}님이 새로운 리뷰를 작성했어요!`;
      case 'saved':
        return `${userNickname}님이 새로운 맛집을 저장했어요!`;
      case 'follow':
        return `${userNickname}님이 ${followedUserNickname}님을 팔로우하기 시작했어요.`;
      default:
        return '';
    }
  };

  return (
    <div 
      className="bg-card rounded-lg p-4 border border-border"
      style={{
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Activity Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Profile Avatar */}
          <button
            onClick={onUserClick}
            className="flex-shrink-0 transition-all duration-200 hover:opacity-80 active:scale-95"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--primary)',
                minWidth: '32px',
                minHeight: '32px'
              }}
            >
              <User className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            </div>
          </button>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <button
              onClick={onUserClick}
              className="block transition-all duration-200 hover:opacity-80"
            >
              <h4
                className="truncate"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                {userNickname}
              </h4>
            </button>
          </div>
        </div>

        {/* Time */}
        <span
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)'
          }}
        >
          {timeAgo}
        </span>
      </div>

      {/* Activity Content */}
      <div className="mb-3">
        <p
          className="mb-3"
          style={{
            fontSize: 'var(--text-base)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)',
            lineHeight: '1.5'
          }}
        >
          {getActivityText()}
        </p>

        {/* Restaurant Mini Card */}
        {restaurant && (type === 'review' || type === 'saved') && (
          <button
            onClick={onRestaurantClick}
            className="w-full bg-background rounded-lg p-3 border border-border transition-all duration-200 hover:bg-muted active:scale-98"
            style={{
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Restaurant Thumbnail */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: 'var(--muted)',
                  minWidth: '48px',
                  minHeight: '48px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <span 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontFamily: 'var(--font-family-primary)'
                  }}
                >
                  🍲
                </span>
              </div>

              {/* Restaurant Info */}
              <div className="flex-1 min-w-0 text-left">
                <h5
                  className="truncate mb-1"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  {restaurant.name}
                </h5>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star 
                      className="w-4 h-4" 
                      style={{ color: 'var(--accent)', fill: 'var(--accent)' }} 
                    />
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontFamily: 'var(--font-family-primary)',
                        color: 'var(--accent)'
                      }}
                    >
                      {restaurant.rating}
                    </span>
                  </div>
                  
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    {restaurant.category}
                  </span>
                  
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    📍 {restaurant.location}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Review Text Summary */}
        {type === 'review' && reviewText && (
          <button
            onClick={onReviewClick}
            className="w-full mt-3 text-left"
          >
            <div 
              className="bg-muted rounded-lg p-3"
              style={{
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <p
                className="line-clamp-3"
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  lineHeight: '1.5'
                }}
              >
                "{reviewText}"
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Activity Footer */}
      {type !== 'follow' && (
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95 ${
              isLiked ? 'text-red-500' : ''
            }`}
            style={{
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: isLiked ? '#EF4444' : 'var(--muted-foreground)'
            }}
          >
            <Heart 
              className="w-4 h-4" 
              style={{ 
                color: isLiked ? '#EF4444' : 'var(--muted-foreground)',
                fill: isLiked ? '#EF4444' : 'transparent'
              }} 
            />
            <span>{likeCount}</span>
          </button>

          <button
            onClick={onComment}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
            style={{
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ onNavigateToUserDiscovery?: () => void }> = ({ 
  onNavigateToUserDiscovery 
}) => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Sparkles 
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
          아직 팔로잉 활동이 없어요!
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
          새로운 사람들을 찾아 팔로우하고 소식을 받아보세요.
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

export default function FollowingFeedScreen({
  onNavigateBack,
  onRefreshFeed,
  onNavigateToUserProfile,
  onNavigateToRestaurantDetail,
  onNavigateToReviewDetail,
  onLikeActivity,
  onCommentActivity,
  onNavigateToUserDiscovery,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToSaved
}: FollowingFeedScreenProps) {
  const [likedActivities, setLikedActivities] = useState<Set<string>>(new Set(['activity-1']));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sample activity data - i18n Ready
  const activitiesData: ActivityData[] = [
    {
      id: 'activity-1',
      type: 'review',
      userId: 'user-1',
      userNickname: '부산미식가',
      timeAgo: '2시간 전',
      likeCount: 12,
      commentCount: 3,
      isLiked: true,
      restaurant: {
        id: 'rest-1',
        name: '명동교자 본점',
        rating: 4.5,
        category: '한식',
        location: '명동'
      },
      reviewText: '정말 맛있는 만두집이에요! 특히 고기만두가 일품입니다. 국물도 진짜 깔끔하고 담백해요. 관광객들이 많지만 그럴만한 이유가 있는 것 같아요.'
    },
    {
      id: 'activity-2',
      type: 'saved',
      userId: 'user-2',
      userNickname: '김치박사',
      timeAgo: '5시간 전',
      likeCount: 8,
      commentCount: 1,
      isLiked: false,
      restaurant: {
        id: 'rest-2',
        name: '진미평양냉면',
        rating: 4.3,
        category: '냉면',
        location: '을지로'
      }
    },
    {
      id: 'activity-3',
      type: 'follow',
      userId: 'user-3',
      userNickname: 'Seoul_Foodie',
      timeAgo: '어제',
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      followedUserId: 'user-4',
      followedUserNickname: '젓가락달인'
    },
    {
      id: 'activity-4',
      type: 'review',
      userId: 'user-4',
      userNickname: '젓가락달인',
      timeAgo: '2일 전',
      likeCount: 25,
      commentCount: 7,
      isLiked: false,
      restaurant: {
        id: 'rest-3',
        name: '광화문국밥',
        rating: 4.7,
        category: '국밥',
        location: '광화문'
      },
      reviewText: '아침 일찍부터 영업하는 국밥집으로 유명해요. 선지해장국이 정말 깊은 맛이 나고, 밑반찬들도 하나하나 정성이 느껴집니다.'
    }
  ];

  const handleLike = (activityId: string) => {
    setLikedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
    onLikeActivity?.(activityId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      onRefreshFeed?.();
    }, 1000);
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
          팔로잉 피드
        </h1>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95 disabled:opacity-50"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="피드 새로고침"
        >
          <RefreshCw 
            className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ color: 'var(--foreground)' }} 
          />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activitiesData.length > 0 ? (
          <div style={{ padding: '16px' }}>
            <div className="space-y-4">
              {activitiesData.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  {...activity}
                  isLiked={likedActivities.has(activity.id)}
                  onUserClick={() => onNavigateToUserProfile?.(activity.userId)}
                  onRestaurantClick={() => activity.restaurant && onNavigateToRestaurantDetail?.(activity.restaurant.id)}
                  onReviewClick={() => onNavigateToReviewDetail?.(activity.id)}
                  onLike={() => handleLike(activity.id)}
                  onComment={() => onCommentActivity?.(activity.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState onNavigateToUserDiscovery={onNavigateToUserDiscovery} />
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
