import React, { useState } from 'react';
import { ArrowLeft, Share, User, Heart, MessageCircle, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface Review {
  id: string;
  restaurantName: string;
  rating: number;
  content: string;
  date: string;
  images?: string[];
  isPublic: boolean;
}

interface SavedRestaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  address: string;
  imageUrl?: string;
  isPublic: boolean;
}

interface PublicProfileData {
  userId: string;
  nickname: string;
  bio: string;
  profileImageUrl?: string;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isOwnProfile: boolean;
}

interface MyPagePublicProfileScreenProps {
  onNavigateBack: () => void;
  onShareProfile: () => void;
  onFollowUser: (userId: string) => void;
  onUnfollowUser: (userId: string) => void;
  onNavigateToFollowers: (userId: string) => void;
  onNavigateToFollowing: (userId: string) => void;
  onNavigateToReviewDetail: (reviewId: string) => void;
  onNavigateToRestaurantDetail: (restaurantId: string) => void;
  onViewAllReviews: (userId: string) => void;
  onViewAllSaved: (userId: string) => void;
  onNavigateToMain: () => void;
  onNavigateToSearch: () => void;
  onNavigateToAI: () => void;
  onNavigateToDiscover: () => void;
  profileData: PublicProfileData;
}

// Sample data for demonstration
const sampleReviews: Review[] = [
  {
    id: 'review-1',
    restaurantName: '정남옥 구로디지털점',
    rating: 4.5,
    content: '진짜 맛있는 냉면집이에요! 물냉면이 특히 좋았고, 양도 많아서 배부르게 먹었습니다.',
    date: '2024.10.05',
    isPublic: true
  },
  {
    id: 'review-2',
    restaurantName: '한식당 강남점',
    rating: 5.0,
    content: '한국 전통 요리를 정말 잘하는 곳입니다. 특히 김치찌개가 일품이었어요.',
    date: '2024.10.03',
    isPublic: true
  },
  {
    id: 'review-3',
    restaurantName: '명동교자',
    rating: 4.0,
    content: '만두가 정말 맛있어요. 가격도 합리적이고 분위기도 좋습니다.',
    date: '2024.10.01',
    isPublic: true
  }
];

const sampleSavedRestaurants: SavedRestaurant[] = [
  {
    id: 'restaurant-1',
    name: '백년옥',
    category: '냉면·보쌈',
    rating: 4.6,
    address: '서울 중구 명동길 20-1',
    isPublic: true
  },
  {
    id: 'restaurant-2',
    name: '진진',
    category: '한정식',
    rating: 4.8,
    address: '서울 강남구 청담동 123-4',
    isPublic: true
  },
  {
    id: 'restaurant-3',
    name: '토속촌',
    category: '삼계탕',
    rating: 4.4,
    address: '서울 종로구 경복궁앞',
    isPublic: true
  }
];

