import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Plus, Image as ImageIcon, Trash2, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface RestaurantDetailReviewWriteScreenProps {
  onClose: () => void;
  onSubmit: (reviewData: any) => void;
  restaurantId: string;
  restaurantName?: string;
  defaultReviewPublic?: boolean;
}

interface KeywordCategory {
  id: string;
  title: string;
  keywords: Array<{
    id: string;
    emoji: string;
    text: string;
    selected: boolean;
  }>;
}

interface PhotoItem {
  id: string;
  url: string;
  file?: File;
}

// Event Banner Component
const EventBanner = React.memo(({ banner, isActive }: { banner: any; isActive: boolean }) => (
  <div className="w-full flex-shrink-0 snap-start">
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
      </div>
    </div>
  </div>
));

// Rating Section Component
const RatingSection = React.memo(({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
  const getRatingFeedback = (rating: number): string => {
    switch (rating) {
      case 1: return '많이 아쉬웠어요';
      case 2: return '아쉬웠어요';
      case 3: return '보통이었어요';
      case 4: return '좋았어요';
      case 5: return '정말 좋았어요!';
      default: return '';
    }
  };

  return (
    <div className="p-4 bg-background border-b" style={{ borderColor: 'var(--border)' }}>
      <h3 
        className="mb-4"
        style={{
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--foreground)'
        }}
      >
        별점 평가
      </h3>
      
      <div className="flex items-center justify-center mb-4">
        <div className="flex" style={{ gap: '8px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(star)}
              className="transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                minHeight: '44px',
                minWidth: '44px'
              }}
              aria-label={`${star}점`}
            >
              <Star 
                className="w-8 h-8"
                style={{ 
                  color: star <= rating ? 'var(--accent)' : 'var(--muted-foreground)',
                  fill: star <= rating ? 'var(--accent)' : 'none'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {rating > 0 && (
        <div className="text-center">
          <p 
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--accent)'
            }}
          >
            {getRatingFeedback(rating)}
          </p>
        </div>
      )}
    </div>
  );
});

// Review Visibility Control Component
const ReviewVisibilityControl = React.memo(({ 
  isReviewPublic, 
  onToggle 
}: { 
  isReviewPublic: boolean; 
  onToggle: (checked: boolean) => void; 
}) => (
  <div className="p-4 bg-background border-t" style={{ borderColor: 'var(--border)' }}>
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 pr-4">
        <Label 
          htmlFor="review-visibility"
          className="cursor-pointer"
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-normal)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          이 리뷰를 공개합니다.
        </Label>
        <p 
          className="mt-1"
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--muted-foreground)',
            lineHeight: '1.4'
          }}
        >
          리뷰를 공개하면 내 프로필 페이지에 노출되며, 다른 사용자에게도 보일 수 있습니다.
        </p>
      </div>
      <Switch
        id="review-visibility"
        checked={isReviewPublic}
        onCheckedChange={onToggle}
        className="ml-auto"
      />
    </div>
  </div>
));

