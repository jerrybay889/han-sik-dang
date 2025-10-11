import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Heart, Share2, ShoppingCart, Star, ChevronRight, MessageCircle, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import businessInfoBanner from 'figma:asset/1283bc80b974d8721cf8da0ac28b9a49b369e6bf.png';

// Event banners for rolling carousel - i18n Ready
const eventBanners = [
  {
    id: '1',
    title: '메뉴 특가 이벤트!',
    subtitle: '대표 메뉴 주문시 사이드 메뉴 50% 할인',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d958?w=400&q=80',
    backgroundColor: 'var(--accent)',
    textColor: '#FFFFFF'
  },
  {
    id: '2',
    title: '배달 주문 혜택!',
    subtitle: '3만원 이상 주문시 음료 무료 증정',
    imageUrl: 'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=400&q=80',
    backgroundColor: 'var(--primary)',
    textColor: '#FFFFFF'
  },
  {
    id: '3',
    title: '단체 주문 할인',
    subtitle: '10인분 이상 주문시 특별 할인 혜택',
    imageUrl: 'https://images.unsplash.com/photo-1725280894731-e2a13315b870?w=400&q=80',
    backgroundColor: '#2B5F44',
    textColor: '#FFFFFF'
  }
];

type CategoryType = 'signature' | 'main-dishes' | 'sides' | 'beverages';

interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string; // CRITICAL ADDITION: Required description field
  imageUrl?: string;
  badges?: string[];
}

interface MenuCategory {
  id: CategoryType;
  categoryName: string;
  items: MenuItem[];
}

interface RestaurantDetailMenuScreenProps {
  onNavigateBack: () => void;
  onNavigateToCart: () => void;
  onNavigateToAIDetail?: (menuId: string, menuName: string) => void;
  restaurantId?: string;
}

// Enhanced Menu Categories with FULL descriptions - i18n Ready
const menuCategories: MenuCategory[] = [
  {
    id: 'signature',
    categoryName: '대표 메뉴',
    items: [
      {
        id: 'kalgu-1',
        name: '명품 칼국수',
        price: '₩10,000',
        description: '진한 닭 육수와 쫄깃한 수제 면발이 조화를 이루는 대표 메뉴입니다.',
        imageUrl: 'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=200&q=80',
        badges: ['추천', 'Best']
      },
      {
        id: 'mandu-1',
        name: '수제 물만두',
        price: '₩12,000',
        description: '얇은 피와 풍부한 속재료로 만든 정통 수제 만두로, 깊은 맛의 육수와 함께 제공됩니다.',
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&q=80',
        badges: ['추천']
      },
      {
        id: 'bibim-kalgu',
        name: '비빔칼국수',
        price: '₩11,000',
        description: '매콤달콤한 특제 비빔장과 쫄깃한 칼국수 면이 어우러진 별미입니다.'
      },
      {
        id: 'kimchi-kalgu',
        name: '김치칼국수',
        price: '₩12,000',
        description: '잘 익은 김치의 깊은 감칠맛과 칼국수가 만나 특별한 맛을 선사합니다.',
        badges: ['인기']
      }
    ]
  },
  {
    id: 'main-dishes',
    categoryName: '식사 메뉴',
    items: [
      {
        id: 'janchi-guksu',
        name: '잔치국수',
        price: '₩8,000',
        description: '옛날 그 맛 그대로의 따뜻한 잔치국수로, 깔끔한 멸치 육수가 일품입니다.'
      },
      {
        id: 'on-myeon',
        name: '온면',
        price: '₩9,000',
        description: '따뜻한 육수와 부드러운 면발로 든든한 한 끼 식사를 제공합니다.'
      },
      {
        id: 'naeng-myeon',
        name: '냉면',
        price: '₩13,000',
        description: '시원하고 상큼한 냉면으로 더운 날씨에 최적의 별미입니다.',
        imageUrl: 'https://images.unsplash.com/photo-1599608279765-0a71aec8bc14?w=200&q=80'
      },
      {
        id: 'mak-guksu',
        name: '막국수',
        price: '₩12,000',
        description: '메밀면의 고소함과 특제 양념이 어우러진 전통 막국수입니다.'
      },
      {
        id: 'so-myeon',
        name: '소면',
        price: '₩8,000',
        description: '부드럽고 깔끔한 소면으로 든든하면서도 가벼운 식사입니다.'
      }
    ]
  },
  {
    id: 'sides',
    categoryName: '사이드',
    items: [
      {
        id: 'gun-mandu',
        name: '군만두',
        price: '₩8,000',
        description: '바삭하게 구운 만두로 겉은 바삭하고 속은 촉촉한 최고의 사이드 메뉴입니다.',
        imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&q=80'
      },
      {
        id: 'jjin-mandu',
        name: '찐만두',
        price: '₩7,000',
        description: '부드럽게 쪄낸 만두로 담백하고 깔끔한 맛이 특징입니다.'
      },
      {
        id: 'wang-mandu',
        name: '왕만두',
        price: '₩15,000',
        description: '크고 속이 꽉 찬 왕만두로 든든한 한 끼 식사로도 충분합니다.'
      },
      {
        id: 'kimchi-mandu',
        name: '김치만두',
        price: '₩8,000',
        description: '잘 익은 김치가 들어간 특별한 만두로 매콤한 맛이 일품입니다.'
      }
    ]
  },
  {
    id: 'beverages',
    categoryName: '음료/주류',
    items: [
      {
        id: 'makgeolli',
        name: '막걸리',
        price: '₩5,000',
        description: '부드럽고 달콤한 전통 막걸리로 한식과 잘 어울리는 대표 전통주입니다.'
      },
      {
        id: 'soju',
        name: '소주',
        price: '₩4,000',
        description: '깔끔하고 시원한 소주로 모든 한식 메뉴와 완벽한 조화를 이룹니다.'
      },
      {
        id: 'beer',
        name: '맥주',
        price: '₩4,500',
        description: '시원한 생맥주로 칼국수와 만두의 깊은 맛을 더욱 돋보이게 합니다.'
      }
    ]
  }
];