export default function MyPagePublicProfileScreen({
  onNavigateBack,
  onShareProfile,
  onFollowUser,
  onUnfollowUser,
  onNavigateToFollowers,
  onNavigateToFollowing,
  onNavigateToReviewDetail,
  onNavigateToRestaurantDetail,
  onViewAllReviews,
  onViewAllSaved,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToDiscover,
  profileData
}: MyPagePublicProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'saved'>('reviews');

  const publicReviews = sampleReviews.filter(review => review.isPublic);
  const publicSavedRestaurants = sampleSavedRestaurants.filter(restaurant => restaurant.isPublic);

  const handleFollowToggle = () => {
    if (profileData.isFollowing) {
      onUnfollowUser(profileData.userId);
    } else {
      onFollowUser(profileData.userId);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
        style={{ fontSize: 'var(--text-sm)' }}
      >
        ★
      </span>
    ));
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        maxWidth: '390px', 
        margin: '0 auto',
        backgroundColor: 'var(--background)',
        fontFamily: 'var(--font-family-primary)'
      }}
    >
      {/* Global Header */}
      <header 
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
          minHeight: '44px'
        }}
      >
        {/* Back Button */}
        <button
          onClick={onNavigateBack}
          className="flex items-center justify-center transition-colors hover:bg-muted rounded-lg"
          style={{
            width: '44px',
            height: '44px',
            color: 'var(--foreground)'
          }}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* User Nickname */}
        <h1 
          className="font-medium text-center flex-1"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          {profileData.nickname}
        </h1>

        {/* Share Button */}
        <button
          onClick={onShareProfile}
          className="flex items-center justify-center transition-colors hover:bg-muted rounded-lg"
          style={{
            width: '44px',
            height: '44px',
            color: 'var(--foreground)'
          }}
          aria-label="프로필 공유"
        >
          <Share className="w-6 h-6" />
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Profile Info Section */}
        <section 
          className="flex flex-col items-center py-8 px-4"
          style={{
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {/* Profile Image */}
          <div 
            className="relative mb-4 rounded-full border-4 flex items-center justify-center overflow-hidden"
            style={{
              width: '100px',
              height: '100px',
              borderColor: 'var(--border)',
              backgroundColor: 'var(--muted)'
            }}
          >
            <User 
              className="w-12 h-12"
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>

          {/* Nickname */}
          <h2 
            className="mb-2"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            {profileData.nickname}
          </h2>

          {/* Bio */}
          <p 
            className="text-center mb-4 px-4"
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            {profileData.bio}
          </p>

          {/* Follow Button (Conditional) */}
          {!profileData.isOwnProfile && (
            <Button
              onClick={handleFollowToggle}
              variant={profileData.isFollowing ? "secondary" : "default"}
              className="mb-6"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                minHeight: '44px',
                backgroundColor: profileData.isFollowing ? 'var(--secondary)' : 'var(--primary)',
                color: profileData.isFollowing ? 'var(--secondary-foreground)' : '#FFFFFF'
              }}
            >
              {profileData.isFollowing ? '팔로잉' : '팔로우'}
            </Button>
          )}
        </section>

        {/* Follower/Following Counts Section */}
        <section 
          className="flex items-center justify-center gap-8 py-4 px-4"
          style={{
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <button
            onClick={() => onNavigateToFollowers(profileData.userId)}
            className="flex flex-col items-center transition-colors hover:opacity-80"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            <span 
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              {profileData.followerCount}
            </span>
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              팔로워
            </span>
          </button>

          <button
            onClick={() => onNavigateToFollowing(profileData.userId)}
            className="flex flex-col items-center transition-colors hover:opacity-80"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            <span 
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              {profileData.followingCount}
            </span>
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              팔로잉
            </span>
          </button>
        </section>

        {/* User Activity Tabs */}
        <section className="flex-1 flex flex-col">
          {/* Tab Bar */}
          <div 
            className="flex border-b"
            style={{
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)'
            }}
          >
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-4 transition-colors ${
                activeTab === 'reviews' 
                  ? 'border-b-2 border-primary' 
                  : 'border-b-2 border-transparent'
              }`}
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--muted-foreground)',
                minHeight: '44px'
              }}
            >
              리뷰
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-4 px-4 transition-colors ${
                activeTab === 'saved' 
                  ? 'border-b-2 border-primary' 
                  : 'border-b-2 border-transparent'
              }`}
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: activeTab === 'saved' ? 'var(--primary)' : 'var(--muted-foreground)',
                minHeight: '44px'
              }}
            >
              저장
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'reviews' && (
              <div className="p-4 space-y-4">
                {publicReviews.length > 0 ? (
                  <>
                    {publicReviews.slice(0, 3).map((review) => (
                      <Card 
                        key={review.id}
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onNavigateToReviewDetail(review.id)}
                        style={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 
                            style={{
                              fontSize: 'var(--text-base)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {review.restaurantName}
                          </h4>
                          <span 
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--muted-foreground)'
                            }}
                          >
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          {renderStars(review.rating)}
                          <span 
                            className="ml-2"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--muted-foreground)'
                            }}
                          >
                            {review.rating}
                          </span>
                        </div>
                        <p 
                          style={{
                            fontSize: 'var(--text-base)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--foreground)'
                          }}
                        >
                          {review.content}
                        </p>
                      </Card>
                    ))}
                    {publicReviews.length > 3 && (
                      <button
                        onClick={() => onViewAllReviews(profileData.userId)}
                        className="w-full py-3 text-center transition-colors hover:bg-muted rounded-lg"
                        style={{
                          fontSize: 'var(--text-base)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--primary)',
                          minHeight: '44px'
                        }}
                      >
                        전체보기
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <MessageCircle 
                      className="w-12 h-12 mb-4"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <p 
                      style={{
                        fontSize: 'var(--text-base)',
                        fontFamily: 'var(--font-family-primary)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      아직 공개된 리뷰가 없어요!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="p-4 space-y-4">
                {publicSavedRestaurants.length > 0 ? (
                  <>
                    {publicSavedRestaurants.slice(0, 3).map((restaurant) => (
                      <Card 
                        key={restaurant.id}
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onNavigateToRestaurantDetail(restaurant.id)}
                        style={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 
                            style={{
                              fontSize: 'var(--text-base)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {restaurant.name}
                          </h4>
                          <Heart className="w-5 h-5 text-red-500 fill-current" />
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="mb-2"
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)'
                          }}
                        >
                          {restaurant.category}
                        </Badge>
                        <div className="flex items-center mb-2">
                          {renderStars(restaurant.rating)}
                          <span 
                            className="ml-2"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--muted-foreground)'
                            }}
                          >
                            {restaurant.rating}
                          </span>
                        </div>
                        <p 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          {restaurant.address}
                        </p>
                      </Card>
                    ))}
                    {publicSavedRestaurants.length > 3 && (
                      <button
                        onClick={() => onViewAllSaved(profileData.userId)}
                        className="w-full py-3 text-center transition-colors hover:bg-muted rounded-lg"
                        style={{
                          fontSize: 'var(--text-base)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--primary)',
                          minHeight: '44px'
                        }}
                      >
                        전체보기
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Heart 
                      className="w-12 h-12 mb-4"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <p 
                      style={{
                        fontSize: 'var(--text-base)',
                        fontFamily: 'var(--font-family-primary)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      아직 공개된 저장 목록이 없어요!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav 
        className="sticky bottom-0 z-40 flex items-center justify-around py-2 border-t"
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)'
        }}
      >
        <button
          onClick={onNavigateToDiscover}
          className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors hover:text-foreground"
          style={{
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-family-primary)'
          }}
        >
          <Search className="w-6 h-6 mb-1" />
          <span style={{ fontSize: 'var(--text-sm)' }}>Discover</span>
        </button>

        <button
          onClick={onNavigateToAI}
          className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors hover:text-foreground"
          style={{
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-family-primary)'
          }}
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span style={{ fontSize: 'var(--text-sm)' }}>AI Concierge</span>
        </button>

        <button
          onClick={() => {/* Navigate to Saved */}}
          className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors hover:text-foreground"
          style={{
            color: 'var(--muted-foreground)',
            fontFamily: 'var(--font-family-primary)'
          }}
        >
          <Heart className="w-6 h-6 mb-1" />
          <span style={{ fontSize: 'var(--text-sm)' }}>Saved</span>
        </button>

        <button
          onClick={onNavigateToMain}
          className="flex flex-col items-center py-2 px-4 min-w-0 border-b-2 border-primary"
          style={{
            color: 'var(--primary)',
            fontFamily: 'var(--font-family-primary)'
          }}
        >
          <User className="w-6 h-6 mb-1" />
          <span 
            className="font-medium"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            MY
          </span>
        </button>
      </nav>
    </div>
  );
}
