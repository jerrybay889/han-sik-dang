import React, { useState } from 'react';
import { ArrowLeft, Camera, Play, Filter } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantDetailPhotoListScreenProps {
  onNavigateBack: () => void;
  onAddPhoto: () => void;
  restaurantId: string;
  restaurantName?: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  uploadDate: string;
  userId: string;
  userName: string;
  likes: number;
  isLiked: boolean;
}

type FilterType = 'all' | 'photos' | 'videos';
type SortType = 'newest' | 'recommended' | 'popular';

export default function RestaurantDetailPhotoListScreen({
  onNavigateBack,
  onAddPhoto,
  restaurantId,
  restaurantName = "정남옥 구로디지털점"
}: RestaurantDetailPhotoListScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [sortOption, setSortOption] = useState<SortType>('newest');

  // Mock data for photos and videos - i18n Ready
  const generateMockMediaItems = (): MediaItem[] => {
    const items: MediaItem[] = [];
    const totalItems = 42; // Total number of items to show robust pagination
    
    for (let i = 1; i <= totalItems; i++) {
      const isVideo = Math.random() < 0.3; // ~30% videos
      items.push({
        id: `media-${i}`,
        type: isVideo ? 'video' : 'photo',
        url: `https://picsum.photos/300/300?random=${i + 100}`,
        thumbnail: isVideo ? `https://picsum.photos/300/300?random=${i + 200}` : undefined,
        uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        userId: `user-${Math.floor(Math.random() * 20) + 1}`,
        userName: `사용자${Math.floor(Math.random() * 20) + 1}`,
        likes: Math.floor(Math.random() * 50),
        isLiked: Math.random() < 0.3
      });
    }
    
    return items.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  };

  const [mediaItems] = useState<MediaItem[]>(generateMockMediaItems());

  // Filter and sort media items
  const getFilteredItems = (): MediaItem[] => {
    let filtered = mediaItems;

    // Apply filter
    if (selectedFilter === 'photos') {
      filtered = filtered.filter(item => item.type === 'photo');
    } else if (selectedFilter === 'videos') {
      filtered = filtered.filter(item => item.type === 'video');
    }

    // Apply sort
    switch (sortOption) {
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.likes - a.likes);
        break;
      case 'recommended':
        // Mock recommendation logic - mix of likes and recency
        filtered = [...filtered].sort((a, b) => {
          const scoreA = a.likes + (a.isLiked ? 10 : 0);
          const scoreB = b.likes + (b.isLiked ? 10 : 0);
          return scoreB - scoreA;
        });
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        break;
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();
  const totalCount = mediaItems.length;
  const photoCount = mediaItems.filter(item => item.type === 'photo').length;
  const videoCount = mediaItems.filter(item => item.type === 'video').length;

  // Get count based on current filter
  const getCurrentCount = (): number => {
    switch (selectedFilter) {
      case 'photos': return photoCount;
      case 'videos': return videoCount;
      case 'all':
      default: return totalCount;
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
  };

  const handleSortChange = (sort: SortType) => {
    setSortOption(sort);
  };

  // Insert Google ads every 9 items
  const getDisplayItems = () => {
    const items = [];
    const adInterval = 9;
    
    for (let i = 0; i < filteredItems.length; i++) {
      items.push(filteredItems[i]);
      
      // Insert ad after every 9th item (0-indexed: positions 8, 17, 26, etc.)
      if ((i + 1) % adInterval === 0 && i < filteredItems.length - 1) {
        items.push({
          id: `ad-${Math.floor(i / adInterval) + 1}`,
          type: 'ad' as const,
          adIndex: Math.floor(i / adInterval) + 1
        });
      }
    }
    
    return items;
  };

  const displayItems = getDisplayItems();

  const getSortDisplayText = (sort: SortType): string => {
    switch (sort) {
      case 'newest': return '최신순';
      case 'recommended': return '추천순';
      case 'popular': return '인기순';
      default: return '최신순';
    }
  };

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

        {/* Title with Count - i18n Ready */}
        <h1 
          className="flex-1 text-center"
          style={{
            fontSize: 'var(--text-xl)', // H2 / Bold / 20px
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          사진/영상 ({getCurrentCount().toLocaleString()})
        </h1>

        {/* Add Photo Button */}
        <button
          onClick={onAddPhoto}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="사진 추가"
        >
          <Camera className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Sort & Filter Bar - Sticky, i18n Critical */}
      <div 
        className="sticky top-14 z-40 bg-background border-b px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Filter Chips - Horizontal Auto Layout */}
          <div className="flex" style={{ gap: '8px' }}>
            {/* All Filter */}
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-2 rounded-full border transition-all duration-200 hover:bg-muted active:scale-95 ${
                selectedFilter === 'all' ? 'border-primary bg-primary' : 'border-border bg-background'
              }`}
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: selectedFilter === 'all' ? '#FFFFFF' : 'var(--foreground)',
                borderRadius: 'var(--radius-xl)',
                minHeight: '36px'
              }}
            >
              전체
            </button>

            {/* Photos Only Filter */}
            <button
              onClick={() => handleFilterChange('photos')}
              className={`px-3 py-2 rounded-full border transition-all duration-200 hover:bg-muted active:scale-95 ${
                selectedFilter === 'photos' ? 'border-primary bg-primary' : 'border-border bg-background'
              }`}
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: selectedFilter === 'photos' ? '#FFFFFF' : 'var(--foreground)',
                borderRadius: 'var(--radius-xl)',
                minHeight: '36px'
              }}
            >
              사진만
            </button>

            {/* Videos Only Filter */}
            <button
              onClick={() => handleFilterChange('videos')}
              className={`px-3 py-2 rounded-full border transition-all duration-200 hover:bg-muted active:scale-95 ${
                selectedFilter === 'videos' ? 'border-primary bg-primary' : 'border-border bg-background'
              }`}
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: selectedFilter === 'videos' ? '#FFFFFF' : 'var(--foreground)',
                borderRadius: 'var(--radius-xl)',
                minHeight: '36px'
              }}
            >
              영상만
            </button>
          </div>

          {/* Sort Dropdown/Button - i18n Critical */}
          <div className="relative">
            <button
              className="flex items-center px-3 py-2 border rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '36px',
                gap: '4px'
              }}
              onClick={() => {
                // Cycle through sort options
                const sortOptions: SortType[] = ['newest', 'recommended', 'popular'];
                const currentIndex = sortOptions.indexOf(sortOption);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                handleSortChange(sortOptions[nextIndex]);
              }}
            >
              <Filter className="w-4 h-4" />
              <span>{getSortDisplayText(sortOption)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo/Video Grid List - Scrollable */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div 
          className="grid grid-cols-3 gap-2"
          style={{ gap: '8px' }}
        >
          {displayItems.map((item, index) => {
            // Render Google Ad
            if ('type' in item && item.type === 'ad') {
              return (
                <div 
                  key={item.id}
                  className="col-span-3 relative rounded-lg overflow-hidden border"
                  style={{
                    height: '120px',
                    backgroundColor: 'var(--muted)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '8px'
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
              );
            }

            // Render Media Item (Photo/Video)
            const mediaItem = item as MediaItem;
            const isVideo = mediaItem.type === 'video';

            return (
              <div 
                key={mediaItem.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {/* Photo/Video Thumbnail */}
                <ImageWithFallback
                  src={isVideo ? mediaItem.thumbnail || mediaItem.url : mediaItem.url}
                  alt={isVideo ? "동영상 썸네일" : "사진"}
                  className="w-full h-full object-cover"
                />

                {/* Video Play Icon Overlay */}
                {isVideo && (
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
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-xl)'
                      }}
                    >
                      <Play 
                        className="w-6 h-6 ml-1" 
                        style={{ 
                          color: 'var(--primary)',
                          fill: 'var(--primary)'
                        }} 
                      />
                    </div>
                  </div>
                )}

                {/* Gradient Overlay for better text visibility */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-12"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'
                  }}
                />

                {/* Media Item Info */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: '#FFFFFF',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                    }}
                  >
                    {mediaItem.likes > 0 && (
                      <span>♥ {mediaItem.likes}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Loading More Placeholder */}
        {filteredItems.length > 30 && (
          <div className="mt-8 text-center">
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              더 많은 사진과 영상을 불러오는 중...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
