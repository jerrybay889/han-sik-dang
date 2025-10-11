import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Star, ThumbsUp, Heart, Share2, ShoppingCart, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantDetailReviewDetailScreenProps {
  onNavigateBack: () => void;
  onNavigateToReservation?: () => void;
  reviewId: string;
  restaurantId?: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface ReviewData {
  id: string;
  userName: string;
  userAvatar?: string;
  userLevel?: string;
  visitCount?: number;
  rating: number;
  reviewText: string;
  reviewDate: string;
  restaurantName: string;
  restaurantLocation?: string;
  mediaItems: MediaItem[];
  helpfulCount: number;
  isHelpful: boolean;
  ownerReply?: {
    ownerName: string;
    replyText: string;
    replyDate: string;
  };
}

interface RelatedReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  imageUrl?: string;
}

export default function RestaurantDetailReviewDetailScreen({
  onNavigateBack,
  onNavigateToReservation,
  reviewId,
  restaurantId = "myeongdong-kyoja"
}: RestaurantDetailReviewDetailScreenProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);

  // Mock review data - i18n Ready
  const reviewData: ReviewData = {
    id: reviewId,
    userName: "김민지",
    userAvatar: "https://picsum.photos/48/48?random=1",
    userLevel: "맛집 탐험가",
    visitCount: 5,
    rating: 5,
    reviewText: "정말 맛있는 한식집이에요! 특히 김치찌개가 정말 훌륭했습니다. 밑반찬도 정갈하고 맛있어서 계속 리필해서 먹었어요. 직원분들도 너무 친절하셔서 기분 좋게 식사할 수 있었습니다. 다음에도 꼭 다시 오고 싶어요. 가족들과 함께 와도 좋을 것 같고, 데이트 장소로도 추천합니다. 주차공간도 넉넉해서 편리했어요.",
    reviewDate: "2023. 10. 26.",
    restaurantName: "정남옥 구로디지털점",
    restaurantLocation: "구로구 디지털로26길",
    mediaItems: [
      {
        id: "media-1",
        type: "photo",
        url: "https://picsum.photos/800/600?random=10",
        alt: "김치찌개 사진"
      },
      {
        id: "media-2",
        type: "photo", 
        url: "https://picsum.photos/800/600?random=11",
        alt: "밑반찬 사진"
      },
      {
        id: "media-3",
        type: "video",
        url: "https://picsum.photos/800/600?random=12",
        thumbnail: "https://picsum.photos/800/600?random=12",
        alt: "식당 분위기 영상"
      },
      {
        id: "media-4",
        type: "photo",
        url: "https://picsum.photos/800/600?random=13", 
        alt: "전체 식탁 사진"
      }
    ],
    helpfulCount: 123,
    isHelpful: false,
    ownerReply: {
      ownerName: "정남옥 사장",
      replyText: "소중한 리뷰 감사합니다! 김치찌개를 맛있게 드셔주셨다니 정말 기쁩니다. 앞으로도 더욱 맛있는 음식과 친절한 서비스로 보답하겠습니다. 다음에도 꼭 방문해 주세요!",
      replyDate: "2023. 10. 27."
    }
  };

  // Mock related reviews - i18n Ready
  const relatedReviews: RelatedReview[] = [
    {
      id: "rel-1",
      userName: "박서준",
      rating: 4,
      comment: "분위기도 좋고 음식도 맛있어요",
      imageUrl: "https://picsum.photos/300/300?random=20"
    },
    {
      id: "rel-2", 
      userName: "이하영",
      rating: 5,
      comment: "정말 맛있는 한식당입니다",
      imageUrl: "https://picsum.photos/300/300?random=21"
    },
    {
      id: "rel-3",
      userName: "최민호",
      rating: 4,
      comment: "가족과 함께 와서 좋았어요",
      imageUrl: "https://picsum.photos/300/300?random=22"
    },
    {
      id: "rel-4",
      userName: "정유진",
      rating: 5,
      comment: "김치찌개가 정말 끝내줘요!",
      imageUrl: "https://picsum.photos/300/300?random=23"
    },
    {
      id: "rel-5",
      userName: "김태현",
      rating: 4,
      comment: "친절한 서비스에 감동했습니다",
      imageUrl: "https://picsum.photos/300/300?random=24"
    },
    {
      id: "rel-6",
      userName: "송지원",
      rating: 5,
      comment: "완전 맛집이네요!",
      imageUrl: "https://picsum.photos/300/300?random=25"
    }
  ];

  const handleMediaNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMediaIndex((prev) => 
        prev > 0 ? prev - 1 : reviewData.mediaItems.length - 1
      );
    } else {
      setCurrentMediaIndex((prev) => 
        prev < reviewData.mediaItems.length - 1 ? prev + 1 : 0
      );
    }
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentMediaIndex(index);
  };

  const handleHelpfulClick = () => {
    setIsHelpful(!isHelpful);
  };

  const handleShareClick = () => {
    console.log('Share review');
  };

  const handleMoreOptions = () => {
    console.log('Show more options menu');
  };

  const currentMedia = reviewData.mediaItems[currentMediaIndex];

  // Insert Google ads every 9 related reviews
  const getDisplayRelatedItems = () => {
    const items = [];
    const adInterval = 9;
    
    for (let i = 0; i < relatedReviews.length; i++) {
      items.push(relatedReviews[i]);
      
      // Insert ad after every 9th item
      if ((i + 1) % adInterval === 0 && i < relatedReviews.length - 1) {
        items.push({
          id: `ad-${Math.floor(i / adInterval) + 1}`,
          type: 'ad' as const,
          adIndex: Math.floor(i / adInterval) + 1
        });
      }
    }
    
    return items;
  };

  const displayRelatedItems = getDisplayRelatedItems();

  return (
    <div className="min-h-screen bg-background" style={{ maxWidth: '390px', margin: '0 auto' }}>
      {/* Global Header - i18n Ready */}
      <div 
        className="sticky top-0 z-50 bg-background border-b flex items-center justify-between px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        {/* Back Button */}
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
          리뷰 상세
        </h1>

        {/* More Options Button */}
        <button
          onClick={handleMoreOptions}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="더보기"
        >
          <MoreVertical className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 pb-20 overflow-y-auto">
        {/* Review Author & Info Section - i18n Ready */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {/* User Profile */}
          <div className="flex items-center mb-3" style={{ gap: '12px' }}>
            <div 
              className="rounded-full overflow-hidden border"
              style={{
                width: '48px',
                height: '48px',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <ImageWithFallback
                src={reviewData.userAvatar || "https://picsum.photos/48/48?random=1"}
                alt={`${reviewData.userName} 프로필`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-1" style={{ gap: '8px' }}>
                <h3 
                  style={{
                    fontSize: 'var(--text-lg)', // H3 / Bold / 18px
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)'
                  }}
                >
                  {reviewData.userName}
                </h3>
                {reviewData.userLevel && (
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      backgroundColor: 'var(--muted)',
                      color: 'var(--muted-foreground)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {reviewData.userLevel}
                  </span>
                )}
              </div>
              {reviewData.visitCount && (
                <p 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  방문 {reviewData.visitCount}회
                </p>
              )}
            </div>
          </div>

          {/* Rating & Date */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center" style={{ gap: '8px' }}>
              <div className="flex items-center" style={{ gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className="w-4 h-4"
                    style={{ 
                      color: star <= reviewData.rating ? 'var(--accent)' : 'var(--muted-foreground)',
                      fill: star <= reviewData.rating ? 'var(--accent)' : 'none'
                    }}
                  />
                ))}
              </div>
              <span 
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                {reviewData.rating}
              </span>
            </div>
            <span 
              style={{
                fontSize: 'var(--text-base)', // Body / Regular / 16px
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              {reviewData.reviewDate}
            </span>
          </div>

          {/* Restaurant Info */}
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span 
              style={{
                fontSize: 'var(--text-sm)', // Small / Regular / 14px
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              📍
            </span>
            <span 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--primary)'
              }}
            >
              {reviewData.restaurantName}
            </span>
            {reviewData.restaurantLocation && (
              <span 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                · {reviewData.restaurantLocation}
              </span>
            )}
          </div>
        </div>

        {/* Review Text Section - i18n Ready */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p 
            style={{
              fontSize: 'var(--text-base)', // Body / Regular / 16px
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)',
              lineHeight: '1.6'
            }}
          >
            {reviewData.reviewText}
          </p>
        </div>

        {/* Photo/Video Gallery Section */}
        {reviewData.mediaItems.length > 0 && (
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            {/* Main Photo/Video Viewer */}
            <div 
              className="relative rounded-lg overflow-hidden mb-4"
              style={{
                height: '300px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--muted)'
              }}
            >
              <ImageWithFallback
                src={currentMedia.type === 'video' ? currentMedia.thumbnail || currentMedia.url : currentMedia.url}
                alt={currentMedia.alt || "리뷰 사진"}
                className="w-full h-full object-cover"
              />

              {/* Video Play Icon Overlay */}
              {currentMedia.type === 'video' && (
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div 
                    className="rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-xl)'
                    }}
                  >
                    <div 
                      style={{
                        width: '0',
                        height: '0',
                        borderLeft: '20px solid var(--primary)',
                        borderTop: '12px solid transparent',
                        borderBottom: '12px solid transparent',
                        marginLeft: '4px'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Arrows */}
              {reviewData.mediaItems.length > 1 && (
                <>
                  <button
                    onClick={() => handleMediaNavigation('prev')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 hover:bg-black hover:bg-opacity-20 active:scale-95"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: 'var(--radius-lg)',
                      minHeight: '44px',
                      minWidth: '44px'
                    }}
                    aria-label="이전 사진"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={() => handleMediaNavigation('next')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 hover:bg-black hover:bg-opacity-20 active:scale-95"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: 'var(--radius-lg)',
                      minHeight: '44px',
                      minWidth: '44px'
                    }}
                    aria-label="다음 사진"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Media Counter */}
              <div 
                className="absolute bottom-2 right-2 px-2 py-1 rounded text-white text-xs"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {currentMediaIndex + 1}/{reviewData.mediaItems.length}
              </div>
            </div>

            {/* Thumbnails Indicator */}
            {reviewData.mediaItems.length > 1 && (
              <div 
                className="flex overflow-x-auto scrollbar-hide"
                style={{ gap: '8px' }}
              >
                {reviewData.mediaItems.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                      index === currentMediaIndex ? 'ring-2' : 'hover:scale-105'
                    }`}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-lg)',
                      ringColor: index === currentMediaIndex ? 'var(--primary)' : 'transparent'
                    }}
                  >
                    <ImageWithFallback
                      src={media.type === 'video' ? media.thumbnail || media.url : media.url}
                      alt={media.alt || `썸네일 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {media.type === 'video' && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <div 
                          style={{
                            width: '0',
                            height: '0',
                            borderLeft: '8px solid white',
                            borderTop: '5px solid transparent',
                            borderBottom: '5px solid transparent',
                            marginLeft: '2px'
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Download / Share Buttons */}
            <div className="flex items-center justify-center mt-4" style={{ gap: '12px' }}>
              <button
                className="flex items-center px-4 py-2 border rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  gap: '6px',
                  minHeight: '36px'
                }}
              >
                <Download className="w-4 h-4" />
                <span>저장</span>
              </button>
              <button
                onClick={handleShareClick}
                className="flex items-center px-4 py-2 border rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  gap: '6px',
                  minHeight: '36px'
                }}
              >
                <Share2 className="w-4 h-4" />
                <span>공유</span>
              </button>
            </div>
          </div>
        )}

        {/* Google In-App Ad Banner (Fixed Strategic Placement) */}
        <div className="mx-4 my-6">
          <div 
            className="relative w-full rounded-lg overflow-hidden border"
            style={{
              height: '120px',
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            {/* Ad Background Pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
              }}
            />
            
            {/* Ad Content */}
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <div 
                  className="mb-2"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Google 광고
                </div>
                <div 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    opacity: 0.8
                  }}
                >
                  320 x 120px 배너 광고 영역
                </div>
              </div>
            </div>

            {/* Ad Label */}
            <div 
              className="absolute top-2 left-2 px-2 py-1 rounded text-white text-xs"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              광고
            </div>
          </div>
        </div>

        {/* Helpful Button Section - i18n Ready */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={handleHelpfulClick}
            className={`flex items-center px-4 py-3 border rounded-lg transition-all duration-200 hover:bg-muted active:scale-95 ${
              isHelpful ? 'border-primary bg-primary bg-opacity-10' : ''
            }`}
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: isHelpful ? 'var(--primary)' : 'var(--foreground)',
              borderColor: isHelpful ? 'var(--primary)' : 'var(--border)',
              borderRadius: 'var(--radius-lg)',
              gap: '8px',
              minHeight: '44px'
            }}
          >
            <ThumbsUp 
              className="w-5 h-5"
              style={{ 
                fill: isHelpful ? 'var(--primary)' : 'none'
              }}
            />
            <span>도움이 돼요</span>
            <span 
              className="ml-2"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)'
              }}
            >
              {reviewData.helpfulCount + (isHelpful ? 1 : 0)}
            </span>
          </button>
        </div>

        {/* Owner Reply Section - i18n Ready */}
        {reviewData.ownerReply && (
          <div 
            className="mx-4 mb-6 p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--secondary)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div className="flex items-center mb-3" style={{ gap: '8px' }}>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <span 
                  className="text-white text-xs"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)'
                  }}
                >
                  사
                </span>
              </div>
              <span 
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--primary)'
                }}
              >
                {reviewData.ownerReply.ownerName}
              </span>
              <span 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {reviewData.ownerReply.replyDate}
              </span>
            </div>
            <p 
              style={{
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--secondary-foreground)',
                lineHeight: '1.6'
              }}
            >
              {reviewData.ownerReply.replyText}
            </p>
          </div>
        )}

        {/* Related Reviews / Other Photos Section - i18n Ready */}
        <div className="px-4 py-4">
          <h3 
            className="mb-4"
            style={{
              fontSize: 'var(--text-lg)', // H3 / Bold / 18px
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            이 레스토랑의 다른 인기 리뷰
          </h3>

          {/* 3-column grid with ad integration */}
          <div 
            className="grid grid-cols-3 gap-2"
            style={{ gap: '8px' }}
          >
            {displayRelatedItems.map((item, index) => {
              // Render Google Ad
              if ('type' in item && item.type === 'ad') {
                return (
                  <div 
                    key={item.id}
                    className="col-span-3 relative rounded-lg overflow-hidden border mb-2"
                    style={{
                      height: '80px',
                      backgroundColor: 'var(--muted)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    {/* Small Ad Content */}
                    <div className="flex items-center justify-center h-full p-2">
                      <div className="text-center">
                        <div 
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          관련 리뷰 광고
                        </div>
                      </div>
                    </div>
                    <div 
                      className="absolute top-1 left-1 px-1 py-0.5 rounded text-white"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        fontSize: '10px',
                        fontFamily: 'var(--font-family-primary)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      광고
                    </div>
                  </div>
                );
              }

              // Render Related Review
              const review = item as RelatedReview;
              return (
                <div 
                  key={review.id}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  {/* Review Image */}
                  <ImageWithFallback
                    src={review.imageUrl || "https://picsum.photos/300/300?random=30"}
                    alt={`${review.userName}의 리뷰 사진`}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-16"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                    }}
                  />

                  {/* Review Info */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center mb-1" style={{ gap: '4px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className="w-3 h-3"
                          style={{ 
                            color: star <= review.rating ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                            fill: star <= review.rating ? 'var(--accent)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <p 
                      className="text-white text-xs truncate"
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-family-primary)',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                      }}
                    >
                      {review.comment}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Bar - Exact replica from 5.0_Restaurant_Detail_Home */}
      <div 
        className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-background border-t flex items-center justify-between px-4 py-3 z-40"
        style={{
          width: '390px',
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="p-3 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="찜하기"
        >
          <Heart 
            className="w-6 h-6"
            style={{ 
              color: isFavorited ? 'var(--accent)' : 'var(--muted-foreground)',
              fill: isFavorited ? 'var(--accent)' : 'none'
            }}
          />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="p-3 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="공유하기"
        >
          <Share2 className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
        </button>

        {/* Reservation/Order Button */}
        <button
          onClick={onNavigateBack}
          className="flex-1 flex items-center justify-center ml-3 px-6 py-3 rounded-lg transition-all duration-200 hover:bg-primary/90 active:scale-98"
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px',
            gap: '8px'
          }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>이전으로 돌아가기</span>
        </button>
      </div>
    </div>
  );
}
