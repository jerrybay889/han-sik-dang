import React, { useState } from 'react';
import { ArrowLeft, Share2, Heart, Star, Clock, Calendar, Phone, MapPin, ExternalLink, Instagram, Copy, Navigation } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantDetailInfoScreenProps {
  onNavigateBack: () => void;
  onNavigateToReservation?: () => void;
  onShareRestaurant?: () => void;
  restaurantId: string;
  restaurantName?: string;
}

interface RestaurantInfo {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  isFavorited: boolean;
  operatingHours: {
    weekdays: string;
    weekends: string;
    closedDays: string;
  };
  contact: {
    phone: string;
    website: string;
    socialMedia: string;
  };
  location: {
    address: string;
    district: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  features: string[];
  additionalInfo: {
    wifi: boolean;
    parking: boolean;
    cardPayment: boolean;
    takeout: boolean;
    reservation: boolean;
    groupFriendly: boolean;
  };
}

export default function RestaurantDetailInfoScreen({
  onNavigateBack,
  onNavigateToReservation,
  onShareRestaurant,
  restaurantId,
  restaurantName = "한식당 강남점"
}: RestaurantDetailInfoScreenProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock restaurant info data - i18n Ready
  const restaurantInfo: RestaurantInfo = {
    name: restaurantName,
    rating: 4.6,
    reviewCount: 1247,
    category: "한식, 전통요리",
    isFavorited: isFavorited,
    operatingHours: {
      weekdays: "매일 11:00 - 22:00",
      weekends: "매일 11:00 - 22:00", 
      closedDays: "매주 일요일"
    },
    contact: {
      phone: "02-1234-5678",
      website: "https://www.hansikdang.com",
      socialMedia: "@hansikdang_official"
    },
    location: {
      address: "서울특별시 강남구 테헤란로 123",
      district: "강남구",
      coordinates: {
        lat: 37.5013,
        lng: 127.0397
      }
    },
    features: ["와이파이", "주차가능", "카드결제", "포장가능", "예약가능", "단체이용"],
    additionalInfo: {
      wifi: true,
      parking: true,
      cardPayment: true,
      takeout: true,
      reservation: true,
      groupFriendly: true
    }
  };

  // Mock event banners for ad placement - i18n Ready
  const eventBanner = {
    id: 'info-ad-1',
    title: '가게 정보 확인하고 10% 할인',
    subtitle: '전화주문 시 "한그릇에서 봤다"고 말씀하세요',
    backgroundColor: 'var(--accent)',
    textColor: '#FFFFFF',
    link: '/events/phone-discount'
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
  };

  const handlePhoneCall = () => {
    window.open(`tel:${restaurantInfo.contact.phone}`, '_self');
  };

  const handleWebsiteOpen = () => {
    window.open(restaurantInfo.contact.website, '_blank');
  };

  const handleSocialMediaOpen = () => {
    window.open(`https://instagram.com/${restaurantInfo.contact.socialMedia.replace('@', '')}`, '_blank');
  };

  const handleMapOpen = () => {
    const { lat, lng } = restaurantInfo.location.coordinates;
    window.open(`https://maps.google.com?q=${lat},${lng}`, '_blank');
  };

  const handleAddressCopy = () => {
    navigator.clipboard.writeText(restaurantInfo.location.address);
    // Could show a toast notification here
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
          정보
        </h1>

        <button
          onClick={onShareRestaurant}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="공유하기"
        >
          <Share2 className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Restaurant Info Compact Sticky */}
      <div
        className="sticky top-14 z-40 bg-background border-b px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--background)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            {restaurantInfo.name}
          </h2>
          
          <button
            onClick={handleFavoriteToggle}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
            aria-label="찜하기"
          >
            <Heart 
              className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`}
              style={{ color: isFavorited ? 'var(--accent)' : 'var(--muted-foreground)' }}
            />
          </button>
        </div>

        {/* Current Tab Indicator */}
        <div className="flex items-center gap-4">
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            홈
          </span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            |
          </span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            메뉴
          </span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            |
          </span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            리뷰
          </span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            |
          </span>
          <span
            className="border-b-2"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--primary)',
              borderColor: 'var(--primary)',
              paddingBottom: '4px'
            }}
          >
            정보
          </span>
        </div>
      </div>

      {/* Info List Sections - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div style={{ padding: '0 16px' }}>
          
          {/* Operating Info Group */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)',
                marginBottom: '16px'
              }}
            >
              운영 정보
            </h3>
            
            {/* Operating Hours */}
            <div 
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  운영시간
                </span>
              </div>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {restaurantInfo.operatingHours.weekdays}
              </span>
            </div>

            {/* Closed Days */}
            <div 
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  휴무일
                </span>
              </div>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {restaurantInfo.operatingHours.closedDays}
              </span>
            </div>

            {/* Phone Number */}
            <div 
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  전화번호
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {restaurantInfo.contact.phone}
                </span>
                <button
                  onClick={handlePhoneCall}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                  style={{
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="전화걸기"
                >
                  <Phone className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Location Info Group */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)',
                marginBottom: '16px'
              }}
            >
              위치 정보
            </h3>
            
            {/* Address */}
            <div 
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <div>
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      display: 'block'
                    }}
                  >
                    주소
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)',
                      display: 'block',
                      marginTop: '2px'
                    }}
                  >
                    {restaurantInfo.location.address}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddressCopy}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                  style={{
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="주소 복사"
                >
                  <Copy className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                </button>
                <button
                  onClick={handleMapOpen}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                  style={{
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="지도에서 보기"
                >
                  <Navigation className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Google In-App Ad Banner - Strategic Placement */}
          <div 
            className="rounded-lg p-4 mb-6"
            style={{
              backgroundColor: eventBanner.backgroundColor,
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  style={{
                    fontSize: 'var(--text-base)',
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
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: eventBanner.textColor,
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                AD
              </div>
            </div>
          </div>

          {/* Additional Info Group */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)',
                marginBottom: '16px'
              }}
            >
              추가 정보
            </h3>
            
            {/* Website */}
            <div 
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  웹사이트
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  hansikdang.com
                </span>
                <button
                  onClick={handleWebsiteOpen}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                  style={{
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="웹사이트 열기"
                >
                  <ExternalLink className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div 
              className="flex items-center justify-between py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <Instagram className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  소셜 미디어
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {restaurantInfo.contact.socialMedia}
                </span>
                <button
                  onClick={handleSocialMediaOpen}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                  style={{
                    minHeight: '44px',
                    minWidth: '44px'
                  }}
                  aria-label="인스타그램 열기"
                >
                  <ExternalLink className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>

            {/* Features/Amenities */}
            <div style={{ marginTop: '16px' }}>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  marginBottom: '12px',
                  display: 'block'
                }}
              >
                편의시설
              </span>
              <div className="flex flex-wrap gap-2">
                {restaurantInfo.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--muted)',
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)',
                      borderRadius: 'var(--radius-xl)'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Bar - Exact Replica from 5.0_Restaurant_Detail_Home */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-background border-t flex items-center justify-between px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--background)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: '390px',
          margin: '0 auto'
        }}
      >
        <button
          onClick={handleFavoriteToggle}
          className="p-3 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="찜하기"
        >
          <Heart 
            className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`}
            style={{ color: isFavorited ? 'var(--accent)' : 'var(--muted-foreground)' }}
          />
        </button>

        <button
          onClick={onNavigateToReservation}
          className="flex-1 mx-3 py-3 px-6 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98"
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
          리뷰쓰기
        </button>

        <button
          onClick={onShareRestaurant}
          className="p-3 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="공유하기"
        >
          <Share2 className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
        </button>
      </div>
    </div>
  );
}