export default function RestaurantDetailReviewWriteScreen({
  onClose,
  onSubmit,
  restaurantId,
  restaurantName = "정남옥 구로디지털점",
  defaultReviewPublic = true
}: RestaurantDetailReviewWriteScreenProps) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isReviewPublic, setIsReviewPublic] = useState<boolean>(defaultReviewPublic);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<HTMLDivElement>(null);
  const [keywordCategories, setKeywordCategories] = useState<KeywordCategory[]>([
    {
      id: 'food-price',
      title: '음식/가격',
      keywords: [
        { id: 'tasty', emoji: '😋', text: '음식이 맛있어요', selected: false },
        { id: 'quality', emoji: '🥩', text: '고기 질이 좋아요', selected: false },
        { id: 'portion', emoji: '🍜', text: '양이 많아요', selected: false },
        { id: 'value', emoji: '💰', text: '가성비가 좋아요', selected: false },
        { id: 'variety', emoji: '💖', text: '메뉴 구성이 알차요', selected: false },
        { id: 'fresh', emoji: '🌿', text: '재료가 신선해요', selected: false }
      ]
    },
    {
      id: 'atmosphere',
      title: '분위기',
      keywords: [
        { id: 'interior', emoji: '✨', text: '인테리어가 좋아요', selected: false },
        { id: 'spacious', emoji: '👥', text: '매장이 넓어요', selected: false },
        { id: 'solo', emoji: '👤', text: '혼밥하기 좋아요', selected: false },
        { id: 'group', emoji: '🥳', text: '단체모임 하기 좋아요', selected: false },
        { id: 'view', emoji: '🖼️', text: '뷰가 좋아요', selected: false },
        { id: 'cozy', emoji: '🏡', text: '아늑해요', selected: false }
      ]
    }
  ]);

  const eventBanners = [
    {
      id: '1',
      title: '리뷰 작성하고 포인트 받기',
      subtitle: '솔직한 리뷰 작성시 500P 즉시 적립',
      backgroundColor: 'var(--primary)',
      textColor: '#FFFFFF'
    },
    {
      id: '2',
      title: '사진 리뷰 특별 혜택',
      subtitle: '사진 포함 리뷰 작성시 추가 300P 지급',
      backgroundColor: 'var(--accent)',
      textColor: '#FFFFFF'
    }
  ];

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}. ${String(currentDate.getMonth() + 1).padStart(2, '0')}. ${String(currentDate.getDate()).padStart(2, '0')}. (${['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]})`;

  // Banner auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % eventBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [eventBanners.length]);

  const handleKeywordToggle = (categoryId: string, keywordId: string) => {
    setKeywordCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              keywords: category.keywords.map(keyword =>
                keyword.id === keywordId 
                  ? { ...keyword, selected: !keyword.selected }
                  : keyword
              )
            }
          : category
      )
    );
  };

  const handlePhotoAdd = () => {
    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      url: `https://picsum.photos/200/200?random=${Date.now()}`
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handlePhotoRemove = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const getSelectedKeywordsCount = (): number => {
    return keywordCategories.reduce((total, category) => 
      total + category.keywords.filter(keyword => keyword.selected).length, 0
    );
  };

  const isSubmitEnabled = (): boolean => {
    return rating > 0 && (reviewText.trim().length > 0 || getSelectedKeywordsCount() > 0);
  };

  const handleSubmit = () => {
    if (isSubmitEnabled()) {
      const reviewData = {
        restaurantId,
        rating,
        reviewText: reviewText.trim(),
        keywords: keywordCategories.flatMap(category => 
          category.keywords.filter(keyword => keyword.selected)
        ),
        photos,
        visitDate: currentDate.toISOString(),
        isPublic: isReviewPublic
      };
      onSubmit(reviewData);
    }
  };

  return (
    <div className="min-h-screen bg-secondary" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Global Header */}
      <div 
        className="sticky top-0 z-50 bg-background border-b flex items-center justify-between px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="닫기"
        >
          <X className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
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
          리뷰 작성
        </h1>

        <div style={{ width: '44px' }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 pb-20 overflow-y-auto">
        {/* Event Banners */}
        <div className="mx-4 mt-4 mb-6">
          <div className="relative">
            <div 
              ref={bannerScrollRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
              style={{ height: '120px' }}
            >
              {eventBanners.map((banner, index) => (
                <EventBanner 
                  key={banner.id} 
                  banner={banner} 
                  isActive={index === currentBannerIndex} 
                />
              ))}
            </div>

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

        {/* Restaurant Info */}
        <div 
          className="sticky top-14 z-40 bg-background p-4 border-b"
          style={{
            borderColor: 'var(--border)',
            boxShadow: 'var(--elevation-sm)'
          }}
        >
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg overflow-hidden mr-3 flex-shrink-0"
              style={{
                backgroundColor: 'var(--muted)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <ImageWithFallback
                src="https://picsum.photos/48/48?random=restaurant"
                alt={restaurantName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h2 
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  marginBottom: '4px'
                }}
              >
                {restaurantName}
              </h2>
              
              <p 
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {formattedDate} · 1번째 방문
              </p>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <RatingSection rating={rating} onRatingChange={setRating} />

        {/* Keyword Selection */}
        <div className="p-4 bg-background border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-4">
            <h3 
              className="mb-2"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              이런 점이 좋았어요?
            </h3>
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              이 곳에 어울리는 키워드를 골라주세요. (1개~5개) {getSelectedKeywordsCount() > 0 && `(${getSelectedKeywordsCount()}개 선택)`}
            </p>
          </div>

          <div className="space-y-6">
            {keywordCategories.map((category) => (
              <div key={category.id}>
                <h4 
                  className="mb-3"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  {category.title}
                </h4>
                
                <div className="flex flex-wrap gap-2">
                  {category.keywords.map((keyword) => (
                    <button
                      key={keyword.id}
                      onClick={() => handleKeywordToggle(category.id, keyword.id)}
                      className={`px-3 py-2 rounded-full border transition-all duration-200 hover:bg-muted active:scale-95 ${
                        keyword.selected ? 'border-primary bg-primary' : 'border-border bg-background'
                      }`}
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family-primary)',
                        color: keyword.selected ? '#FFFFFF' : 'var(--foreground)',
                        borderRadius: 'var(--radius-xl)',
                        minHeight: '36px'
                      }}
                    >
                      <span className="mr-1">{keyword.emoji}</span>
                      {keyword.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="p-4 bg-background border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 
            className="mb-4"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            사진/영상을 추가해 주세요
          </h3>

          <div className="mb-4 flex justify-center">
            <button
              onClick={handlePhotoAdd}
              className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 hover:bg-muted active:scale-95"
              style={{
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--background)'
              }}
              aria-label="사진 추가"
            >
              <Plus className="w-6 h-6 mb-1" style={{ color: 'var(--muted-foreground)' }} />
              <ImageIcon className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </button>
          </div>

          {photos.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {photos.map((photo) => (
                  <div 
                    key={photo.id}
                    className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                    style={{
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    <ImageWithFallback
                      src={photo.url}
                      alt="Review photo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handlePhotoRemove(photo.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black bg-opacity-50 flex items-center justify-center transition-all duration-200 hover:bg-opacity-70 active:scale-95"
                      style={{
                        borderRadius: 'var(--radius-xl)'
                      }}
                      aria-label="사진 삭제"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p 
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)',
              lineHeight: '1.4'
            }}
          >
            장소와 무관한 내용, 타인의 얼굴이 나오지 않게 유의해주세요.
          </p>
        </div>

        {/* Review Text Input */}
        <div className="p-4 bg-background">
          <h3 
            className="mb-2"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            리뷰를 작성해 주세요
          </h3>

          <p 
            className="mb-4"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--secondary-foreground)',
              lineHeight: '1.4'
            }}
          >
            리뷰 작성 시 유의사항 한 번 확인하기! 욕설, 비방, 명예훼손성 표현은 누구에게 상처가 될 수 있습니다.
          </p>

          <div className="mb-2">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="솔직한 리뷰를 남겨주세요."
              maxLength={400}
              rows={6}
              className="w-full p-3 border rounded-lg resize-none transition-all duration-200 focus:ring-2 focus:ring-primary focus:border-primary"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--input-background)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--secondary-foreground)'
              }}
            >
              {reviewText.length}/400자
            </span>
            
            <button 
              className="transition-colors duration-200 hover:underline"
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--primary)'
              }}
            >
              리뷰 작성 유의사항
            </button>
          </div>

          {/* Review Visibility Control */}
          <ReviewVisibilityControl 
            isReviewPublic={isReviewPublic}
            onToggle={setIsReviewPublic}
          />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div 
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-background border-t flex items-center justify-between px-4 py-3 z-40"
        style={{
          width: '390px',
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-98"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px'
          }}
        >
          이전
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isSubmitEnabled()}
          className={`flex-1 ml-3 px-6 py-3 rounded-lg transition-all duration-200 ${
            isSubmitEnabled() 
              ? 'hover:bg-primary/90 active:scale-98' 
              : 'cursor-not-allowed opacity-50'
          }`}
          style={{
            backgroundColor: isSubmitEnabled() ? 'var(--primary)' : 'var(--muted)',
            color: isSubmitEnabled() ? '#FFFFFF' : 'var(--muted-foreground)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px'
          }}
        >
          등록
        </button>
      </div>
    </div>
  );
}