export default function RestaurantDetailMenuScreen({
  onNavigateBack,
  onNavigateToCart,
  onNavigateToAIDetail,
  restaurantId = 'myeongdong-kyoja'
}: RestaurantDetailMenuScreenProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('signature');
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  const scrollToCategory = useCallback((categoryId: CategoryType) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleBannerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const bannerWidth = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / bannerWidth);
    setCurrentBannerIndex(newIndex);
  }, []);

  // Auto-scroll for banner carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerScrollRef.current) {
        const nextIndex = (currentBannerIndex + 1) % eventBanners.length;
        setCurrentBannerIndex(nextIndex);
        const bannerWidth = bannerScrollRef.current.offsetWidth;
        bannerScrollRef.current.scrollTo({
          left: nextIndex * bannerWidth,
          behavior: 'smooth'
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  const handleAddToCart = useCallback((itemId: string) => {
    console.log(`Added item ${itemId} to cart`);
    // Add to cart logic here
  }, []);

  const toggleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
  }, []);

  const handleCartNavigation = useCallback(() => {
    onNavigateToCart();
  }, [onNavigateToCart]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: '명동교자 - 모든 메뉴',
        text: '명동교자의 모든 메뉴를 확인해보세요!',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      console.log('링크가 클립보드에 복사되었습니다.');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ maxWidth: '390px', margin: '0 auto', backgroundColor: 'var(--background)' }}>
      {/* Global Header - i18n Ready */}
      <div 
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{ 
          backgroundColor: 'var(--background)', // Background / Primary
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)' // Elevation / Small
        }}
      >
        <button
          onClick={onNavigateBack}
          className="p-2 rounded-lg transition-colors duration-200 hover:bg-muted active:scale-95"
          style={{ 
            borderRadius: 'var(--radius-md)',
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>

        <h1 
          className="flex-1 text-center break-words min-w-0 px-4"
          style={{
            fontSize: 'var(--text-xl)', // H2 / Bold / 20px
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)', 
            color: 'var(--foreground)',
            lineHeight: '1.3'
          }}
        >
          모든 메뉴
        </h1>

        <button
          className="p-2 rounded-lg transition-colors duration-200 hover:bg-muted active:scale-95"
          style={{ 
            borderRadius: 'var(--radius-md)',
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="검색"
        >
          <Search className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Menu Category Tabs - Sticky, Horizontally Scrollable, i18n Ready */}
      <div 
        className="sticky top-[73px] z-40 border-b"
        style={{ 
          backgroundColor: 'var(--background)', // Background / Primary
          borderColor: 'var(--border)'
        }}
      >
        <div 
          ref={categoryTabsRef}
          className="flex overflow-x-auto scrollbar-hide px-4 py-3"
          style={{ gap: '12px' }}
        >
          {menuCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => scrollToCategory(category.id)}
              className="flex-shrink-0 px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-80 active:scale-95 whitespace-nowrap"
              style={{
                backgroundColor: activeCategory === category.id ? 'var(--primary)' : 'var(--secondary)',
                color: activeCategory === category.id ? '#FFFFFF' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)', // Body / Regular / 16px
                fontWeight: activeCategory === category.id ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                fontFamily: 'var(--font-family-primary)',
                minHeight: '44px' // Touch target
              }}
            >
              {category.categoryName}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Menu Item List */}
      <div className="flex-1 overflow-y-auto">
        {/* Rolling Event Banner Carousel - i18n Ready */}
        <div className="px-4 pt-6 pb-4">
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
                  className="flex-shrink-0 w-full snap-start cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: banner.backgroundColor,
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div className="relative h-full flex items-center justify-between p-6 overflow-hidden">
                    <div className="flex-1 z-10 min-w-0 pr-2">
                      <h3 
                        className="break-words"
                        style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-primary)',
                          color: banner.textColor,
                          marginBottom: '4px',
                          lineHeight: '1.3'
                        }}
                      >
                        {banner.title}
                      </h3>
                      <p 
                        className="break-words"
                        style={{
                          fontSize: 'var(--text-base)',
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
                      className="p-2 rounded-lg transition-colors duration-200 z-10"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
              ))}
            </div>
            
            {/* Banner indicators */}
            <div 
              className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex backdrop-blur-md px-3 py-1" 
              style={{ 
                gap: '6px', 
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
              }}
            >
              {eventBanners.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    borderRadius: 'var(--radius-xl)',
                    backgroundColor: index === currentBannerIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-6 space-y-8">
          {menuCategories.map((category, categoryIndex) => (
            <div key={category.id} id={`category-${category.id}`}>
              {/* Section Header - i18n Ready */}
              <h2 
                className="mb-6 break-words"
                style={{
                  fontSize: 'var(--text-lg)', // H3 / Bold / 18px
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                {category.categoryName}
              </h2>

              {/* Menu Items - ENHANCED with Card Visual Separation */}
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={item.id}>
                    {/* CRITICAL: Card with Background/Primary fill and Elevation/Small */}
                    <div 
                      className="p-4 rounded-lg transition-colors duration-200 hover:bg-muted/50"
                      style={{
                        backgroundColor: 'var(--background)', // Background / Primary for cards
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--elevation-sm)', // Elevation / Small for visual separation
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Menu Image Thumbnail - Fixed size, i18n Ready */}
                        {item.imageUrl ? (
                          <div className="flex-shrink-0">
                            <ImageWithFallback
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover"
                              style={{ borderRadius: 'var(--radius-lg)' }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="flex-shrink-0 w-16 h-16 bg-muted flex items-center justify-center"
                            style={{ borderRadius: 'var(--radius-lg)' }}
                          >
                            <div 
                              className="w-8 h-8 rounded-full"
                              style={{ backgroundColor: 'var(--muted-foreground)' }}
                            />
                          </div>
                        )}

                        {/* Menu Content - i18n Ready */}
                        <div className="flex-1 min-w-0">
                          {/* Menu Name & Badges */}
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h3 
                              className="break-words flex-1 min-w-0"
                              style={{
                                fontSize: 'var(--text-lg)', // H3 / Bold / 18px
                                fontWeight: 'var(--font-weight-medium)',
                                fontFamily: 'var(--font-family-primary)',
                                color: 'var(--foreground)',
                                lineHeight: '1.3'
                              }}
                            >
                              {item.name}
                            </h3>
                            
                            {/* Badges - i18n Ready */}
                            {item.badges && item.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 flex-shrink-0">
                                {item.badges.map((badge, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 rounded-full whitespace-nowrap"
                                    style={{
                                      fontSize: 'var(--text-sm)',
                                      fontFamily: 'var(--font-family-primary)',
                                      backgroundColor: badge === '추천' || badge === 'Best' ? 'var(--accent)' : 'var(--secondary)',
                                      color: badge === '추천' || badge === 'Best' ? '#FFFFFF' : 'var(--secondary-foreground)',
                                      borderRadius: 'var(--radius-xl)'
                                    }}
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price - i18n Ready */}
                          <p 
                            className="mb-2 whitespace-nowrap"
                            style={{
                              fontSize: 'var(--text-base)', // Body / Regular / 16px
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'var(--foreground)'
                            }}
                          >
                            {item.price}
                          </p>

                          {/* AI Guide Section - Foreign-friendly Guide, i18n Ready */}
                          <div 
                            className="mb-3 p-3 rounded-lg"
                            style={{
                              backgroundColor: 'rgba(26, 95, 122, 0.05)', // Primary color with low opacity
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid rgba(26, 95, 122, 0.1)'
                            }}
                          >
                            {/* AI Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                                style={{
                                  backgroundColor: 'var(--primary)',
                                  color: '#FFFFFF',
                                  borderRadius: 'var(--radius-xl)',
                                  fontSize: 'var(--text-sm)',
                                  fontFamily: 'var(--font-family-primary)'
                                }}
                              >
                                🤖 AI 설명
                              </span>
                            </div>
                            
                            {/* AI Description - 3 lines preview, i18n Ready */}
                            <p 
                              className="break-words"
                              style={{
                                fontSize: 'var(--text-sm)', // Small / Medium / 14px
                                fontFamily: 'var(--font-family-primary)',
                                color: 'var(--foreground)',
                                lineHeight: '1.4',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {item.description} 국물과 면을 함께 드시면 더욱 맛있습니다. 김치나 단무지와 함께 곁들여 드세요. 주문시 '매운맛 조절 가능'이라고 말씀하시면 됩니다.
                            </p>
                          </div>

                          {/* AI Guide Detail Button - i18n Ready */}
                          <button
                            onClick={() => onNavigateToAIDetail?.(item.id, item.name)}
                            className="px-4 py-2 rounded-lg border transition-colors duration-200 hover:bg-muted active:scale-95 flex items-center gap-2"
                            style={{
                              borderColor: 'var(--primary)',
                              color: 'var(--primary)',
                              borderRadius: 'var(--radius-lg)',
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              minHeight: '36px'
                            }}
                          >
                            <span className="whitespace-nowrap">자세히보기</span>
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CRITICAL ADDITION: Ad/Promotion Banner - Strategic placement, i18n Ready */}
                    {((categoryIndex === 1 && itemIndex === 1) || (categoryIndex === 3 && itemIndex === 1)) && (
                      <div 
                        className="mt-6 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: 'var(--accent)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: 'var(--radius-lg)'
                        }}
                      >
                        <div className="text-center">
                          <h3 
                            className="mb-2 break-words"
                            style={{
                              fontSize: 'var(--text-xl)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              color: '#FFFFFF',
                              lineHeight: '1.3'
                            }}
                          >
                            당신의 일에 AI를 연결하다
                          </h3>
                          <p 
                            className="break-words"
                            style={{
                              fontSize: 'var(--text-base)',
                              fontFamily: 'var(--font-family-primary)',
                              color: 'rgba(255, 255, 255, 0.9)',
                              lineHeight: '1.4'
                            }}
                          >
                            AI 추천 시스템으로 더 정확한 메뉴 선택을 경험해보세요
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CRITICAL CORRECTION: Add "전체 메뉴 보기" Button / Secondary after each category - i18n Ready */}
              <div className="mt-6">
                <button
                  className="w-full px-4 py-3 rounded-lg border transition-colors duration-200 hover:bg-muted active:scale-95"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    minHeight: '44px'
                  }}
                >
                  <span className="whitespace-nowrap">전체 메뉴 보기</span>
                </button>
              </div>
            </div>
          ))}

          {/* Business Information Update Banner - i18n Ready */}
          <div className="mx-4">
            <ImageWithFallback
              src={businessInfoBanner}
              alt="업체 정보 수정 및 각종 문의"
              className="w-full h-24 object-cover rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
              style={{ borderRadius: 'var(--radius-lg)' }}
            />
          </div>
        </div>
      </div>

      {/* CRITICAL CORRECTION: Bottom Fixed Action Bar - EXACT MATCH of 5.0_Restaurant_Detail_Home */}
      <div 
        className="sticky bottom-0 border-t"
        style={{ 
          backgroundColor: 'var(--background)', // Background / Primary
          borderColor: 'var(--border)',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)', // Elevation / Medium
          zIndex: 40
        }}
      >
        <div className="flex items-center justify-around py-2">
          {/* Discover Tab - i18n Ready */}
          <button
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-200 hover:text-foreground"
            style={{ 
              color: 'var(--muted-foreground)',
              minHeight: '44px'
            }}
          >
            <Search className="w-6 h-6 mb-1" />
            <span 
              className="truncate text-center"
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Discover
            </span>
          </button>

          {/* AI Concierge Tab - i18n Ready */}
          <button
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-200 hover:text-foreground"
            style={{ 
              color: 'var(--muted-foreground)',
              minHeight: '44px'
            }}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span 
              className="truncate text-center"
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              AI Concierge
            </span>
          </button>

          {/* Saved Tab - Active, i18n Ready */}
          <button
            className="flex flex-col items-center py-2 px-4 min-w-0 border-b-2 transition-colors duration-200"
            style={{ 
              color: 'var(--primary)',
              borderBottomColor: 'var(--primary)',
              minHeight: '44px'
            }}
          >
            <Heart className="w-6 h-6 mb-1" />
            <span 
              className="truncate text-center font-medium"
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Saved
            </span>
          </button>

          {/* MY Tab - i18n Ready */}
          <button
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors duration-200 hover:text-foreground"
            style={{ 
              color: 'var(--muted-foreground)',
              minHeight: '44px'
            }}
          >
            <User className="w-6 h-6 mb-1" />
            <span 
              className="truncate text-center"
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
    </div>
  );
}
