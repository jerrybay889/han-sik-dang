import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit3, Star, Image, Play, ThumbsUp, ChevronDown, Heart, Share2, Search, MessageCircle, User, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantDetailReviewListScreenProps {
  onNavigateBack: () => void;
  onNavigateToWriteReview: () => void;
  onNavigateToReviewDetail?: (reviewId: string) => void;
  onNavigateToAI?: () => void;
  restaurantId: string;
}

interface ReviewData {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  content: string;
  photos: string[];
  helpfulCount: number;
  isHelpful: boolean;
  hasPhotos: boolean;
  visitCount: number;
}

interface AIStrength {
  id: string;
  emoji: string;
  text: string;
  count: number;
  percentage: number;
}

export default function RestaurantDetailReviewListScreen({
  onNavigateBack,
  onNavigateToWriteReview,
  onNavigateToReviewDetail,
  onNavigateToAI,
  restaurantId
}: RestaurantDetailReviewListScreenProps) {
  const [sortBy, setSortBy] = useState<'recommended' | 'newest'>('recommended');
  const [showPhotosOnly, setShowPhotosOnly] = useState(false);
  const [selectedMenuFilter, setSelectedMenuFilter] = useState<string>('');
  const [selectedFeatureFilter, setSelectedFeatureFilter] = useState<string>('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  // Mock data for AI-analyzed strengths - i18n Ready
  const aiStrengths: AIStrength[] = [
    { id: 'taste', emoji: '😋', text: '맛이 좋았어요', count: 234, percentage: 85 },
    { id: 'clean', emoji: '✨', text: '깔끔해요', count: 201, percentage: 73 },
    { id: 'kind', emoji: '💝', text: '친절해요', count: 189, percentage: 68 },
    { id: 'spicy', emoji: '🌶️', text: '적당히 매워요', count: 156, percentage: 56 },
    { id: 'atmosphere', emoji: '🏮', text: '분위기 좋아요', count: 143, percentage: 52 },
    { id: 'portion', emoji: '🍽️', text: '양이 많아요', count: 128, percentage: 46 }
  ];

  // Mock data for photo/video reviews - i18n Ready  
  const photoVideoReviews = [
    { id: '1', type: 'photo', thumbnail: 'https://picsum.photos/150/150?random=21' },
    { id: '2', type: 'video', thumbnail: 'https://picsum.photos/150/150?random=22' },
    { id: '3', type: 'photo', thumbnail: 'https://picsum.photos/150/150?random=23' },
    { id: '4', type: 'photo', thumbnail: 'https://picsum.photos/150/150?random=24' },
    { id: '5', type: 'video', thumbnail: 'https://picsum.photos/150/150?random=25' },
    { id: '6', type: 'photo', thumbnail: 'https://picsum.photos/150/150?random=26' }
  ];

  // Mock data for menu filters - i18n Ready
  // Mock data for event banners - i18n Ready
  const eventBanners = [
    {
      id: '1',
      title: '겨울 특선 메뉴 출시',
      subtitle: '따뜻한 국물 요리로 추위를 이겨내세요',
      backgroundColor: 'var(--primary)',
      textColor: '#FFFFFF',
      imageUrl: 'https://picsum.photos/120/120?random=91',
      link: '/events/winter-special'
    },
    {
      id: '2',
      title: '신규 고객 20% 할인',
      subtitle: '첫 주문시 자동 할인 적용',
      backgroundColor: 'var(--accent)',
      textColor: '#FFFFFF',
      imageUrl: 'https://picsum.photos/120/120?random=92',
      link: '/events/new-customer'
    },
    {
      id: '3',
      title: '배달비 무료 이벤트',
      subtitle: '15,000원 이상 주문시 배달비 면제',
      backgroundColor: '#2E7D32',
      textColor: '#FFFFFF',
      imageUrl: 'https://picsum.photos/120/120?random=93',
      link: '/events/free-delivery'
    }
  ];

  const menuFilters = ['칼국수', '만두', '김치전', '막걸리', '된장찌개', '비빔밥'];
  const featureFilters = ['맛있어요', '친절해요', '깔끔해요', '양많아요', '빨라요', '저렴해요'];

  // Mock data for reviews - i18n Ready
  const reviewsData: ReviewData[] = [
    {
      id: '1',
      userName: '김미영',
      userAvatar: 'https://picsum.photos/40/40?random=31',
      rating: 5,
      date: '2024.10.03',
      content: '진짜 맛있어요! 칼국수 국물이 진하고 면발도 쫄깃해서 정말 만족스러웠습니다. 김치전도 바삭하고 막걸리와 정말 잘 어울려요. 사장님도 너무 친절하시고...',
      photos: ['https://picsum.photos/200/150?random=41', 'https://picsum.photos/200/150?random=42'],
      helpfulCount: 23,
      isHelpful: false,
      hasPhotos: true,
      visitCount: 3
    },
    {
      id: '2', 
      userName: 'John Smith',
      userAvatar: 'https://picsum.photos/40/40?random=32',
      rating: 4,
      date: '2024.10.02',
      content: 'Amazing authentic Korean food! The atmosphere is cozy and the staff is very helpful with recommendations. Perfect place for experiencing real Korean culture.',
      photos: [],
      helpfulCount: 15,
      isHelpful: true,
      hasPhotos: false,
      visitCount: 1
    },
    {
      id: '3',
      userName: '박준호',
      userAvatar: 'https://picsum.photos/40/40?random=33', 
      rating: 5,
      date: '2024.10.01',
      content: '오랜만에 정말 제대로 된 한식을 먹었네요. 특히 된장찌개가 어릴 때 할머니가 끓여주시던 그 맛이에요. 밑반찬도 다양하고 정갈해요.',
      photos: ['https://picsum.photos/200/150?random=43'],
      helpfulCount: 31,
      isHelpful: false,
      hasPhotos: true,
      visitCount: 7
    },
    {
      id: '4',
      userName: '이소영',
      userAvatar: 'https://picsum.photos/40/40?random=34',
      rating: 4,
      date: '2024.09.30',
      content: '점심시간에 방문했는데 웨이팅이 좀 있었어요. 하지만 기다린 보람이 있었습니다. 비빔밥이 정말 맛있고 고기도 부드러워요.',
      photos: ['https://picsum.photos/200/150?random=44', 'https://picsum.photos/200/150?random=45'],
      helpfulCount: 12,
      isHelpful: false,
      hasPhotos: true,
      visitCount: 2
    },
    {
      id: '5',
      userName: 'Emma Wilson',
      userAvatar: 'https://picsum.photos/40/40?random=35',
      rating: 5,
      date: '2024.09.29',
      content: 'Best Korean restaurant in the area! The owner explained each dish to us and made sure we had the authentic experience. Will definitely come back!',
      photos: [],
      helpfulCount: 8,
      isHelpful: true,
      hasPhotos: false,
      visitCount: 1
    },
    {
      id: '6',
      userName: '최동우',
      userAvatar: 'https://picsum.photos/40/40?random=36',
      rating: 4,
      date: '2024.09.28',
      content: '가족들과 함께 저녁에 방문했어요. 아이들도 좋아할 만한 메뉴가 많아서 좋았습니다. 다만 조금 짜긴 했어요.',
      photos: ['https://picsum.photos/200/150?random=46'],
      helpfulCount: 19,
      isHelpful: false,
      hasPhotos: true,
      visitCount: 1
    },
    {
      id: '7',
      userName: '정민수',
      userAvatar: 'https://picsum.photos/40/40?random=37',
      rating: 5,
      date: '2024.09.27',
      content: '회사 동료들과 회식으로 다녀왔는데 모두 만족했어요. 특히 막걸리가 정말 부드럽고 안주들과 조화가 완벽했습니다.',
      photos: ['https://picsum.photos/200/150?random=47', 'https://picsum.photos/200/150?random=48'],
      helpfulCount: 27,
      isHelpful: false,
      hasPhotos: true,
      visitCount: 4
    },
    {
      id: '8',
      userName: 'Sarah Kim',
      userAvatar: 'https://picsum.photos/40/40?random=38',
      rating: 4,
      date: '2024.09.26', 
      content: 'Lovely traditional Korean restaurant. The banchan was fresh and delicious. Service was quick and the atmosphere felt very authentic.',
      photos: [],
      helpfulCount: 6,
      isHelpful: false,
      hasPhotos: false,
      visitCount: 1
    }
  ];

  // Banner auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % eventBanners.length;
        
        if (bannerScrollRef.current) {
          const bannerWidth = bannerScrollRef.current.offsetWidth;
          bannerScrollRef.current.scrollTo({
            left: nextIndex * bannerWidth,
            behavior: 'smooth'
          });
        }
        
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [eventBanners.length]);

  const handleBannerScroll = () => {
    if (bannerScrollRef.current) {
      const scrollLeft = bannerScrollRef.current.scrollLeft;
      const bannerWidth = bannerScrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / bannerWidth);
      if (newIndex !== currentBannerIndex) {
        setCurrentBannerIndex(newIndex);
      }
    }
  };

  const toggleHelpful = (reviewId: string) => {
    // Implementation for helpful toggle
    console.log(`Toggle helpful for review: ${reviewId}`);
  };

  const handleMenuFilterSelect = (filter: string) => {
    setSelectedMenuFilter(selectedMenuFilter === filter ? '' : filter);
  };

  const handleFeatureFilterSelect = (filter: string) => {
    setSelectedFeatureFilter(selectedFeatureFilter === filter ? '' : filter);
  };

  const handleBottomNavClick = (section: 'discover' | 'ai' | 'saved' | 'profile') => {
    console.log(`Navigate to ${section}`);
    if (section === 'ai' && onNavigateToAI) {
      onNavigateToAI();
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Global Header - i18n Ready */}
      <div 
        className="sticky top-0 z-50 bg-background border-b flex items-center justify-between px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px'
        }}
      >
        {/* Back Arrow */}
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

        {/* Title - i18n Ready */}
        <h1 
          className="flex-1 text-center"
          style={{
            fontSize: 'var(--text-xl)', // H2 / Bold / 20px
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          리뷰 (1,234)
        </h1>

        {/* Write Review Button - i18n Ready */}
        <button
          onClick={onNavigateToWriteReview}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="리뷰 작성"
        >
          <Edit3 className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Rolling Event Banner Carousel - i18n Ready */}
        <div className="mx-4 mt-4 mb-6">
          <div className="relative">
            <div 
              ref={bannerScrollRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              onScroll={handleBannerScroll}
              style={{ height: '120px' }}
            >
              {eventBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="w-full flex-shrink-0 snap-start"
                >
                  <div 
                    className="relative h-full p-4 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: banner.backgroundColor,
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    <div className="flex items-center justify-between h-full">
                      <div className="flex-1 z-10">
                        <h3 
                          className="mb-2 break-words"
                          style={{
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: 'var(--font-family-primary)',
                            color: banner.textColor,
                            lineHeight: '1.3'
                          }}
                        >
                          {banner.title}
                        </h3>
                        <p 
                          className="break-words"
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: banner.textColor,
                            opacity: 0.9,
                            lineHeight: '1.4'
                          }}
                        >
                          {banner.subtitle}
                        </p>
                      </div>
                      
                      <button 
                        className="ml-4 p-2 rounded-lg transition-all duration-200 hover:bg-black hover:bg-opacity-20 active:scale-95"
                        style={{
                          borderRadius: 'var(--radius-md)',
                          minHeight: '44px',
                          minWidth: '44px'
                        }}
                        aria-label="자세히 보기"
                      >
                        <ChevronRight className="w-6 h-6" style={{ color: banner.textColor }} />
                      </button>
                      <div 
                        className="absolute right-0 top-0 w-24 h-full opacity-20"
                        style={{
                          backgroundImage: `url(${banner.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 'var(--radius-lg)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Indicators */}
            <div 
              className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex" 
              style={{ gap: '6px' }}
            >
              {eventBanners.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{ 
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: index === currentBannerIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        {/* AI Review Strengths Section - i18n Ready */}
        <div 
          className="bg-background p-4"
          style={{
            borderBottom: '1px solid var(--border)'
          }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)', 
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              이런 점이 좋았어요
            </h2>
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              총 276명 평가
            </span>
          </div>

          {/* AI Strengths Grid */}
          <div className="grid grid-cols-2 gap-3">
            {aiStrengths.map((strength) => (
              <div 
                key={strength.id}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{strength.emoji}</span>
                  <span 
                    className="flex-1"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {strength.text}
                  </span>
                  <span 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    {strength.count}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius-xl)'
                  }}
                >
                  <div 
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${strength.percentage}%`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-xl)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Expand Button - i18n Ready */}
          <button 
            className="w-full mt-4 p-3 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-98 flex items-center justify-center"
            style={{
              borderColor: 'var(--border)',
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
              더보기
            </span>
            <ChevronDown className="w-5 h-5 ml-2" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        {/* Photo/Video Review Section - i18n Ready */}
        <div 
          className="bg-background p-4"
          style={{
            borderBottom: '1px solid var(--border)'
          }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              사진·영상 리뷰
            </h2>
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              {photoVideoReviews.length}개
            </span>
          </div>

          {/* Photo/Video Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {photoVideoReviews.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <ImageWithFallback
                  src={item.thumbnail}
                  alt={`${item.type} review`}
                  className="w-full h-full object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: 'var(--radius-xl)'
                      }}
                    >
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* View All Button - i18n Ready */}
          <button 
            className="w-full p-3 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-98"
            style={{
              borderColor: 'var(--border)',
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
              사진·영상 전체 보기
            </span>
          </button>
        </div>

        {/* Google In-App Ad Banner - Strategic Placement, i18n Ready */}
        <div 
          className="p-4"
          style={{
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div 
            className="p-4 rounded-lg border-2 border-dashed text-center transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--secondary)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-lg)',
              minHeight: '100px'
            }}
          >
            {/* Ad Label */}
            <div className="mb-2">
              <span 
                className="px-2 py-1 rounded text-center"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  fontWeight: 'var(--font-weight-normal)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                광고
              </span>
            </div>

            {/* Google Ad Banner Placeholder */}
            <div 
              className="mx-auto border rounded"
              style={{
                width: '320px',
                height: '50px',
                maxWidth: '100%',
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="text-center">
                <div 
                  className="mb-1"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Google AdMob
                </div>
                <div 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Banner Ad Space
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Filtering Section - i18n Ready */}
        <div 
          className="bg-background p-4"
          style={{
            borderBottom: '1px solid var(--border)'
          }}
        >
          {/* Review Count & Photo Filter */}
          <div className="flex items-center justify-between mb-4">
            <h3 
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              리뷰 322
            </h3>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPhotosOnly}
                onChange={(e) => setShowPhotosOnly(e.target.checked)}
                className="sr-only"
              />
              <div 
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  showPhotosOnly ? 'border-primary bg-primary' : 'border-border'
                }`}
                style={{
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {showPhotosOnly && (
                  <div className="w-3 h-3 rounded bg-white" style={{ borderRadius: 'var(--radius-sm)' }} />
                )}
              </div>
              <span 
                className="ml-2"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                사진/영상 리뷰만
              </span>
            </label>
          </div>

          {/* Menu Filters - i18n Ready */}
          <div className="mb-3">
            <h4 
              className="mb-2"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              메뉴
            </h4>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {menuFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleMenuFilterSelect(filter)}
                  className={`px-3 py-2 rounded-full border whitespace-nowrap transition-all duration-200 hover:bg-muted active:scale-95 ${
                    selectedMenuFilter === filter ? 'border-primary bg-primary' : 'border-border'
                  }`}
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: selectedMenuFilter === filter ? '#FFFFFF' : 'var(--foreground)',
                    borderRadius: 'var(--radius-xl)',
                    minHeight: '36px'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Filters - i18n Ready */}
          <div>
            <h4 
              className="mb-2"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              특징
            </h4>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {featureFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFeatureFilterSelect(filter)}
                  className={`px-3 py-2 rounded-full border whitespace-nowrap transition-all duration-200 hover:bg-muted active:scale-95 ${
                    selectedFeatureFilter === filter ? 'border-accent bg-accent' : 'border-border'
                  }`}
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: selectedFeatureFilter === filter ? '#FFFFFF' : 'var(--foreground)',
                    borderRadius: 'var(--radius-xl)',
                    minHeight: '36px'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review List with Sort Options - i18n Ready */}
        <div className="bg-background">
          {/* Sort Options */}
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderBottom: '1px solid var(--border)'
            }}
          >
            <div className="flex gap-4">
              <button
                onClick={() => setSortBy('recommended')}
                className={`transition-all duration-200 ${
                  sortBy === 'recommended' ? 'font-medium' : ''
                }`}
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: sortBy === 'recommended' ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontWeight: sortBy === 'recommended' ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'
                }}
              >
                추천순
              </button>
              <span style={{ color: 'var(--muted-foreground)' }}>·</span>
              <button
                onClick={() => setSortBy('newest')}
                className={`transition-all duration-200 ${
                  sortBy === 'newest' ? 'font-medium' : ''
                }`}
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: sortBy === 'newest' ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontWeight: sortBy === 'newest' ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'
                }}
              >
                최신순
              </button>
            </div>
          </div>

          {/* Review Cards with Ads - i18n Ready */}
          <div>
            {reviewsData.map((review, index) => (
              <React.Fragment key={review.id}>
                {/* Review Card */}
                <div 
                  className="p-4 cursor-pointer transition-all duration-200 hover:bg-muted active:scale-98"
                  style={{
                    borderBottom: '1px solid var(--border)'
                  }}
                  onClick={() => onNavigateToReviewDetail && onNavigateToReviewDetail(review.id)}
                >
                  {/* User Info */}
                  <div className="flex items-center mb-3">
                    <div 
                      className="w-10 h-10 rounded-full overflow-hidden mr-3"
                      style={{
                        borderRadius: 'var(--radius-xl)'
                      }}
                    >
                      <ImageWithFallback
                        src={review.userAvatar}
                        alt={`${review.userName} avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--foreground)'
                          }}
                        >
                          {review.userName}
                        </span>
                        {review.visitCount > 1 && (
                          <span 
                            className="px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: 'var(--accent)',
                              color: '#FFFFFF',
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family-primary)',
                              borderRadius: 'var(--radius-xl)'
                            }}
                          >
                            {review.visitCount}번째 방문
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Star Rating */}
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`w-4 h-4 ${
                                starIndex < review.rating ? 'fill-current' : ''
                              }`}
                              style={{
                                color: starIndex < review.rating ? 'var(--accent)' : 'var(--muted-foreground)'
                              }}
                            />
                          ))}
                        </div>
                        
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
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-3">
                    <p 
                      className="break-words"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontFamily: 'var(--font-family-primary)',
                        color: 'var(--foreground)',
                        lineHeight: '1.5'
                      }}
                    >
                      {review.content}
                    </p>
                  </div>

                  {/* Review Photos */}
                  {review.photos.length > 0 && (
                    <div className="mb-3">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {review.photos.map((photo, photoIndex) => (
                          <div 
                            key={photoIndex}
                            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                            style={{
                              borderRadius: 'var(--radius-md)'
                            }}
                          >
                            <ImageWithFallback
                              src={photo}
                              alt={`Review photo ${photoIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Helpful Button */}
                  <button
                    onClick={() => toggleHelpful(review.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-95 ${
                      review.isHelpful ? 'border-primary bg-primary' : 'border-border'
                    }`}
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: review.isHelpful ? '#FFFFFF' : 'var(--foreground)',
                      borderRadius: 'var(--radius-md)',
                      minHeight: '36px'
                    }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>도움이 돼요 {review.helpfulCount}</span>
                  </button>
                </div>

                {/* Insert Ad after every 3 reviews */}
                {(index + 1) % 3 === 0 && index < reviewsData.length - 1 && (
                  <div 
                    className="p-4"
                    style={{
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div 
                      className="p-4 rounded-lg border-2 border-dashed text-center transition-transform duration-200 hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: 'var(--secondary)',
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        minHeight: '80px'
                      }}
                    >
                      {/* Ad Label */}
                      <div className="mb-2">
                        <span 
                          className="px-2 py-1 rounded text-center"
                          style={{
                            backgroundColor: 'var(--muted)',
                            color: 'var(--muted-foreground)',
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          광고
                        </span>
                      </div>

                      {/* Inline Ad Content */}
                      <div className="text-center">
                        <div 
                          className="mb-1"
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          Google AdMob Inline Ad #{Math.floor(index / 3) + 1}
                        </div>
                        <div 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          Native Ad Content Space
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar - Guidelines Compliant */}
      <div 
        className="sticky bottom-0 z-40 bg-background border-t border-border" 
        style={{ boxShadow: 'var(--elevation-sm)' }}
      >
        <div className="flex items-center justify-around py-2">
          <BottomNavItem 
            icon={Search}
            label="발견"
            isActive={false}
            onClick={() => handleBottomNavClick('discover')}
          />
          <BottomNavItem 
            icon={MessageCircle}
            label="AI 컨시어지"
            isActive={false}
            onClick={() => handleBottomNavClick('ai')}
          />
          <BottomNavItem 
            icon={Heart}
            label="저장"
            isActive={false}
            onClick={() => handleBottomNavClick('saved')}
          />
          <BottomNavItem 
            icon={User}
            label="MY"
            isActive={true}
            onClick={() => handleBottomNavClick('profile')}
          />
        </div>
      </div>
    </div>
  );
}

// Bottom Navigation Item Component - Guidelines Compliant
interface BottomNavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function BottomNavItem({ icon: Icon, label, isActive, onClick }: BottomNavItemProps) {
  return (
    <button 
      className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-300"
      onClick={onClick}
    >
      <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      <span 
        className={`${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`} 
        style={{ 
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family-primary)'
        }}
      >
        {label}
      </span>
    </button>
  );
}
