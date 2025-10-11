import React, { useState } from 'react';
import { Settings, ChevronRight, Star, Heart, MapPin, Gift, Bell, HelpCircle, Search, MessageCircle, User, Plus, Users, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MyPageHomeScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToReviews?: () => void;
  onNavigateToSaved?: () => void;
  onNavigateToVisits?: () => void;
  onNavigateToNotice?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToCoupons?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToCreateCollection?: () => void;
  onNavigateToBirthdayRegistration?: () => void;
  userId?: string;
}

interface UserProfile {
  id: string;
  nickname: string;
  profileImage: string;
  level: string;
  visitCount: number;
  reviewCount: number;
  savedCount: number;
  followers: number;
  following: number;
}

interface QuickLink {
  id: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
}

interface SavedRestaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  priceRange: string;
  distance: string;
  memo?: string;
}

interface ActivityTab {
  id: string;
  title: string;
  count: number;
  isActive: boolean;
}

export default function MyPageHomeScreen({
  onNavigateToSettings,
  onNavigateToReviews,
  onNavigateToSaved,
  onNavigateToVisits,
  onNavigateToNotice,
  onNavigateToSupport,
  onNavigateToProfile,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToCoupons,
  onNavigateToNotifications,
  onNavigateToCreateCollection,
  onNavigateToBirthdayRegistration,
  userId = "user-123"
}: MyPageHomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'search' | 'ai' | 'my'>('my');
  const [activeActivityTab, setActiveActivityTab] = useState<'saved' | 'reviews' | 'visits'>('saved');

  // Mock user profile data - i18n Ready (CatchTable style)
  const userProfile: UserProfile = {
    id: userId,
    nickname: "한식당VIP",
    profileImage: "https://images.unsplash.com/photo-1676899127445-b5aa21feafda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NTk2NzQ4OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "VIP 등급",
    visitCount: 12,
    reviewCount: 23,
    savedCount: 47,
    followers: 0,
    following: 0
  };

  // Activity tabs data - i18n Ready (CatchTable style)
  const activityTabs: ActivityTab[] = [
    {
      id: 'saved',
      title: '나의 저장',
      count: userProfile.savedCount,
      isActive: activeActivityTab === 'saved'
    },
    {
      id: 'reviews',
      title: '리뷰',
      count: userProfile.reviewCount,
      isActive: activeActivityTab === 'reviews'
    },
    {
      id: 'visits',
      title: '방문',
      count: userProfile.visitCount,
      isActive: activeActivityTab === 'visits'
    }
  ];

  // Quick links data - i18n Ready (Removed delivery/order elements)
  const quickLinks: QuickLink[] = [
    {
      id: 'notice',
      icon: <Bell className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />,
      title: '공지사항',
      description: '최신 업데이트와 이벤트 소식을 확인하세요',
      onClick: () => onNavigateToNotice?.()
    },
    {
      id: 'support',
      icon: <HelpCircle className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />,
      title: '고객센터',
      description: '궁금한 점이나 문의사항을 해결하세요',
      onClick: () => onNavigateToSupport?.()
    }
  ];

  // Event banner data - i18n Ready
  const eventBanner = {
    id: 'event-banner-1',
    title: '친구 초대하면 5,000원 할인!',
    subtitle: '지금 바로 친구를 초대해보세요',
    backgroundColor: 'var(--accent)',
    textColor: '#FFFFFF',
    link: '/events/invite-friends'
  };

  // Mock ad banner data - i18n Ready (Re-positioned)
  const adBanner = {
    id: 'mypage-ad-1',
    title: '저장 필수 맛집!',
    subtitle: '놓치면 후회할 맛집 리스트를 확인하세요',
    backgroundColor: 'var(--primary)',
    textColor: '#FFFFFF',
    link: '/events/must-save-restaurants'
  };

  // Bottom ad banner data - i18n Ready (New bottom placement)
  const bottomAdBanner = {
    id: 'mypage-ad-bottom',
    title: '한식당 프리미엄 멤버십',
    subtitle: '월 9,900원으로 더 많은 혜택을 누려보세요',
    backgroundColor: 'var(--accent)',
    textColor: '#FFFFFF',
    link: '/membership/premium'
  };

  // Saved restaurants data - i18n Ready (CatchTable style)
  const savedRestaurants: SavedRestaurant[] = [
    {
      id: 'saved-1',
      name: '고메스퀘어 신대방직영점',
      image: 'https://images.unsplash.com/photo-1723309157645-e9e710790d6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwcmVjb21tZW5kYXRpb25zfGVufDF8fHx8MTc1OTY3NTUyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.1,
      category: '다양한 음식들',
      priceRange: '2 - 4만원',
      distance: '0.8km',
      memo: '나만의 메모를 남겨보세요'
    },
    {
      id: 'saved-2',
      name: '한옥마을 비빔밥집',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBmb29kJTIwYmliaW1iYXB8ZW58MXx8fHwxNzU5Njc1NTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.5,
      category: '비빔밥',
      priceRange: '1 - 2만원',
      distance: '0.5km'
    },
    {
      id: 'saved-3',
      name: '명동 불고기 전문점',
      image: 'https://images.unsplash.com/photo-1709639681732-41abd75a23a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBidWxnb2dpJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTk2NzU1MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      rating: 4.8,
      category: '고기구이',
      priceRange: '3 - 5만원',
      distance: '1.2km'
    }
  ];

  const handleTabClick = (tab: 'main' | 'search' | 'ai' | 'my') => {
    setActiveTab(tab);
    switch (tab) {
      case 'main':
        onNavigateToMain?.();
        break;
      case 'search':
        onNavigateToSearch?.();
        break;
      case 'ai':
        onNavigateToAI?.();
        break;
      case 'my':
        // Stay on current page
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <div
        className="sticky top-0 z-50 bg-background flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <div style={{ width: '44px' }} /> {/* Left spacer */}

        <h1
          className="flex-1 text-center"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          마이 페이지
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToNotifications}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
            aria-label="알림"
          >
            <Bell className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
          </button>
          <button
            onClick={onNavigateToSettings}
            className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
            aria-label="설정"
          >
            <Settings className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        
        {/* User Profile Section - Enhanced with CatchTable style */}
        <div 
          className="p-4"
          style={{
            backgroundColor: 'var(--secondary)',
            padding: '16px'
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <ImageWithFallback
                src={userProfile.profileImage}
                alt={`${userProfile.nickname} 프로필 이미지`}
                className="w-16 h-16 rounded-full object-cover border-2"
                style={{
                  borderColor: 'var(--primary)'
                }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--accent)',
                  border: '2px solid var(--background)'
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    color: '#FFFFFF',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)'
                  }}
                >
                  V
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h2
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  marginBottom: '4px'
                }}
              >
                {userProfile.nickname}
              </h2>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)',
                  marginBottom: '4px'
                }}
              >
                {userProfile.level} · {userProfile.visitCount}회 방문
              </p>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                팔로워 {userProfile.followers} 팔로잉 {userProfile.following}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onNavigateToProfile}
              className="flex-1 p-3 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-98"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '44px'
              }}
            >
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                프로필 수정
              </span>
            </button>
            <button
              onClick={onNavigateToCoupons}
              className="flex items-center justify-center p-3 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-98"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '44px',
                minWidth: '100px'
              }}
            >
              <Gift className="w-5 h-5 mr-2" style={{ color: 'var(--accent)' }} />
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                쿠폰함
              </span>
            </button>
          </div>
        </div>

        {/* Birthday / Anniversary Registration Section */}
        <div style={{ padding: '16px' }}>
          <div 
            className="p-4 rounded-lg border"
            style={{
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--card)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                <div>
                  <h3
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '2px'
                    }}
                  >
                    특별한 날을 축하해드릴게요!
                  </h3>
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    생일이나 기념일을 등록하고 특별 혜택을 받으세요
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToBirthdayRegistration}
                className="px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  borderRadius: 'var(--radius-lg)',
                  minHeight: '36px'
                }}
              >
                등록하기
              </button>
            </div>
          </div>
        </div>

        {/* Event Banner */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: eventBanner.backgroundColor,
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: eventBanner.textColor,
                    marginBottom: '4px'
                  }}
                >
                  {eventBanner.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: eventBanner.textColor,
                    opacity: 0.9
                  }}
                >
                  {eventBanner.subtitle}
                </p>
              </div>
              <ChevronRight className="w-6 h-6" style={{ color: eventBanner.textColor }} />
            </div>
          </div>
        </div>

        {/* Activity Tabs Section */}
        <div style={{ padding: '16px' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
            {activityTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveActivityTab(tab.id as 'saved' | 'reviews' | 'visits')}
                className={`flex-1 py-3 px-4 transition-all duration-200 ${
                  tab.isActive ? 'border-b-2' : ''
                }`}
                style={{
                  borderColor: tab.isActive ? 'var(--primary)' : 'transparent',
                  minHeight: '44px'
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: tab.isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: tab.isActive ? 'var(--primary)' : 'var(--muted-foreground)'
                  }}
                >
                  {tab.title} ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content for Active Tab */}
        {activeActivityTab === 'saved' && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            {/* Collections Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  컬렉션
                </h3>
              </div>
              <button
                onClick={onNavigateToCreateCollection}
                className="w-full p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:bg-muted active:scale-98"
                style={{
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  minHeight: '60px'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    새 컬렉션 만들기
                  </span>
                </div>
              </button>
            </div>

            {/* Saved Restaurants Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  저장한 레스토랑
                </h3>
                <button
                  onClick={onNavigateToSaved}
                  className="transition-all duration-200 hover:text-primary active:scale-98"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  전체보기
                </button>
              </div>

              <div className="space-y-4">
                {savedRestaurants.slice(0, 2).map((restaurant, index) => (
                  <div key={restaurant.id}>
                    <div 
                      className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md active:scale-98 cursor-pointer"
                      style={{
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--card)'
                      }}
                    >
                      <div className="flex gap-4">
                        <ImageWithFallback
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          style={{
                            borderRadius: 'var(--radius-lg)'
                          }}
                        />
                        <div className="flex-1">
                          <h4
                            className="mb-2"
                            style={{
                              fontSize: 'var(--text-base)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {restaurant.name}
                          </h4>
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family-primary)',
                                color: 'var(--accent)'
                              }}
                            >
                              {restaurant.rating}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family-primary)',
                                color: 'var(--muted-foreground)'
                              }}
                            >
                              {restaurant.category} · {restaurant.priceRange}
                            </span>
                            <span
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family-primary)',
                                color: 'var(--muted-foreground)'
                              }}
                            >
                              {restaurant.distance}
                            </span>
                          </div>
                          {restaurant.memo && (
                            <p
                              className="mt-2"
                              style={{
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family-primary)',
                                color: 'var(--muted-foreground)',
                                fontStyle: 'italic'
                              }}
                            >
                              {restaurant.memo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Google In-App Ad Banner - After first restaurant */}
                    {index === 0 && (
                      <div className="my-4">
                        <div 
                          className="rounded-lg p-4"
                          style={{
                            backgroundColor: adBanner.backgroundColor,
                            borderRadius: 'var(--radius-lg)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3
                                style={{
                                  fontSize: 'var(--text-base)',
                                  fontWeight: 'var(--font-weight-medium)',
                                  fontFamily: 'var(--font-family-primary)',
                                  color: adBanner.textColor,
                                  marginBottom: '4px'
                                }}
                              >
                                {adBanner.title}
                              </h3>
                              <p
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  fontFamily: 'var(--font-family-primary)',
                                  color: adBanner.textColor,
                                  opacity: 0.9
                                }}
                              >
                                {adBanner.subtitle}
                              </p>
                            </div>
                            <div
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                fontSize: 'var(--text-sm)',
                                fontFamily: 'var(--font-family-primary)',
                                color: adBanner.textColor,
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
                              AD
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content for Reviews Tab */}
        {activeActivityTab === 'reviews' && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <h3
                className="mb-2"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                아직 작성한 리뷰가 없어요
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                방문한 레스토랑에 대한 첫 리뷰를 작성해보세요
              </p>
            </div>
          </div>
        )}

        {/* Content for Visits Tab */}
        {activeActivityTab === 'visits' && (
          <div style={{ padding: '0 16px 16px 16px' }}>
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <h3
                className="mb-2"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                방문 기록이 없어요
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                새로운 한식당을 방문하고 기록을 남겨보세요
              </p>
            </div>
          </div>
        )}

        {/* Quick Links Section (Simplified) */}
        <div style={{ padding: '16px' }}>
          <div className="space-y-2">
            {quickLinks.map((link, index) => (
              <button
                key={link.id}
                onClick={link.onClick}
                className={`w-full p-4 rounded-lg transition-all duration-200 hover:bg-muted active:scale-98 ${
                  index < quickLinks.length - 1 ? 'border-b' : ''
                }`}
                style={{
                  borderColor: index < quickLinks.length - 1 ? 'var(--border)' : 'transparent',
                  borderRadius: 'var(--radius-lg)',
                  minHeight: '44px'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {link.icon}
                    <div className="text-left">
                      <h4
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--foreground)',
                          marginBottom: link.description ? '2px' : '0'
                        }}
                      >
                        {link.title}
                      </h4>
                      {link.description && (
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          {link.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Google In-App Ad Banner - Final Placement */}
        <div style={{ padding: '16px' }}>
          <div 
            className="rounded-lg p-4"
            style={{
              backgroundColor: bottomAdBanner.backgroundColor,
              borderRadius: 'var(--radius-lg)',
              marginBottom: '16px'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: bottomAdBanner.textColor,
                    marginBottom: '4px'
                  }}
                >
                  {bottomAdBanner.title}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: bottomAdBanner.textColor,
                    opacity: 0.9
                  }}
                >
                  {bottomAdBanner.subtitle}
                </p>
              </div>
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: bottomAdBanner.textColor,
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                AD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - MY tab highlighted */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-background border-t flex items-center justify-around py-2"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--background)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: '390px',
          margin: '0 auto'
        }}
      >
        <button
          onClick={() => handleTabClick('main')}
          className={`flex flex-col items-center py-2 px-4 min-w-0 transition-all duration-200 hover:text-foreground active:scale-95 ${
            activeTab === 'main' ? 'text-primary border-b-2' : 'text-muted-foreground'
          }`}
          style={{
            borderColor: activeTab === 'main' ? 'var(--primary)' : 'transparent',
            fontFamily: 'var(--font-family-primary)',
            minHeight: '60px'
          }}
        >
          <Search className="w-6 h-6 mb-1" />
          <span
            className={activeTab === 'main' ? 'font-medium' : ''}
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            Discover
          </span>
        </button>

        <button
          onClick={() => handleTabClick('ai')}
          className={`flex flex-col items-center py-2 px-4 min-w-0 transition-all duration-200 hover:text-foreground active:scale-95 ${
            activeTab === 'ai' ? 'text-primary border-b-2' : 'text-muted-foreground'
          }`}
          style={{
            borderColor: activeTab === 'ai' ? 'var(--primary)' : 'transparent',
            fontFamily: 'var(--font-family-primary)',
            minHeight: '60px'
          }}
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span
            className={activeTab === 'ai' ? 'font-medium' : ''}
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            AI Concierge
          </span>
        </button>

        <button
          onClick={() => handleTabClick('search')}
          className={`flex flex-col items-center py-2 px-4 min-w-0 transition-all duration-200 hover:text-foreground active:scale-95 ${
            activeTab === 'search' ? 'text-primary border-b-2' : 'text-muted-foreground'
          }`}
          style={{
            borderColor: activeTab === 'search' ? 'var(--primary)' : 'transparent',
            fontFamily: 'var(--font-family-primary)',
            minHeight: '60px'
          }}
        >
          <Heart className="w-6 h-6 mb-1" />
          <span
            className={activeTab === 'search' ? 'font-medium' : ''}
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            Saved
          </span>
        </button>

        <button
          onClick={() => handleTabClick('my')}
          className={`flex flex-col items-center py-2 px-4 min-w-0 transition-all duration-200 hover:text-foreground active:scale-95 ${
            activeTab === 'my' ? 'text-primary border-b-2' : 'text-muted-foreground'
          }`}
          style={{
            borderColor: activeTab === 'my' ? 'var(--primary)' : 'transparent',
            fontFamily: 'var(--font-family-primary)',
            minHeight: '60px'
          }}
        >
          <User className="w-6 h-6 mb-1" />
          <span
            className={activeTab === 'my' ? 'font-medium' : ''}
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            MY
          </span>
        </button>
      </div>
    </div>
  );
}
