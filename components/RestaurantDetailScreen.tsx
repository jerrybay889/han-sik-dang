import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Share2, Heart, Star, MapPin, Clock, Phone, Copy, ChevronRight, Edit3, ThumbsUp, Smile, Coffee, Users, Navigation, Calendar, Utensils, Camera, MessageSquare, Play, ExternalLink, ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import businessInfoBanner from 'figma:asset/1283bc80b974d8721cf8da0ac28b9a49b369e6bf.png';
import { BannerAd, InlineBannerAd } from './AdComponents';

interface RestaurantDetailScreenProps {
  onNavigateBack: () => void;
  onNavigateToMenu: () => void;
  onNavigateToReviews: () => void;
  onNavigateToWriteReview: () => void;
  onNavigateToPhotoList?: () => void;
  onNavigateToAI?: () => void;
  restaurantId?: string;
}

interface MenuItem {
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

interface VideoThumbnail {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views: string;
  thumbnail: string;
}

// Mock data - simplified
const restaurantData = {
  name: '명동교자',
  rating: 4.5,
  reviewCount: 1234,
  category: '칼국수, 만두',
  address: '서울 중구 명동9길 14',
  hours: '매일 11:00 - 22:00',
  phone: '02-776-5348',
  description: '미쉐린 가이드 선정, 쫄깃한 면발과 깊은 육수의 칼국수 맛집',
  website: 'www.myeongdonggyoja.com',
  features: ['와이파이', '주차가능', '카드결제', '포장가능'],
  isOpen: true
};

const galleryImages = [
  'https://images.unsplash.com/photo-1573470571028-a0ca7a723959?w=400&q=80',
  'https://images.unsplash.com/photo-1747228469031-c5fc60b9d9f9?w=400&q=80',
  'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=400&q=80',
  'https://images.unsplash.com/photo-1725280894731-e2a13315b870?w=400&q=80',
  'https://images.unsplash.com/photo-1599608279765-0a71aec8bc14?w=400&q=80'
];

// Menu categories with full data
const menuCategories = [
  {
    categoryName: '대표 메뉴',
    items: [
      { name: '칼국수', price: '₩10,000', description: '부드러운 면과 진한 닭 육수의 조화', imageUrl: 'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=200&q=80' },
      { name: '물만두', price: '₩12,000', description: '얇은 피와 풍부한 속이 일품인 수제 만두', imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&q=80' },
      { name: '비빔칼국수', price: '₩11,000', description: '매콤달콤한 비빔장과 쫄깃한 면발의 만남' },
      { name: '김치칼국수', price: '₩12,000', description: '김치의 매콤함이 일품인 특별한 칼국수' }
    ]
  },
  {
    categoryName: '면류',
    items: [
      { name: '잔치국수', price: '₩8,000', description: '옛날 그 맛 그대로의 잔치국수' },
      { name: '온면', price: '₩9,000', description: '따뜻한 육수와 쫄깃한 면' },
      { name: '냉면', price: '₩13,000', description: '시원하고 상큼한 냉면' },
      { name: '막국수', price: '₩12,000', description: '메밀면의 고소함이 살아있는 막국수' },
      { name: '소면', price: '₩8,000', description: '부드럽고 깔끔한 소면' }
    ]
  },
  {
    categoryName: '만두류',
    items: [
      { name: '군만두', price: '₩8,000', description: '바삭하게 구운 만두' },
      { name: '찐만두', price: '₩7,000', description: '부드럽게 쪄낸 만두' },
      { name: '왕만두', price: '₩15,000', description: '크고 속이 꽉 찬 왕만두' },
      { name: '김치만두', price: '₩8,000', description: '김치가 들어간 특별한 만두' }
    ]
  },
  {
    categoryName: '밥류',
    items: [
      { name: '김치볶음밥', price: '₩9,000', description: '김치의 감칠맛이 살아있는 볶음밥' },
      { name: '계란볶음밥', price: '₩8,000', description: '고소한 계란이 들어간 볶음밥' },
      { name: '새우볶음밥', price: '₩12,000', description: '싱싱한 새우가 들어간 볶음밥' }
    ]
  }
];

// Event banners for rolling carousel
const eventBanners = [
  {
    id: '1',
    title: '신��뉴 출시!',
    subtitle: '김치칼국수 런칭 기념 20% 할인',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d958?w=400&q=80',
    backgroundColor: 'var(--accent)',
    textColor: '#FFFFFF'
  },
  {
    id: '2',
    title: '배달 무료!',
    subtitle: '2만원 이상 주문시 배달비 무료',
    imageUrl: 'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=400&q=80',
    backgroundColor: 'var(--primary)',
    textColor: '#FFFFFF'
  },
  {
    id: '3',
    title: '단체 예약 할인',
    subtitle: '10인 이상 예약시 특별 할인 혜택',
    imageUrl: 'https://images.unsplash.com/photo-1725280894731-e2a13315b870?w=400&q=80',
    backgroundColor: '#2B5F44',
    textColor: '#FFFFFF'
  }
];

const mockReviews: Review[] = [
  {
    id: '1',
    userName: '김민수',
    rating: 5,
    comment: '정말 맛있어요! 칼국수 육수가 깊고 진해서 너무 좋았습니다.',
    date: '2024.10.01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '2', 
    userName: '박지연',
    rating: 4,
    comment: '오래된 맛집답게 변함없는 맛이에요. 웨이팅이 좀 있어요.',
    date: '2024.09.28',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b787?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '3',
    userName: '이철호',
    rating: 5,
    comment: '가족과 함께 갔는데 모두 만족했어요. 특히 비빔국수가 일품!',
    date: '2024.09.25',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '4',
    userName: '최수진',
    rating: 4,
    comment: '깔끔하고 맛있네요. 다만 양이 좀 적어서 아쉬워요.',
    date: '2024.09.22',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
  },
  {
    id: '5',
    userName: '장영호',
    rating: 5,
    comment: '30년 전통이 느껴지는 진짜 맛집입니다. 강력 추천!',
    date: '2024.09.20',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face'
  }
];

const shortFormReviews = [
  { tag: '분위기 좋아요', icon: Coffee, count: 142, isHighlighted: true },
  { tag: '깔끔해요', icon: ThumbsUp, count: 98, isHighlighted: false },
  { tag: '가성비 최고', icon: Smile, count: 87, isHighlighted: true },
  { tag: '맛있어요', icon: Heart, count: 156, isHighlighted: true }
];

const youtubeVideos: VideoThumbnail[] = [
  {
    id: '1',
    title: '명동교자 칼국수 맛집 리뷰',
    channel: '먹방유튜버김치',
    duration: '12:34',
    views: '15만',
    thumbnail: 'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=300&q=80'
  },
  {
    id: '2',
    title: '미쉐린 맛집의 비밀',
    channel: '서울맛집탐방',
    duration: '8:45',
    views: '8.3만',
    thumbnail: 'https://images.unsplash.com/photo-1573470571028-a0ca7a723959?w=300&q=80'
  },
  {
    id: '3',
    title: '외국인이 극찬한 한국 전통맛',
    channel: 'K-Food Explorer',
    duration: '15:22',
    views: '22만',
    thumbnail: 'https://images.unsplash.com/photo-1747228469031-c5fc60b9d9f9?w=300&q=80'
  },
  {
    id: '4',
    title: '한국 전통 소울푸드의 진짜 맛',
    channel: '맛집헌터',
    duration: '10:15',
    views: '12.7만',
    thumbnail: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&q=80'
  }
];

const nearbyRestaurants = [
  {
    id: '1',
    name: '월담비 문래본점',
    tags: ['전국 3대 택배김치 착한', '가성비 좋은', '맛집'],
    rating: 5.0,
    reviewCount: 5409,
    distance: '이 장소에서 1.6km',
    image: 'https://images.unsplash.com/photo-1692103675608-6e635afa077b?w=300&q=80'
  },
  {
    id: '2',
    name: '미나리생삼겹',
    tags: ['신림돼지 어떤집한지', '가성비'],
    rating: 4.9,
    reviewCount: 1683,
    distance: '이 장소에서 2.9km',
    image: 'https://images.unsplash.com/photo-1708388064424-e7673d7e5959?w=300&q=80'
  },
  {
    id: '3',
    name: '홍대곱창볶음지갈비',
    tags: ['돼지고기', '등갈비 상도동'],
    rating: 4.8,
    reviewCount: 935,
    distance: '이 장소에서 2.1km',
    image: 'https://images.unsplash.com/photo-1573470571028-a0ca7a723959?w=300&q=80'
  },
  {
    id: '4',
    name: '은성숯불갈비 봉천점',
    tags: ['돼지고기', '관악구 봉천동'],
    rating: 4.7,
    reviewCount: 619,
    distance: '이 장소에서 3.6km',
    image: 'https://images.unsplash.com/photo-1676686997059-fb817ebbb2b5?w=300&q=80'
  }
];

type TabType = '홈' | '소식' | '메뉴' | '리뷰' | '사진' | '주변';

export default function RestaurantDetailScreen({
  onNavigateBack,
  onNavigateToMenu,
  onNavigateToReviews,
  onNavigateToWriteReview,
  onNavigateToPhotoList,
  onNavigateToAI,
  restaurantId = 'myeongdong-kyoja'
}: RestaurantDetailScreenProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('홈');
  const [nearbyPage, setNearbyPage] = useState(1);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const restaurantInfoRef = useRef<HTMLDivElement>(null);
  const bannerScrollRef = useRef<HTMLDivElement>(null);

  const handleImageScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const imageWidth = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / imageWidth);
    setCurrentImageIndex(newIndex);
  }, []);

  const handleShare = useCallback(() => {
    console.log('Share restaurant');
  }, []);

  const handleReservation = useCallback(() => {
    console.log('Make reservation/order');
  }, []);

  const handleCall = useCallback(() => {
    window.location.href = `tel:${restaurantData.phone}`;
  }, []);

  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(restaurantData.address);
    console.log('Address copied to clipboard');
  }, []);

  const handleVideoPlay = useCallback((videoId: string) => {
    console.log(`Play video: ${videoId}`);
  }, []);

  const toggleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
  }, []);

  const openGoogleMaps = useCallback(() => {
    // Try to open native Google Maps app first, then fallback to web
    const encodedAddress = encodeURIComponent(restaurantData.address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const nativeUrl = `comgooglemaps://?q=${encodedAddress}`;
    
    // For mobile devices, try native app first
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = nativeUrl;
      // Fallback to web version after a delay
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 1000);
    } else {
      // For desktop, open web version directly
      window.open(googleMapsUrl, '_blank');
    }
  }, []);

  const handleBannerScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const bannerWidth = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / bannerWidth);
    setCurrentBannerIndex(newIndex);
  }, []);

  // Handle scroll to show/hide sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (restaurantInfoRef.current) {
        const rect = restaurantInfoRef.current.getBoundingClientRect();
        setShowStickyHeader(rect.bottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll banner every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerScrollRef.current) {
        const nextIndex = (currentBannerIndex + 1) % eventBanners.length;
        const bannerWidth = bannerScrollRef.current.offsetWidth;
        bannerScrollRef.current.scrollTo({
          left: nextIndex * bannerWidth,
          behavior: 'smooth'
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  const tabs = [
    { key: '홈' as TabType, label: '홈', icon: MapPin },
    { key: '소식' as TabType, label: '소식', icon: MessageSquare },
    { key: '메뉴' as TabType, label: '메뉴', icon: Utensils },
    { key: '리뷰' as TabType, label: '리뷰', icon: Star },
    { key: '사진' as TabType, label: '사진', icon: Camera },
    { key: '주변' as TabType, label: '주변', icon: Navigation }
  ];

  const renderStarRating = (rating: number) => (
    <div className="flex items-center" style={{ gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className="w-4 h-4"
          style={{ 
            color: star <= rating ? 'var(--accent)' : 'var(--muted-foreground)',
            fill: star <= rating ? 'var(--accent)' : 'none'
          }}
        />
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case '홈':
        return (
          <div className="space-y-6">
            {/* Rolling Event Banner Carousel */}
            <div className="mx-4">
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
                        <div className="flex-1 z-10">
                          <h3 
                            style={{
                              fontSize: 'var(--text-xl)',
                              fontWeight: 'var(--font-weight-medium)',
                              fontFamily: 'var(--font-family-primary)',
                              color: banner.textColor,
                              marginBottom: '4px'
                            }}
                          >
                            {banner.title}
                          </h3>
                          <p 
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

            {/* Restaurant Key Info */}
            <div 
              className="mx-4 p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h3 
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  marginBottom: '16px'
                }}
              >
                매장 정보
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start" style={{ gap: '12px' }}>
                  <MapPin 
                    className="w-5 h-5 flex-shrink-0 mt-0.5" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                  <div className="flex-1">
                    <p style={{ 
                      fontSize: 'var(--text-base)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      {restaurantData.address}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-muted rounded transition-colors duration-200"
                    style={{ 
                      borderRadius: 'var(--radius-sm)',
                      minHeight: '44px',
                      minWidth: '44px'
                    }}
                    aria-label="주소 복사"
                  >
                    <Copy className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </div>

                {/* Operating Hours */}
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <Clock className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ 
                    fontSize: 'var(--text-base)', 
                    fontFamily: 'var(--font-family-primary)', 
                    color: 'var(--foreground)' 
                  }}>
                    {restaurantData.hours}
                  </span>
                  <span 
                    className="px-2 py-1 rounded"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--accent)',
                      backgroundColor: 'rgba(255, 123, 84, 0.1)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {restaurantData.isOpen ? '영업 중' : '영업 종료'}
                  </span>
                </div>

                {/* Contact */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <Phone className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ 
                      fontSize: 'var(--text-base)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      {restaurantData.phone}
                    </span>
                  </div>
                  <button
                    onClick={handleCall}
                    className="p-2 rounded-lg border transition-colors duration-200 hover:bg-muted"
                    style={{ 
                      borderRadius: 'var(--radius-md)',
                      borderColor: 'var(--border)',
                      minHeight: '44px',
                      minWidth: '44px'
                    }}
                    aria-label="전화 걸기"
                  >
                    <Phone className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  </button>
                </div>

                {/* Features */}
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {restaurantData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1"
                      style={{
                        fontSize: 'var(--text-sm)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-family-primary)',
                        backgroundColor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CRITICAL: Google In-App Ad Block */}
            <div 
              className="mx-4 p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span 
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    backgroundColor: 'var(--muted)',
                    color: 'var(--muted-foreground)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  AD
                </span>
              </div>
              <div className="flex items-center" style={{ gap: '16px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80"
                  alt="Google Ad"
                  className="w-20 h-20 object-cover rounded-lg"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
                <div className="flex-1">
                  <h4 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    Google Ad: 추천 식당 광고
                  </h4>
                  <p 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)',
                      lineHeight: '1.4'
                    }}
                  >
                    근처 인기 맛집을 AI가 추천해드려요.
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg border transition-colors duration-200 hover:bg-muted"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    borderColor: 'var(--border)',
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="광고 자세히 보기"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            </div>

            {/* Menu Preview Section */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  메뉴
                </h3>
                <button
                  onClick={onNavigateToMenu}
                  className="flex items-center transition-colors duration-200 hover:bg-muted px-3 py-2 rounded-lg gap-1"
                  style={{ 
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--accent)',
                    minHeight: '44px'
                  }}
                >
                  <span 
                    className="whitespace-nowrap"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    전체 메뉴 보기
                  </span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>

              {/* Menu Categories Preview - Show first 1-2 categories with 1-2 items each */}
              <div className="space-y-4">
                {menuCategories.slice(0, 2).map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 style={{ 
                        fontSize: 'var(--text-lg)', 
                        fontWeight: 'var(--font-weight-medium)', 
                        fontFamily: 'var(--font-family-primary)', 
                        color: 'var(--foreground)' 
                      }}>
                        {category.categoryName}
                      </h4>
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontFamily: 'var(--font-family-primary)', 
                        color: 'var(--muted-foreground)' 
                      }}>
                        {category.items.length}개
                      </span>
                    </div>

                    {/* Menu Items Preview - Show first 1 item only */}
                    <div className="space-y-3">
                      {category.items.slice(0, 1).map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className="flex items-start justify-between py-2"
                        >
                          <div className="flex-1">
                            <h5 style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-medium)', 
                              fontFamily: 'var(--font-family-primary)', 
                              color: 'var(--foreground)',
                              marginBottom: '4px'
                            }}>
                              {item.name}
                            </h5>
                            {item.description && (
                              <p style={{ 
                                fontSize: 'var(--text-sm)', 
                                fontFamily: 'var(--font-family-primary)', 
                                color: 'var(--muted-foreground)',
                                marginBottom: '4px',
                                lineHeight: '1.4'
                              }}>
                                {item.description}
                              </p>
                            )}
                            <p style={{ 
                              fontSize: 'var(--text-base)', 
                              fontWeight: 'var(--font-weight-medium)', 
                              fontFamily: 'var(--font-family-primary)', 
                              color: 'var(--foreground)' 
                            }}>
                              {item.price}
                            </p>
                          </div>
                          {item.imageUrl ? (
                            <div className="ml-4 flex-shrink-0">
                              <ImageWithFallback
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-cover"
                                style={{ borderRadius: 'var(--radius-lg)' }}
                              />
                            </div>
                          ) : (
                            <div className="ml-4 w-16" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Menu More Button - Added at the bottom */}
                <button
                  onClick={onNavigateToMenu}
                  className="w-full p-4 bg-muted text-center transition-all duration-200 hover:bg-muted/80 active:scale-98 rounded-lg border border-border"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    minHeight: '56px',
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--muted)'
                  }}
                >
                  <div className="flex items-center justify-center" style={{ gap: '8px' }}>
                    <Utensils className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <span style={{ 
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      메뉴 더보기
                    </span>
                    <span style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--muted-foreground)' 
                    }}>
                      ({menuCategories.reduce((total, cat) => total + cat.items.length, 0)}개)
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* CRITICAL: Google In-App Ad Block */}
            <div className="mx-4">
              <InlineBannerAd 
                title="유사한 맛집 추천" 
                subtitle="이 레스토랑과 비슷한 분위기의 맛집을 찾아보세요"
              />
            </div>

            {/* Reviews Preview Section */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  리뷰 ({restaurantData.reviewCount.toLocaleString()})
                </h3>
                <button
                  onClick={onNavigateToReviews}
                  className="flex items-center transition-colors duration-200 hover:bg-muted px-3 py-2 rounded-lg"
                  style={{ 
                    gap: '4px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--accent)',
                    minHeight: '44px'
                  }}
                >
                  <span 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    전체 리뷰 보기
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Short Form Review Tags */}
              <div className="mb-4">
                <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: '8px' }}>
                  {shortFormReviews.slice(0, 4).map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={index}
                        className="flex-shrink-0 flex items-center px-3 py-2 rounded-lg border"
                        style={{
                          minHeight: '44px',
                          borderRadius: 'var(--radius-lg)',
                          gap: '6px',
                          backgroundColor: item.isHighlighted ? 'rgba(255, 123, 84, 0.1)' : 'var(--secondary)',
                          borderColor: item.isHighlighted ? 'var(--accent)' : 'var(--border)',
                          color: item.isHighlighted ? 'var(--accent)' : 'var(--secondary-foreground)'
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          fontFamily: 'var(--font-family-primary)',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.tag}
                        </span>
                        <span style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: 'var(--muted-foreground)' 
                        }}>
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reviews Preview */}
              <div className="space-y-2">
                {mockReviews.slice(0, 5).map((review) => (
                  <div 
                    key={review.id} 
                    className="p-2 rounded-lg border"
                    style={{ 
                      borderRadius: 'var(--radius-lg)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)', 
                        fontFamily: 'var(--font-family-primary)', 
                        color: 'var(--foreground)' 
                      }}>
                        {review.userName.slice(0, 3)}***
                      </span>
                      <div>
                        {renderStarRating(review.rating)}
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-base)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)', 
                      lineHeight: '1.4',
                      marginTop: '4px'
                    }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos & Videos Preview Section */}
            <div className="mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  사진 & 영상 ({galleryImages.length + youtubeVideos.length}개)
                </h3>
                <button
                  onClick={() => onNavigateToPhotoList && onNavigateToPhotoList()}
                  className="flex items-center transition-colors duration-200 hover:bg-muted px-3 py-2 rounded-lg"
                  style={{ 
                    gap: '4px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--accent)',
                    minHeight: '44px'
                  }}
                >
                  <span 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    전체 보기
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Grid Preview */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {galleryImages.slice(0, 6).map((image, index) => (
                  <div key={index} className="relative">
                    <ImageWithFallback
                      src={image}
                      alt={`${restaurantData.name} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer"
                      style={{ borderRadius: 'var(--radius-lg)' }}
                    />
                    {index === 5 && galleryImages.length > 6 && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer"
                        style={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          borderRadius: 'var(--radius-lg)'
                        }}
                        onClick={() => onNavigateToPhotoList && onNavigateToPhotoList()}
                      >
                        <span style={{ 
                          fontSize: 'var(--text-lg)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: '#FFFFFF' 
                        }}>
                          +{galleryImages.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Video Preview */}
              {youtubeVideos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      영상
                    </h4>
                    <button
                      onClick={() => onNavigateToPhotoList && onNavigateToPhotoList()}
                      className="flex items-center transition-colors duration-200 hover:bg-muted px-3 py-2 rounded-lg"
                      style={{ 
                        gap: '4px',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--accent)',
                        minHeight: '44px'
                      }}
                    >
                      <span 
                        style={{
                          fontSize: 'var(--text-base)',
                          fontFamily: 'var(--font-family-primary)'
                        }}
                      >
                        전체 보기
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {youtubeVideos.slice(0, 4).map((video) => (
                    <div 
                      key={video.id}
                      className="flex cursor-pointer p-3 rounded-lg border transition-transform duration-200 hover:scale-105"
                      style={{ 
                        gap: '12px',
                        borderRadius: 'var(--radius-lg)',
                        borderColor: 'var(--border)'
                      }}
                      onClick={() => handleVideoPlay(video.id)}
                    >
                      <div className="relative flex-shrink-0">
                        <ImageWithFallback
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded-lg"
                          style={{ borderRadius: 'var(--radius-lg)' }}
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center rounded-lg"
                          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                        >
                          <div 
                            className="w-6 h-6 flex items-center justify-center"
                            style={{ 
                              borderRadius: 'var(--radius-xl)',
                              backgroundColor: '#FF0000'
                            }}
                          >
                            <Play className="w-3 h-3 fill-white text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 style={{ 
                          fontSize: 'var(--text-base)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: 'var(--foreground)',
                          marginBottom: '4px'
                        }}>
                          {video.title}
                        </h5>
                        <p style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: 'var(--muted-foreground)' 
                        }}>
                          {video.channel}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CRITICAL: Second Google In-App Ad Block - Before Location */}
            <div 
              className="mx-4 p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span 
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    backgroundColor: 'var(--muted)',
                    color: 'var(--muted-foreground)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  AD
                </span>
              </div>
              <div className="flex items-center" style={{ gap: '16px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80"
                  alt="Delivery Ad"
                  className="w-20 h-20 object-cover rounded-lg"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
                <div className="flex-1">
                  <h4 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    배달앱 할인 이벤트
                  </h4>
                  <p 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)',
                      lineHeight: '1.4'
                    }}
                  >
                    첫 주문 30% 할인! 지금 바로 주문하세요.
                  </p>
                </div>
                <button
                  className="p-2 rounded-lg border transition-colors duration-200 hover:bg-muted"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    borderColor: 'var(--border)',
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="광고 자세히 보기"
                >
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            </div>

            {/* Google Maps Section - Simplified */}
            <div 
              className="mx-4 p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <h3 
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  marginBottom: '16px'
                }}
              >
                위치
              </h3>
              
              {/* Map Placeholder */}
              <div 
                className="w-full h-48 rounded-lg mb-4 cursor-pointer transition-colors duration-200 hover:bg-opacity-80 flex items-center justify-center"
                style={{ 
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--muted)',
                  border: `2px dashed var(--border)`
                }}
                onClick={openGoogleMaps}
              >
                <div className="text-center">
                  <MapPin 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                  <p style={{ 
                    fontSize: 'var(--text-base)', 
                    fontFamily: 'var(--font-family-primary)', 
                    color: 'var(--muted-foreground)' 
                  }}>
                    지도에서 보기
                  </p>
                </div>
              </div>
              
              {/* Address Info */}
              <div className="mb-4">
                <div className="flex items-start" style={{ gap: '8px' }}>
                  <MapPin 
                    className="w-5 h-5 flex-shrink-0 mt-0.5" 
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                  <div className="flex-1">
                    <p style={{ 
                      fontSize: 'var(--text-base)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      {restaurantData.address}
                    </p>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--muted-foreground)' 
                    }}>
                      명동역 1번 출구에서 408m
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex" style={{ gap: '8px' }}>
                <button
                  onClick={openGoogleMaps}
                  className="flex-1 px-4 py-3 rounded-lg transition-colors duration-200 hover:opacity-90 flex items-center justify-center"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    minHeight: '44px',
                    gap: '8px'
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  길찾기
                </button>
                <button
                  onClick={handleCopyAddress}
                  className="p-3 border rounded-lg transition-colors duration-200 hover:bg-muted flex items-center justify-center"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    borderColor: 'var(--border)',
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="주소 복사"
                >
                  <Copy className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            </div>

            {/* Nearby Restaurants Section */}
            <div 
              className="mx-4 p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  주변맛집
                </h3>
                <button
                  onClick={onNavigateToAI}
                  className="flex items-center transition-colors duration-200 hover:bg-muted px-3 py-2 rounded-lg"
                  style={{ 
                    gap: '4px',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--accent)',
                    minHeight: '44px'
                  }}
                >
                  <span 
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)'
                    }}
                  >
                    전체 보기
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 2x2 Grid of Nearby Restaurants */}
              <div className="grid grid-cols-2 mb-4" style={{ gap: '12px' }}>
                {nearbyRestaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id}
                    className="border rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
                    style={{ 
                      borderRadius: 'var(--radius-lg)',
                      borderColor: 'var(--border)'
                    }}
                    onClick={onNavigateToAI}
                  >
                    <ImageWithFallback
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-3">
                      <h4 
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--foreground)',
                          marginBottom: '4px',
                          lineHeight: '1.2'
                        }}
                      >
                        {restaurant.name}
                      </h4>
                      <div className="flex flex-wrap mb-2" style={{ gap: '4px' }}>
                        {restaurant.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 rounded text-xs"
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontFamily: 'var(--font-family-primary)',
                              backgroundColor: 'var(--muted)',
                              color: 'var(--muted-foreground)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center mb-1" style={{ gap: '4px' }}>
                        <Star 
                          className="w-3 h-3 fill-current" 
                          style={{ color: 'var(--accent)' }} 
                        />
                        <span 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--foreground)'
                          }}
                        >
                          {restaurant.rating}
                        </span>
                        <span 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          리뷰 {restaurant.reviewCount.toLocaleString()}
                        </span>
                      </div>
                      <p 
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        {restaurant.distance}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center" style={{ gap: '16px' }}>
                <button
                  onClick={() => setNearbyPage(prev => Math.max(1, prev - 1))}
                  className="p-2 rounded-lg border transition-colors duration-200 hover:bg-muted disabled:opacity-50"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    borderColor: 'var(--border)',
                    minHeight: '36px',
                    minWidth: '36px'
                  }}
                  disabled={nearbyPage === 1}
                  aria-label="이전 페이지"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" style={{ color: 'var(--muted-foreground)' }} />
                </button>
                
                <span 
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}
                >
                  {nearbyPage} / 4
                </span>
                
                <button
                  onClick={() => setNearbyPage(prev => Math.min(4, prev + 1))}
                  className="p-2 rounded-lg border transition-colors duration-200 hover:bg-muted disabled:opacity-50"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    borderColor: 'var(--border)',
                    minHeight: '36px',
                    minWidth: '36px'
                  }}
                  disabled={nearbyPage === 4}
                  aria-label="다음 페이지"
                >
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            </div>

            {/* Business Info Banner */}
            <div 
              className="mx-4 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
              style={{
                borderRadius: 'var(--radius-lg)'
              }}
              onClick={onNavigateToAI}
            >
              <div className="relative">
                <ImageWithFallback
                  src={businessInfoBanner}
                  alt="업체 정보 수정 및 신규 등록 요청"
                  className="w-full h-auto object-cover"
                />
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
              </div>
            </div>
          </div>
        );

      case '메뉴':
        return (
          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 style={{ 
                  fontSize: 'var(--text-xl)', 
                  fontWeight: 'var(--font-weight-medium)', 
                  fontFamily: 'var(--font-family-primary)', 
                  color: 'var(--foreground)' 
                }}>
                  메뉴 ({menuCategories.reduce((total, category) => total + category.items.length, 0)}개)
                </h3>
                <span style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontFamily: 'var(--font-family-primary)', 
                  color: 'var(--muted-foreground)' 
                }}>
                  배달/픽업가능
                </span>
              </div>
            </div>

            {/* Menu Categories */}
            <div className="space-y-6">
              {menuCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-3">
                  {/* Category Header */}
                  <div className="border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                    <h4 style={{ 
                      fontSize: 'var(--text-lg)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      {category.categoryName}
                    </h4>
                  </div>

                  {/* Category Items */}
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex} 
                        className="flex items-start justify-between py-3"
                        style={{ 
                          borderBottom: itemIndex < category.items.length - 1 ? `1px solid var(--border)` : 'none'
                        }}
                      >
                        <div className="flex-1">
                          <h5 style={{ 
                            fontSize: 'var(--text-base)', 
                            fontWeight: 'var(--font-weight-medium)', 
                            fontFamily: 'var(--font-family-primary)', 
                            color: 'var(--foreground)',
                            marginBottom: '4px'
                          }}>
                            {item.name}
                          </h5>
                          {item.description && (
                            <p style={{ 
                              fontSize: 'var(--text-sm)', 
                              fontFamily: 'var(--font-family-primary)', 
                              color: 'var(--muted-foreground)',
                              marginBottom: '4px',
                              lineHeight: '1.4'
                            }}>
                              {item.description}
                            </p>
                          )}
                          <p style={{ 
                            fontSize: 'var(--text-base)', 
                            fontWeight: 'var(--font-weight-medium)', 
                            fontFamily: 'var(--font-family-primary)', 
                            color: 'var(--foreground)' 
                          }}>
                            {item.price}
                          </p>
                        </div>
                        {item.imageUrl ? (
                          <div className="ml-4 flex-shrink-0">
                            <ImageWithFallback
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 object-cover"
                              style={{ borderRadius: 'var(--radius-lg)' }}
                            />
                          </div>
                        ) : (
                          <div className="ml-4 w-20" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '리뷰':
        return (
          <div className="p-4">
            {/* Short Form Review Section */}
            <div className="mb-6">
              <h4 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)', 
                fontFamily: 'var(--font-family-primary)', 
                color: 'var(--foreground)' 
              }}>
                방문객들의 한마디
              </h4>
              <div className="flex overflow-x-auto scrollbar-hide mt-3" style={{ gap: '8px' }}>
                {shortFormReviews.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={index}
                      className="flex-shrink-0 flex items-center px-4 py-3 rounded-lg border"
                      style={{
                        minHeight: '44px',
                        borderRadius: 'var(--radius-lg)',
                        gap: '8px',
                        backgroundColor: item.isHighlighted ? 'rgba(255, 123, 84, 0.1)' : 'var(--secondary)',
                        borderColor: item.isHighlighted ? 'var(--accent)' : 'var(--border)',
                        color: item.isHighlighted ? 'var(--accent)' : 'var(--secondary-foreground)'
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)', 
                        fontFamily: 'var(--font-family-primary)' 
                      }}>
                        {item.tag}
                      </span>
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontFamily: 'var(--font-family-primary)', 
                        color: 'var(--muted-foreground)' 
                      }}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Reviews */}
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div 
                  key={review.id} 
                  className="p-4 rounded-lg border"
                  style={{ 
                    borderRadius: 'var(--radius-lg)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="flex items-start" style={{ gap: '12px' }}>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ 
                        borderRadius: 'var(--radius-xl)',
                        backgroundColor: 'var(--muted)'
                      }}
                    >
                      {review.avatar ? (
                        <ImageWithFallback
                          src={review.avatar}
                          alt={review.userName}
                          className="w-full h-full rounded-full object-cover"
                          style={{ borderRadius: 'var(--radius-xl)' }}
                        />
                      ) : (
                        <span style={{ 
                          fontSize: 'var(--text-base)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: 'var(--muted-foreground)' 
                        }}>
                          {review.userName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ 
                          fontSize: 'var(--text-base)', 
                          fontWeight: 'var(--font-weight-medium)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: 'var(--foreground)' 
                        }}>
                          {review.userName}
                        </span>
                        <span style={{ 
                          fontSize: 'var(--text-sm)', 
                          fontFamily: 'var(--font-family-primary)', 
                          color: 'var(--muted-foreground)' 
                        }}>
                          {review.date}
                        </span>
                      </div>
                      <div className="mb-3">
                        {renderStarRating(review.rating)}
                      </div>
                      <p style={{ 
                        fontSize: 'var(--text-base)', 
                        fontFamily: 'var(--font-family-primary)', 
                        color: 'var(--foreground)', 
                        lineHeight: '1.5' 
                      }}>
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '사진':
        return (
          <div className="p-4">
            <h3 style={{ 
              fontSize: 'var(--text-xl)', 
              fontWeight: 'var(--font-weight-medium)', 
              fontFamily: 'var(--font-family-primary)', 
              color: 'var(--foreground)' 
            }}>
              사진 & 영상 ({galleryImages.length + youtubeVideos.length}개)
            </h3>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4 mb-8">
              {galleryImages.map((image, index) => (
                <ImageWithFallback
                  key={index}
                  src={image}
                  alt={`${restaurantData.name} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                />
              ))}
            </div>

            {/* Video Section */}
            <h4 style={{ 
              fontSize: 'var(--text-lg)', 
              fontWeight: 'var(--font-weight-medium)', 
              fontFamily: 'var(--font-family-primary)', 
              color: 'var(--foreground)' 
            }}>
              영상 ({youtubeVideos.length}개)
            </h4>
            <div className="space-y-3 mt-4">
              {youtubeVideos.map((video) => (
                <div 
                  key={video.id}
                  className="flex cursor-pointer p-3 rounded-lg border"
                  style={{ 
                    gap: '12px',
                    borderRadius: 'var(--radius-lg)',
                    borderColor: 'var(--border)'
                  }}
                  onClick={() => handleVideoPlay(video.id)}
                >
                  <div className="relative flex-shrink-0">
                    <ImageWithFallback
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-32 h-20 object-cover rounded-lg"
                      style={{ borderRadius: 'var(--radius-lg)' }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                    >
                      <div 
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ 
                          borderRadius: 'var(--radius-xl)',
                          backgroundColor: '#FF0000'
                        }}
                      >
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 style={{ 
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--foreground)' 
                    }}>
                      {video.title}
                    </h5>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--muted-foreground)' 
                    }}>
                      {video.channel}
                    </p>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)', 
                      color: 'var(--muted-foreground)' 
                    }}>
                      조회수 {video.views}회 • {video.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '소식':
        return (
          <div className="p-4 text-center">
            <div className="py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)', 
                fontFamily: 'var(--font-family-primary)', 
                color: 'var(--foreground)' 
              }}>
                소식 콘텐츠 준비 중
              </p>
            </div>
          </div>
        );

      case '주변':
        return (
          <div className="p-4 text-center">
            <div className="py-12">
              <Navigation className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ 
                fontSize: 'var(--text-base)', 
                fontWeight: 'var(--font-weight-medium)', 
                fontFamily: 'var(--font-family-primary)', 
                color: 'var(--foreground)' 
              }}>
                주변 정보 준비 중
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        maxWidth: '390px', 
        margin: '0 auto',
        backgroundColor: 'var(--card)'
      }}
    >
      {/* Sticky Header */}
      {showStickyHeader && (
        <div 
          className="sticky top-0 z-50 border-b"
          style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--elevation-sm)'
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={onNavigateBack}
              className="flex items-center justify-center w-11 h-11 hover:bg-muted rounded-full"
              style={{ borderRadius: 'var(--radius-xl)', minHeight: '44px' }}
            >
              <ArrowLeft className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
            </button>
            
            <div className="flex-1 mx-4">
              <h1 style={{ 
                fontSize: 'var(--text-lg)', 
                fontWeight: 'var(--font-weight-medium)', 
                fontFamily: 'var(--font-family-primary)', 
                color: 'var(--foreground)' 
              }}>
                {restaurantData.name}
              </h1>
            </div>
            
            <div className="flex" style={{ gap: '8px' }}>
              <button
                onClick={toggleFavorite}
                className="w-11 h-11 hover:bg-muted rounded-full flex items-center justify-center"
                style={{ borderRadius: 'var(--radius-xl)', minHeight: '44px' }}
              >
                <Heart 
                  className="w-5 h-5"
                  style={{ 
                    color: isFavorited ? 'var(--accent)' : 'var(--muted-foreground)',
                    fill: isFavorited ? 'var(--accent)' : 'none'
                  }}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-11 h-11 hover:bg-muted rounded-full flex items-center justify-center"
                style={{ borderRadius: 'var(--radius-xl)', minHeight: '44px' }}
              >
                <Share2 className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Image Gallery - 40-50% screen height */}
      <div className="relative">
        <div 
          ref={galleryScrollRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          onScroll={handleImageScroll}
          style={{ height: '400px' }}
        >
          {galleryImages.map((imageUrl, index) => (
            <div key={index} className="flex-shrink-0 w-full snap-start">
              <ImageWithFallback
                src={imageUrl}
                alt={`${restaurantData.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{ 
            height: '120px',
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%)'
          }}
        />

        {/* Floating buttons */}
        <button
          onClick={onNavigateBack}
          className="absolute top-4 left-4 w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center"
          style={{ 
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--background)',
            boxShadow: 'var(--elevation-sm)',
            minHeight: '44px'
          }}
        >
          <ArrowLeft className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>

        <div className="absolute top-4 right-4 flex" style={{ gap: '8px' }}>
          <button
            onClick={toggleFavorite}
            className="w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center"
            style={{ 
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--background)',
              boxShadow: 'var(--elevation-sm)',
              minHeight: '44px'
            }}
          >
            <Heart 
              className="w-5 h-5"
              style={{ 
                color: isFavorited ? 'var(--accent)' : 'var(--foreground)',
                fill: isFavorited ? 'var(--accent)' : 'none'
              }}
            />
          </button>
          <button
            onClick={handleShare}
            className="w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center"
            style={{ 
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--background)',
              boxShadow: 'var(--elevation-sm)',
              minHeight: '44px'
            }}
          >
            <Share2 className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
          </button>
        </div>

        {/* Page indicators */}
        <div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex backdrop-blur-md px-4 py-2" 
          style={{ 
            gap: '8px', 
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          {galleryImages.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full"
              style={{ 
                borderRadius: 'var(--radius-xl)',
                backgroundColor: index === currentImageIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
              }}
            />
          ))}
        </div>

        {/* Restaurant info overlay */}
        <div 
          className="absolute bottom-6 left-4 right-4"
          ref={restaurantInfoRef}
        >
          <h1 
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
              marginBottom: '8px'
            }}
          >
            {restaurantData.name}
          </h1>
          <div className="flex items-center mb-2" style={{ gap: '8px' }}>
            {renderStarRating(Math.floor(restaurantData.rating))}
            <span 
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)'
              }}
            >
              {restaurantData.rating} ({restaurantData.reviewCount.toLocaleString()}개 리뷰)
            </span>
          </div>
          <p 
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
              lineHeight: '1.4'
            }}
          >
            {restaurantData.category} • {restaurantData.description}
          </p>
        </div>
      </div>

      {/* Tab Navigation - i18n Ready */}
      <div 
        className="sticky top-0 z-40 border-b"
        style={{ 
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <div className="flex">
          {tabs.map(({ key, label, icon: IconComponent }) => (
            <button
              key={key}
              onClick={() => {
                if (key === '사진' && onNavigateToPhotoList) {
                  onNavigateToPhotoList();
                } else {
                  setActiveTab(key);
                }
              }}
              className={`flex-1 flex flex-col items-center py-3 px-1 min-w-0 ${
                activeTab === key ? 'border-b-2' : ''
              }`}
              style={{
                borderColor: activeTab === key ? 'var(--primary)' : 'transparent',
                color: activeTab === key ? 'var(--primary)' : 'var(--muted-foreground)',
                minHeight: '44px'
              }}
            >
              <IconComponent className="w-5 h-5 mb-1 flex-shrink-0" />
              <span 
                className="truncate w-full text-center"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: activeTab === key ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)'
                }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
        <div style={{ height: '80px' }} />
      </div>

      {/* Bottom Action Bar */}
      <div 
        className="sticky bottom-0 border-t p-4"
        style={{ 
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
          boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 40
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFavorite}
            className="w-14 h-12 border rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              borderRadius: 'var(--radius-lg)',
              borderColor: isFavorited ? 'var(--accent)' : 'var(--border)',
              backgroundColor: isFavorited ? 'rgba(255, 123, 84, 0.1)' : 'transparent',
              minHeight: '44px'
            }}
          >
            <Heart 
              className="w-6 h-6"
              style={{ 
                color: isFavorited ? 'var(--accent)' : 'var(--muted-foreground)',
                fill: isFavorited ? 'var(--accent)' : 'none'
              }}
            />
          </button>
          
          <button
            onClick={onNavigateToWriteReview}
            className="flex-1 py-3 px-4 rounded-lg flex items-center justify-center min-w-0 gap-2"
            style={{
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              fontWeight: 'var(--font-weight-medium)',
              color: '#FFFFFF',
              backgroundColor: 'var(--primary)',
              minHeight: '44px'
            }}
          >
            <Edit3 className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">리뷰쓰기</span>
          </button>
          
          <button
            onClick={handleShare}
            className="w-14 h-12 border rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ 
              borderRadius: 'var(--radius-lg)',
              borderColor: 'var(--border)',
              minHeight: '44px'
            }}
          >
            <Share2 className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
