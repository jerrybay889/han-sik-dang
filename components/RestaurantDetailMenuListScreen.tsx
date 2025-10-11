import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RestaurantDetailMenuListScreenProps {
  onNavigateBack: () => void;
  onNavigateToMenuDetail?: (menuId: string) => void;
  onNavigateToReservation?: () => void;
  restaurantId: string;
  restaurantName?: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
  badges?: ('인기' | '추천' | 'NEW')[];
  category: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function RestaurantDetailMenuListScreen({
  onNavigateBack,
  onNavigateToMenuDetail,
  onNavigateToReservation,
  restaurantId,
  restaurantName = "정남옥 구로디지털점"
}: RestaurantDetailMenuListScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [isFavorited, setIsFavorited] = useState(false);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  // Mock menu data - i18n Ready
  const menuCategories: MenuCategory[] = [
    {
      id: 'signature',
      name: '대표 메뉴',
      items: [
        {
          id: 'seolleongtang-1',
          name: '설렁탕',
          price: '12,000원',
          description: '깊고 진한 육수의 전통 설렁탕',
          imageUrl: 'https://picsum.photos/80/80?random=1',
          badges: ['인기', '추천'],
          category: '대표 메뉴'
        },
        {
          id: 'galbitang-1',
          name: '갈비탕',
          price: '15,000원',
          description: '부드러운 갈비가 들어간 진한 국물',
          imageUrl: 'https://picsum.photos/80/80?random=2',
          badges: ['추천'],
          category: '대표 메뉴'
        },
        {
          id: 'bibimbap-1',
          name: '비빔밥',
          price: '11,000원',
          description: '신선한 나물과 고슬고슬한 밥의 조화',
          imageUrl: 'https://picsum.photos/80/80?random=3',
          badges: ['인기'],
          category: '대표 메뉴'
        },
        {
          id: 'bulgogi-1',
          name: '불고기',
          price: '18,000원',
          description: '달콤한 양념에 재운 부드러운 불고기',
          imageUrl: 'https://picsum.photos/80/80?random=4',
          badges: ['인기'],
          category: '대표 메뉴'
        },
        {
          id: 'kimchi-jjigae-1',
          name: '김치찌개',
          price: '9,000원',
          description: '신김치로 끓인 얼큰한 찌개',
          imageUrl: 'https://picsum.photos/80/80?random=5',
          category: '대표 메뉴'
        }
      ]
    },
    {
      id: 'meals',
      name: '식사',
      items: [
        {
          id: 'korean-set-1',
          name: '한정식',
          price: '25,000원',
          description: '다양한 반찬과 함께하는 정통 한정식',
          imageUrl: 'https://picsum.photos/80/80?random=6',
          badges: ['추천'],
          category: '식사'
        },
        {
          id: 'naengmyeon-1',
          name: '냉면',
          price: '8,000원',
          description: '시원한 동치미 육수의 냉면',
          imageUrl: 'https://picsum.photos/80/80?random=7',
          category: '식사'
        },
        {
          id: 'jjajangmyeon-1',
          name: '짜장면',
          price: '7,000원',
          description: '고소한 춘장 소스의 짜장면',
          imageUrl: 'https://picsum.photos/80/80?random=8',
          category: '식사'
        },
        {
          id: 'fried-rice-1',
          name: '볶음밥',
          price: '9,000원',
          description: '김치와 함께 볶은 고소한 볶음밥',
          imageUrl: 'https://picsum.photos/80/80?random=9',
          category: '식사'
        },
        {
          id: 'gukbap-1',
          name: '국밥',
          price: '8,500원',
          description: '든든한 돼지국밥',
          imageUrl: 'https://picsum.photos/80/80?random=10',
          category: '식사'
        },
        {
          id: 'doenjang-jjigae-1',
          name: '된장찌개',
          price: '8,000원',
          description: '구수한 된장으로 끓인 찌개',
          imageUrl: 'https://picsum.photos/80/80?random=11',
          category: '식사'
        }
      ]
    },
    {
      id: 'sides',
      name: '사이드',
      items: [
        {
          id: 'pajeon-1',
          name: '파전',
          price: '12,000원',
          description: '바삭한 파전',
          imageUrl: 'https://picsum.photos/80/80?random=12',
          category: '사이드'
        },
        {
          id: 'kimchi-1',
          name: '배추김치',
          price: '5,000원',
          description: '집에서 담근 배추김치',
          category: '사이드'
        },
        {
          id: 'pickled-radish-1',
          name: '무생채',
          price: '4,000원',
          description: '새콤달콤한 무생채',
          category: '사이드'
        },
        {
          id: 'spinach-1',
          name: '시금치나물',
          price: '3,000원',
          description: '고소한 시금치나물',
          category: '사이드'
        },
        {
          id: 'bean-sprouts-1',
          name: '콩나물무침',
          price: '3,500원',
          description: '아삭한 콩나물무침',
          category: '사이드'
        }
      ]
    },
    {
      id: 'beverages',
      name: '음료',
      items: [
        {
          id: 'sikhye-1',
          name: '식혜',
          price: '3,000원',
          description: '달콤한 전통 식혜',
          category: '음료'
        },
        {
          id: 'cola-1',
          name: '콜라',
          price: '2,000원',
          description: '시원한 콜라',
          category: '음료'
        },
        {
          id: 'sprite-1',
          name: '사이다',
          price: '2,000원',
          description: '시원한 사이다',
          category: '음료'
        },
        {
          id: 'orange-juice-1',
          name: '오렌지주스',
          price: '3,500원',
          description: '신선한 오렌지주스',
          category: '음료'
        },
        {
          id: 'water-1',
          name: '생수',
          price: '1,000원',
          description: '생수',
          category: '음료'
        }
      ]
    },
    {
      id: 'alcohol',
      name: '주류',
      items: [
        {
          id: 'soju-1',
          name: '소주',
          price: '4,000원',
          description: '깔끔한 소주',
          category: '주류'
        },
        {
          id: 'beer-1',
          name: '맥주',
          price: '4,500원',
          description: '시원한 맥주',
          category: '주류'
        },
        {
          id: 'makgeolli-1',
          name: '막걸리',
          price: '5,000원',
          description: '부드러운 막걸리',
          category: '주류'
        },
        {
          id: 'wine-1',
          name: '와인',
          price: '25,000원',
          description: '레드와인',
          category: '주류'
        }
      ]
    }
  ];

  // Category filter options - i18n Ready
  const categoryFilters = [
    { id: '전체', name: '전체' },
    { id: '대표 메뉴', name: '대표 메뉴' },
    { id: '식사', name: '식사' },
    { id: '사이드', name: '사이드' },
    { id: '음료', name: '음료' },
    { id: '주류', name: '주류' }
  ];

  // Get total menu count
  const totalMenuCount = menuCategories.reduce((total, category) => total + category.items.length, 0);

  // Get filtered menu items
  const getFilteredItems = () => {
    if (selectedCategory === '전체') {
      return menuCategories;
    }
    return menuCategories.filter(category => category.name === selectedCategory);
  };

  // Get all items for ad insertion when showing all categories
  const getAllItemsWithAds = () => {
    if (selectedCategory !== '전체') {
      return getFilteredItems();
    }

    const allItems: (MenuItem | { type: 'ad'; id: string; adIndex: number })[] = [];
    const adInterval = 6; // Insert ad every 6 items
    let itemCount = 0;

    menuCategories.forEach((category) => {
      category.items.forEach((item) => {
        allItems.push(item);
        itemCount++;
        
        // Insert ad after every 6th item
        if (itemCount % adInterval === 0) {
          allItems.push({
            type: 'ad',
            id: `ad-${Math.floor(itemCount / adInterval)}`,
            adIndex: Math.floor(itemCount / adInterval)
          });
        }
      });
    });

    return allItems;
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleMenuItemClick = (menuId: string) => {
    if (onNavigateToMenuDetail) {
      onNavigateToMenuDetail(menuId);
    } else {
      console.log(`Navigate to menu detail: ${menuId}`);
    }
  };

  const handleShareClick = () => {
    console.log('Share menu');
  };

  const renderBadge = (badge: string) => {
    const badgeColors = {
      '인기': 'bg-accent text-white',
      '추천': 'bg-primary text-white',
      'NEW': 'bg-destructive text-white'
    };

    return (
      <span
        key={badge}
        className={`px-2 py-1 rounded text-xs ${badgeColors[badge as keyof typeof badgeColors]}`}
        style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family-primary)',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        {badge}
      </span>
    );
  };

  const renderMenuItemCard = (item: MenuItem) => (
    <div
      key={item.id}
      onClick={() => handleMenuItemClick(item.id)}
      className="p-4 border-b cursor-pointer transition-all duration-200 hover:bg-muted active:scale-98"
      style={{
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex items-start" style={{ gap: '12px' }}>
        {/* Menu Info */}
        <div className="flex-1">
          {/* Menu Name & Badges */}
          <div className="flex items-center mb-2" style={{ gap: '8px' }}>
            <h3
              style={{
                fontSize: 'var(--text-base)', // Body / Bold / 16px
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              {item.name}
            </h3>
            {item.badges && (
              <div className="flex" style={{ gap: '4px' }}>
                {item.badges.map(badge => renderBadge(badge))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-2">
            <span
              style={{
                fontSize: 'var(--text-base)', // Body / Medium / 16px
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--primary)'
              }}
            >
              {item.price}
            </span>
          </div>

          {/* Description */}
          {item.description && (
            <p
              style={{
                fontSize: 'var(--text-sm)', // Small / Regular / 14px
                fontWeight: 'var(--font-weight-normal)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)',
                lineHeight: '1.4'
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Menu Image */}
        {item.imageUrl && (
          <div
            className="rounded-lg overflow-hidden flex-shrink-0"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <ImageWithFallback
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderAdBlock = (adIndex: number) => (
    <div
      key={`ad-${adIndex}`}
      className="mx-4 my-4"
    >
      <div
        className="relative w-full rounded-lg overflow-hidden border"
        style={{
          height: '100px',
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
              className="mb-1"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              메뉴 관련 광고
            </div>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)',
                opacity: 0.8
              }}
            >
              Google In-App Ad Block #{adIndex}
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
  );

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
          메뉴 ({totalMenuCount})
        </h1>

        {/* Search Button (Optional) */}
        <button
          onClick={() => console.log('Search menu')}
          className="p-2 -mr-2 rounded-lg transition-all duration-200 hover:bg-muted active:scale-95"
          style={{
            minHeight: '44px',
            minWidth: '44px'
          }}
          aria-label="검색"
        >
          <Search className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      {/* Restaurant Info (Compact Sticky) - i18n Ready */}
      <div
        className="sticky top-14 z-40 bg-background border-b px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        {/* Restaurant Name */}
        <div className="flex items-center justify-between mb-2">
          <h2
            style={{
              fontSize: 'var(--text-lg)', // H3 / Bold / 18px
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            {restaurantName}
          </h2>
          <div className="flex items-center" style={{ gap: '8px' }}>
            {/* Favorite Icon */}
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="p-1"
              aria-label="찜하기"
            >
              <Heart
                className="w-5 h-5"
                style={{
                  color: isFavorited ? 'var(--accent)' : 'var(--muted-foreground)',
                  fill: isFavorited ? 'var(--accent)' : 'none'
                }}
              />
            </button>
            {/* Rating & Review Count */}
            <div className="flex items-center" style={{ gap: '4px' }}>
              <Star className="w-4 h-4" style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                4.5 (234)
              </span>
            </div>
          </div>
        </div>

        {/* Current Tab Indicator - i18n Ready */}
        <div className="flex items-center" style={{ gap: '8px' }}>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            홈
          </span>
          <span style={{ color: 'var(--muted-foreground)' }}>|</span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--primary)'
            }}
          >
            메뉴
          </span>
          <span style={{ color: 'var(--muted-foreground)' }}>|</span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            리뷰
          </span>
          <span style={{ color: 'var(--muted-foreground)' }}>|</span>
          <span
            style={{
              fontSize: 'var(--text-base)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            정보
          </span>
        </div>
      </div>

      {/* Menu Categories (Horizontal Scrollable Tabs/Chips) - i18n Ready */}
      <div
        className="sticky top-28 z-30 bg-background border-b px-4 py-3"
        style={{
          borderColor: 'var(--border)',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
        <div
          ref={categoriesScrollRef}
          className="flex overflow-x-auto scrollbar-hide"
          style={{ gap: '8px' }}
        >
          {categoryFilters.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all duration-200 hover:bg-muted active:scale-95 ${
                selectedCategory === category.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-background'
              }`}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: selectedCategory === category.id ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                fontFamily: 'var(--font-family-primary)',
                color: selectedCategory === category.id ? '#FFFFFF' : 'var(--foreground)',
                borderColor: selectedCategory === category.id ? 'var(--primary)' : 'var(--border)',
                backgroundColor: selectedCategory === category.id ? 'var(--primary)' : 'var(--background)',
                borderRadius: 'var(--radius-lg)',
                minHeight: '36px',
                whiteSpace: 'nowrap'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List by Category (Vertical Scrollable) */}
      <div className="flex-1 pb-20 overflow-y-auto">
        {selectedCategory === '전체' ? (
          // Show all categories with ads
          <div>
            {menuCategories.map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3
                    style={{
                      fontSize: 'var(--text-lg)', // H3 / Bold / 18px
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {category.name}
                  </h3>
                </div>

                {/* Menu Items with Ad Integration */}
                <div>
                  {category.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {renderMenuItemCard(item)}
                      {/* Insert ad after every 6th item within category */}
                      {(index + 1) % 6 === 0 && index < category.items.length - 1 && (
                        renderAdBlock(Math.floor((index + 1) / 6))
                      )}
                    </React.Fragment>
                  ))}
                  {/* Insert ad at the end of each category if items count is divisible by 6 */}
                  {category.items.length % 6 === 0 && renderAdBlock(Math.ceil(category.items.length / 6))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show filtered category
          <div>
            {getFilteredItems().map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3
                    style={{
                      fontSize: 'var(--text-lg)', // H3 / Bold / 18px
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {category.name}
                  </h3>
                </div>

                {/* Menu Items */}
                <div>
                  {category.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {renderMenuItemCard(item)}
                      {/* Insert ad after every 6th item */}
                      {(index + 1) % 6 === 0 && index < category.items.length - 1 && (
                        renderAdBlock(Math.floor((index + 1) / 6))
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
          onClick={onNavigateToReservation}
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
          <ShoppingCart className="w-5 h-5" />
          <span>예약/주문</span>
        </button>
      </div>
    </div>
  );
}
