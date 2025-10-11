import React, { useState } from 'react';
import { ArrowLeft, Filter, Star, Edit, Trash2, Image, Heart, Search, MessageCircle, User } from 'lucide-react';

interface MyPageReviewListScreenProps {
  onNavigateBack?: () => void;
  onNavigateToReviewDetail?: (reviewId: string) => void;
  onEditReview?: (reviewId: string) => void;
  onDeleteReview?: (reviewId: string) => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToDiscover?: () => void;
  userId?: string;
}

interface UserReview {
  id: string;
  restaurantName: string;
  restaurantId: string;
  rating: number;
  content: string;
  photos: string[];
  date: string;
  likes: number;
  isLiked: boolean;
  category: string;
}

const ReviewCard: React.FC<UserReview & { 
  onNavigateToDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ 
  restaurantName,
  rating,
  content,
  photos,
  date,
  likes,
  isLiked,
  category,
  onNavigateToDetail,
  onEdit,
  onDelete
}) => {
  return (
    <div 
      className="bg-card rounded-lg border border-border p-4"
      style={{
        borderRadius: 'var(--radius-lg)'
      }}
    >
      {/* Restaurant Info & Actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1" onClick={onNavigateToDetail}>
          <h3
            className="cursor-pointer hover:underline mb-1"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            {restaurantName}
          </h3>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            {category} • {date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg hover:bg-muted"
            style={{
              minHeight: '36px',
              minWidth: '36px'
            }}
          >
            <Edit className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-muted"
            style={{
              minHeight: '36px',
              minWidth: '36px'
            }}
          >
            <Trash2 className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-4 h-4"
            style={{
              color: star <= rating ? 'var(--accent)' : 'var(--muted-foreground)',
              fill: star <= rating ? 'var(--accent)' : 'transparent'
            }}
          />
        ))}
        <span
          className="ml-2"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          {rating.toFixed(1)}
        </span>
      </div>

      {/* Review Content */}
      <p
        className="mb-4"
        style={{
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--foreground)',
          lineHeight: '1.6'
        }}
      >
        {content}
      </p>

      {/* Engagement */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Heart 
            className="w-4 h-4" 
            style={{ 
              color: isLiked ? 'var(--accent)' : 'var(--muted-foreground)',
              fill: isLiked ? 'var(--accent)' : 'transparent'
            }} 
          />
          <span
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            도움돼요 {likes}
          </span>
        </div>
        
        {photos.length > 0 && (
          <div className="flex items-center gap-1">
            <Image className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              {photos.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{
  onNavigateToDiscover?: () => void;
}> = ({ onNavigateToDiscover }) => {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="text-center max-w-sm">
        <Star 
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: 'var(--muted-foreground)' }}
        />
        <h3
          className="mb-3"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          아직 작성한 리뷰가 없어요!
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
          새로운 경험을 공유해보세요!
        </p>
        <button
          onClick={onNavigateToDiscover}
          className="px-6 py-3 rounded-lg"
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
          리뷰 작성하러 가기
        </button>
      </div>
    </div>
  );
};

export default function MyPageReviewListScreen({
  onNavigateBack,
  onNavigateToReviewDetail,
  onEditReview,
  onDeleteReview,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToDiscover,
  userId = "user-vip-123"
}: MyPageReviewListScreenProps) {
  const [activeSort, setActiveSort] = useState<'newest' | 'highest-rated'>('newest');

  // Simplified mock data
  const userReviews: UserReview[] = [
    {
      id: 'review-001',
      restaurantName: '한정식 정원',
      restaurantId: 'korean-garden',
      rating: 4.5,
      content: '정말 맛있는 한정식이었어요! 갈비찜이 부드럽고 달콤했습니다.',
      photos: ['photo1.jpg'],
      date: '2024-10-01',
      likes: 12,
      isLiked: false,
      category: '한정식'
    },
    {
      id: 'review-002',
      restaurantName: '불고기브라더스',
      restaurantId: 'bulgogi-bros',
      rating: 5.0,
      content: '최고의 불고기 맛집! 숯불 불고기가 환상적이었어요.',
      photos: [],
      date: '2024-09-28',
      likes: 8,
      isLiked: true,
      category: '고기집'
    },
    {
      id: 'review-003',
      restaurantName: '김치의 집',
      restaurantId: 'kimchi-house',
      rating: 4.0,
      content: '김치찌개가 정말 맛있어요! 시원하고 칼칼한 맛이 일품입니다.',
      photos: [],
      date: '2024-09-25',
      likes: 5,
      isLiked: false,
      category: '한식'
    }
  ];

  const sortOptions = [
    { id: 'newest', label: '최신순', active: activeSort === 'newest' },
    { id: 'highest-rated', label: '평점 높은순', active: activeSort === 'highest-rated' }
  ];

  const sortedReviews = [...userReviews].sort((a, b) => {
    if (activeSort === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return b.rating - a.rating;
    }
  });

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        maxWidth: '390px',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-50 bg-background flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px'
        }}
      >
        <button
          onClick={onNavigateBack}
          className="p-2 -ml-2 rounded-lg hover:bg-muted"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
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
          내가 쓴 리뷰
        </h1>

        <div style={{ width: '44px' }} />
      </div>

      {/* Sort Options */}
      <div className="sticky top-14 z-40 bg-background border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveSort(option.id as 'newest' | 'highest-rated')}
                className="px-3 py-2 rounded-lg"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: option.active ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)',
                  borderRadius: 'var(--radius-lg)',
                  minHeight: '36px',
                  backgroundColor: option.active ? 'var(--primary)' : 'var(--muted)',
                  color: option.active ? '#FFFFFF' : 'var(--muted-foreground)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <button
            className="p-2 rounded-lg hover:bg-muted"
            style={{
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            <Filter className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {sortedReviews.length > 0 ? (
          <div style={{ padding: '16px' }}>
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  {...review}
                  onNavigateToDetail={() => onNavigateToReviewDetail?.(review.id)}
                  onEdit={() => onEditReview?.(review.id)}
                  onDelete={() => onDeleteReview?.(review.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState onNavigateToDiscover={onNavigateToDiscover} />
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
            className="flex flex-col items-center py-2 px-4 min-w-0"
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
            className="flex flex-col items-center py-2 px-4 min-w-0"
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
          <button className="flex flex-col items-center py-2 px-4 min-w-0">
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
          <button className="flex flex-col items-center py-2 px-4 min-w-0 border-b-2" style={{ borderColor: 'var(--primary)' }}>
            <User className="w-6 h-6 mb-1" style={{ color: 'var(--primary)' }} />
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
