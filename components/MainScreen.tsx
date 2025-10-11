import image_7820f889ab213db5821f3500391bb3253f52c68c from 'figma:asset/7820f889ab213db5821f3500391bb3253f52c68c.png';
// Main Screen Component
import React, { useState, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Star, MapPin, Compass, MessageCircle, Bookmark, User, ChevronRight, Bot, Globe, Heart, RefreshCcw, Flame, Coffee, Users, Building, Car, Truck, Package, Calendar, TrendingUp, Play, Bell } from 'lucide-react';

// Language configuration
const languages = [
  'English',
  '한국어',
  '日본어', 
  '中文',
  'Español',
  'Tiếng Việt',
  'ไทย',
  'Bahasa Indonesia'
];

// Use a placeholder logo URL
const logoUrl = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwbG9nb3xlbnwxfHx8fDE3NTk1MTg0Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

// Region data
const regions = [
  { id: 'gangnam', name: 'Gangnam', nameKr: '강남' },
  { id: 'hongdae', name: 'Hongdae', nameKr: '홍대' },
  { id: 'myeongdong', name: 'Myeongdong', nameKr: '명동' },
  { id: 'itaewon', name: 'Itaewon', nameKr: '이태원' },
  { id: 'insadong', name: 'Insadong', nameKr: '인사동' }
];

// Translation system
const translations = {
  'English': {
    searchPlaceholder: "What Korean food are you craving?",
    regions: {
      currentLocation: 'Current Location'
    },
    filters: {
      'My Saved Places': 'My Saved Places',
      'Delivery': 'Delivery',
      'Takeout': 'Takeout', 
      'Reservation': 'Reservation',
      'Fine Dining': 'Fine Dining',
      'Korean Set': 'Korean Set',
      'BBQ': 'BBQ',
      'Chicken': 'Chicken',
      'Street Food': 'Street Food',
      'Bibimbap': 'Bibimbap',
      'Soup': 'Soup',
      'Seafood': 'Seafood',
      'Pub': 'Pub',
      'Fusion': 'Fusion',
      'Best Value': 'Best Value',
      'Local Favs': 'Local Favs',
      'Veggie Picks': 'Veggie Picks',
      'Halal Safe': 'Halal Safe',
      'Night Bites': 'Night Bites',
      'Must-Try': 'Must-Try'
    },
    sections: {
      'ai-recommendation': 'jerry871, how about some Korean food like this?',
      'ai-subtitle': 'AI recommends places based on your activity',
      'recommended-for-you': 'Recommended for You',
      'recommended-subtitle': 'Personalized picks based on your taste',
      'hidden-gems': 'Hidden Gems',
      'hidden-gems-subtitle': 'Local secrets worth discovering',
      'trending-week': 'Trending This Week',
      'trending-week-subtitle': 'What everyone is talking about',
      'popular-categories': 'Popular Categories',
      'popular-categories-subtitle': 'Explore by cuisine type',
      'popular-reviews': 'Popular Reviews',
      'popular-reviews-subtitle': 'What others are saying',
      'short-form-videos': 'Restaurant Stories',
      'short-form-videos-subtitle': 'Discover through videos',
      'events': 'Special Events',
      'events-subtitle': 'Don\'t miss out on great deals',
      'announcements': 'Announcements',
      'announcements-subtitle': 'Latest updates and news',
      'seeAll': 'See All',
      'details': '자세히 보기'
    },
    bottomNav: {
      discover: 'Discover',
      ai: 'AI Concierge',
      saved: 'Saved',
      my: 'MY'
    }
  },
  '한국어': {
    searchPlaceholder: "어떤 한식이 당기시나요?",
    regions: {
      currentLocation: '현재 위치'
    },
    filters: {
      'My Saved Places': '내가 저장한 곳',
      'Delivery': '배달',
      'Takeout': '포장',
      'Reservation': '예약',
      'Fine Dining': '파인 다이닝',
      'Korean Set': '한정식',
      'BBQ': 'BBQ',
      'Chicken': '치킨',
      'Street Food': '분식',
      'Bibimbap': '비빔밥',
      'Soup': '국탕',
      'Seafood': '해산물',
      'Pub': '주점',
      'Fusion': '퓨전',
      'Best Value': '가성비',
      'Local Favs': '현지인 추천',
      'Veggie Picks': '채식 메뉴',
      'Halal Safe': '할랄 인증',
      'Night Bites': '야식 추천',
      'Must-Try': '인기 메뉴'
    },
    sections: {
      'ai-recommendation': 'jerry871님, 이런 한식은 어떠세요?',
      'ai-subtitle': 'AI가 당신의 활동 기반으로 장소를 추천합니다',
      'recommended-for-you': '당신을 위한 추천',
      'recommended-subtitle': '취향 기반 개인화 추천',
      'hidden-gems': '숨은 맛집',
      'hidden-gems-subtitle': '발견할 가치가 있는 로컬 맛집',
      'trending-week': '이번 주 트렌딩',
      'trending-week-subtitle': '모두가 이야기하는 곳',
      'popular-categories': '인기 카테고리',
      'popular-categories-subtitle': '음식 종류별 탐색',
      'popular-reviews': '인기 리뷰',
      'popular-reviews-subtitle': '다른 사람들의 후기',
      'short-form-videos': '맛집 스토리',
      'short-form-videos-subtitle': '영상으로 만나보세요',
      'events': '특별 이벤트',
      'events-subtitle': '놓치면 안될 특가 정보',
      'announcements': '공지사항',
      'announcements-subtitle': '최신 업데이트 및 소식',
      'seeAll': '모두 보기',
      'details': '자세히 보기'
    },
    bottomNav: {
      discover: '발견',
      ai: 'AI 컨시어지',
      saved: '저장',
      my: 'MY'
    }
  },
  '日本語': {
    searchPlaceholder: "どんな韓国料理が食べたいですか？",
    regions: {
      currentLocation: '現在位置'
    },
    filters: {
      'My Saved Places': '保存済み',
      'Delivery': 'デリバリー',
      'Takeout': 'テイクアウト',
      'Reservation': '予約',
      'Fine Dining': 'ファインダイニング',
      'Korean Set': '韓定食',
      'BBQ': 'BBQ',
      'Chicken': 'チキン',
      'Street Food': '屋台料理',
      'Bibimbap': 'ビビンバ',
      'Soup': 'スープ',
      'Seafood': 'シーフード',
      'Pub': '居酒屋',
      'Fusion': 'フュージョン',
      'Best Value': 'コスパ',
      'Local Favs': '地元おすすめ',
      'Veggie Picks': 'ベジタリアン',
      'Halal Safe': 'ハラル認証',
      'Night Bites': '夜食',
      'Must-Try': '必食メニュー'
    },
    sections: {
      'ai-recommendation': 'jerry871さん、こんな韓国料理はいかがですか？',
      'ai-subtitle': 'AIがあなたの活動に基づいて場所を推奨します',
      'recommended-for-you': 'あなたにおすすめ',
      'recommended-subtitle': '好みに基づくパーソナル推奨',
      'hidden-gems': '隠れた名店',
      'hidden-gems-subtitle': '発見価値のあるローカル店',
      'trending-week': '今週のトレンド',
      'trending-week-subtitle': 'みんなが話している場所',
      'popular-categories': '人気カテゴリー',
      'popular-categories-subtitle': '料理タイプ別探索',
      'popular-reviews': '人気レビュー',
      'popular-reviews-subtitle': '他の人の評価',
      'short-form-videos': 'レストランストーリー',
      'short-form-videos-subtitle': '動画で発見',
      'events': '特別イベント',
      'events-subtitle': '見逃せないお得情報',
      'announcements': 'お知らせ',
      'announcements-subtitle': '最新アップデートとニュース',
      'seeAll': 'すべて見る',
      'details': '자세히 보기'
    },
    bottomNav: {
      discover: '発見',
      ai: 'AIコンシェルジュ',
      saved: '保存',
      my: 'MY'
    }
  }
};

interface MainScreenProps {
  onNavigateToAI?: () => void;
  onNavigateToDetail?: (restaurantId: string) => void;
  onNavigateToSearchResults?: (context?: string) => void;
  onNavigateToSaved?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToTestMenu?: () => void;
}

export default function MainScreen({ 
  onNavigateToAI, 
  onNavigateToDetail, 
  onNavigateToSearchResults,
  onNavigateToSaved,
  onNavigateToProfile,
  onNavigateToTestMenu
}: MainScreenProps) {
  // State Management
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | '한국어' | '日本語'>('English');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('current');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState(new Set(['recommended-1', 'hidden-2']));
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const regionScrollRef = useRef<HTMLDivElement>(null);

  // Get current translation
  const t = translations[selectedLanguage];

  // Event Handlers
  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language as 'English' | '한국어' | '日本語');
    setIsDropdownOpen(false);
  };

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
    console.log(`Region changed to: ${regionId}`);
  };

  const handleSearchClick = () => {
    console.log('Navigate to 3.0 AI Concierge screen (Slide In Up)');
    onNavigateToAI?.();
  };

  const handleRestaurantClick = (restaurantId: string) => {
    console.log(`Navigate to 5.0 Restaurant Detail - ${restaurantId} (Push)`);
    onNavigateToDetail?.(restaurantId);
  };

  const handleSeeAllClick = (section: string) => {
    console.log(`Navigate to 4.0 Search Results (${section}) (Push)`);
    onNavigateToSearchResults?.(section);
  };

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(selectedFilter === filter ? null : filter);
    console.log(`Navigate to 4.0 Search Results with filter: ${filter} (Push)`);
    onNavigateToSearchResults?.(filter);
  };

  const handleBottomNavClick = (item: string) => {
    switch (item) {
      case 'discover':
        console.log('Stay on 2.0 Main Screen');
        break;
      case 'ai':
        console.log('Navigate to 3.0 AI Concierge (Instant)');
        onNavigateToAI?.();
        break;
      case 'saved':
        console.log('Navigate to 6.2 My Saved Lists (Instant)');
        onNavigateToSaved?.();
        break;
      case 'profile':
        console.log('Navigate to 6.0 My Place (Instant)');
        onNavigateToProfile?.();
        break;
    }
  };

  const handleHeartClick = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSavedItems = new Set(savedItems);
    if (savedItems.has(itemId)) {
      newSavedItems.delete(itemId);
    } else {
      newSavedItems.add(itemId);
    }
    setSavedItems(newSavedItems);
    console.log(`${savedItems.has(itemId) ? 'Removed from' : 'Added to'} saved items: ${itemId}`);
  };

  // Korean Food Categories Configuration - As Requested
  const koreanFoodCategories = [
    { 
      key: 'Fine Dining', 
      icon: Star,
      defaultBg: 'bg-purple-50',
      defaultIcon: 'text-purple-600'
    },
    { 
      key: 'Korean Set', 
      icon: Building,
      defaultBg: 'bg-emerald-50',
      defaultIcon: 'text-emerald-600'
    },
    { 
      key: 'BBQ', 
      icon: Flame,
      defaultBg: 'bg-red-50',
      defaultIcon: 'text-red-600'
    },
    { 
      key: 'Chicken', 
      icon: Package,
      defaultBg: 'bg-amber-50',
      defaultIcon: 'text-amber-600'
    },
    { 
      key: 'Street Food', 
      icon: Car,
      defaultBg: 'bg-orange-50',
      defaultIcon: 'text-orange-600'
    },
    { 
      key: 'Bibimbap', 
      icon: Package,
      defaultBg: 'bg-green-50',
      defaultIcon: 'text-green-600'
    },
    { 
      key: 'Soup', 
      icon: Coffee,
      defaultBg: 'bg-blue-50',
      defaultIcon: 'text-blue-600'
    },
    { 
      key: 'Seafood', 
      icon: Users,
      defaultBg: 'bg-cyan-50',
      defaultIcon: 'text-cyan-600'
    },
    { 
      key: 'Pub', 
      icon: Building,
      defaultBg: 'bg-violet-50',
      defaultIcon: 'text-violet-600'
    },
    { 
      key: 'Fusion', 
      icon: Globe,
      defaultBg: 'bg-indigo-50',
      defaultIcon: 'text-indigo-600'
    }
  ];

  const secondaryCategories = [
    { key: 'Best Value', icon: TrendingUp },
    { key: 'Local Favs', icon: MapPin },
    { key: 'Veggie Picks', icon: Coffee },
    { key: 'Halal Safe', icon: Star },
    { key: 'Night Bites', icon: Car },
    { key: 'Must-Try', icon: Flame }
  ];

  // Sample Data - Following Card / Restaurant component structure
  const recommendedRestaurants = [
    {
      id: 'recommended-1',
      name: 'Myeongdong Kyoja',
      rating: 4.9,
      reviewCount: 1247,
      description: 'Famous handmade noodles since 1966',
      priceRange: '$$',
      image: 'https://images.unsplash.com/photo-1552757909-2bc6e5e16ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwcmV2aWV3JTIwdmlkZW8lMjB2ZXJ0aWNhbHxlbnwxfHx8fDE3NTk1MTgzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'recommended-2',
      name: 'Gwangjang Market',
      rating: 4.8,
      reviewCount: 892,
      description: 'Traditional market with authentic street food',
      priceRange: '$',
      image: 'https://images.unsplash.com/photo-1714782380594-d857b46265fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzdHJlZXQlMjBmb29kJTIwbWFya2V0JTIwbmlnaHR8ZW58MXx8fHwxNTU5NTE4NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'recommended-3',
      name: 'Jungsik',
      rating: 4.7,
      reviewCount: 634,
      description: 'Michelin-starred modern Korean cuisine',
      priceRange: '$$$$',
      image: 'https://images.unsplash.com/photo-1573470571028-a0ca7a723959?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzU5NTE4NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const hiddenGemsRestaurants = [
    {
      id: 'hidden-1',
      name: 'Samcheongdong Sujebi',
      rating: 4.6,
      reviewCount: 234,
      description: 'Hidden gem for traditional Korean soup',
      priceRange: '$',
      image: 'https://images.unsplash.com/photo-1665846607973-ff96ae1e4bdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBjaGVmJTIwY29va2luZyUyMHRpa3RvayUyMHZpZGVvfGVufDF8fHx8MTc1OTUxODQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'hidden-2',
      name: 'Hanok Village Makgeolli',
      rating: 4.5,
      reviewCount: 156,
      description: 'Authentic traditional Korean rice wine bar',
      priceRange: '$$',
      image: 'https://images.unsplash.com/photo-1702294185615-dab9cc1597bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMG1hcmtldCUyMHZlbmRvcnxlbnwxfHx8fDE3NTk1MTg0MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const trendingRestaurants = [
    {
      id: 'trending-1',
      name: 'Hanwoo Premium',
      rating: 4.9,
      description: 'Top-grade Korean beef experience',
      priceRange: '$$$$',
      trendingBadge: 'Hot',
      image: 'https://images.unsplash.com/photo-1708388466726-54ff913ad930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBncmlsbGVkJTIwYmVlZiUyMGJ1bGdvZ2l8ZW58MXx8fHwxNzU5NTE3NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'trending-2',
      name: 'K-Fusion Lab',
      rating: 4.7,
      description: 'Modern Korean fusion cuisine',
      priceRange: '$$$',
      trendingBadge: 'New',
      image: 'https://images.unsplash.com/photo-1573470571028-a0ca7a723959?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzU5NTE4NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  const popularCategories = [
    {
      id: 'korean-bbq',
      name: 'Korean BBQ',
      subtitle: '갈비, 불고기, 삼겹살',
      image: 'https://images.unsplash.com/photo-1708388466726-54ff913ad930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBncmlsbGVkJTIwYmVlZiUyMGJ1bGdvZ2l8ZW58MXx8fHwxNzU5NTE3NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'korean-fried-chicken',
      name: 'Korean Fried Chicken',
      subtitle: '양념치킨, 후라이드치킨',
      image: 'https://images.unsplash.com/photo-1708388064672-6536507fdf6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzYW1neWVvcHNhbCUyMGdyaWxsZWQlMjBwb3JrfGVufDF8fHx8MTc1OTUxNzQzNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 'korean-soup',
      name: 'Korean Soup',
      subtitle: '김치찌개, 된장찌개, 설렁탕',
      image: 'https://images.unsplash.com/photo-1703925155035-fd10b9c19b24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzZWFmb29kJTIwcGxhdHRlciUyMGZyZXNofGVufDF8fHx8MTc1OTUxNzQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    }
  ];

  // Announcements Data
  const announcements = [
    {
      id: 'announcement-1',
      title: {
        'English': 'New AI Features Available!',
        '한국어': '새로운 AI 기능 출시!',
        '日本語': '新しいAI機能がリリース!'
      },
      date: '2024.01.15',
      badge: 'NEW',
      description: {
        'English': 'Enhanced AI recommendations for better restaurant discovery',
        '한국어': '향상된 AI 추천으로 더 나은 맛집 발견',
        '日本語': '改善されたAI推薦でより良いレストラン発見'
      }
    },
    {
      id: 'announcement-2',
      title: {
        'English': 'Winter Special Event',
        '한국어': '겨울 특별 이벤트',
        '日本語': '冬の特別イベント'
      },
      date: '2024.01.10',
      badge: 'EVENT',
      description: {
        'English': 'Special discounts on selected Korean restaurants until Feb 28',
        '한국어': '선별된 한식당에서 2월 28일까지 특별 할인',
        '日本語': '選ばれた韓国料理店で2月28日まで特別割引'
      }
    },
    {
      id: 'announcement-3',
      title: {
        'English': 'App Update v2.1.0',
        '한국어': '앱 업데이트 v2.1.0',
        '日本語': 'アプリアップデート v2.1.0'
      },
      date: '2024.01.05',
      badge: 'UPDATE',
      description: {
        'English': 'Bug fixes and performance improvements',
        '한국어': '버그 수정 및 성능 개선',
        '日本語': 'バグ修正とパフォーマンス改善'
      }
    }
  ];

  return (
    <div className="w-[390px] h-[852px] bg-card mx-auto relative overflow-hidden flex flex-col" style={{ fontFamily: 'var(--font-family-primary)' }}>
      {/* Frame: 2.0_Main_Screen - iPhone 14 Pro (390px width per guidelines) */}
      
      {/* Screen Title Header */}
      <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground p-2 text-center z-50">
        <span style={{ fontSize: 'var(--text-sm)' }}>2.0 Main Screen</span>
      </div>
      
      {/* Header / Top - Sticky Top Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border" style={{ boxShadow: 'var(--elevation-sm)' }}>
        <div className="flex items-center justify-between px-4 py-3 pt-12" style={{ gap: '8px' }}>
          {/* Language Selector */}
          <div className="relative">
            <button 
              className="flex items-center gap-1 text-secondary-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <Globe className="w-4 h-4" />
              {selectedLanguage} ▼
            </button>
            
            {/* Global / Language Selector Dropdown - Overlay */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-lg z-50 min-w-[140px]" style={{ boxShadow: 'var(--elevation-sm)' }}>
                {languages.map((language) => (
                  <button
                    key={language}
                    className={`w-full text-left px-4 py-2 hover:bg-secondary transition-colors duration-300 first:rounded-t-lg last:rounded-b-lg ${
                      selectedLanguage === language ? 'text-foreground bg-secondary' : 'text-secondary-foreground'
                    }`}
                    style={{ fontSize: 'var(--text-sm)' }}
                    onClick={() => handleLanguageSelect(language)}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Logo - han sik dang */}
          <div className="flex items-center">
            <ImageWithFallback
              src={image_7820f889ab213db5821f3500391bb3253f52c68c}
              alt="han sik dang"
              className="h-8 w-auto"
            />
          </div>
          
          {/* Future Icon Area */}
          <div className="w-6 h-6">
            {/* Reserved for future features */}
          </div>
        </div>
      </div>

      {/* Main Scrollable Content - Vertical Auto Layout */}
      <div className="flex-1 overflow-y-auto pb-20 snap-y snap-proximity" ref={scrollRef} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <div className="flex items-center justify-center py-4">
            <RefreshCcw className="w-5 h-5 text-secondary-foreground animate-spin" />
            <span className="ml-2 text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>Refreshing...</span>
          </div>
        )}

        {/* Section / Region Navigation */}
        <div className="bg-background border-b border-border">
          <div className="px-4 py-3">
            <div 
              ref={regionScrollRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1"
              style={{ gap: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full transition-all duration-200 snap-start whitespace-nowrap ${
                  selectedRegion === 'current' 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary text-foreground hover:bg-muted hover:text-foreground'
                }`}
                style={{ fontSize: 'var(--text-sm)', gap: '4px' }}
                onClick={() => handleRegionSelect('current')}
              >
                <MapPin className="w-4 h-4" />
                <span>{t.regions.currentLocation}</span>
              </button>
              
              {regions.map((region) => (
                <button
                  key={region.id}
                  className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 snap-start whitespace-nowrap ${
                    selectedRegion === region.id 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  style={{ fontSize: 'var(--text-sm)' }}
                  onClick={() => handleRegionSelect(region.id)}
                >
                  <span>
                    {selectedLanguage === '한국어' ? region.nameKr : region.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section / Search Bar - Input / Search Bar component */}
        <div className="bg-background border-b border-border">
          <div className="px-4 py-3">
            <button 
              className="w-full flex items-center px-4 py-3 bg-input rounded-lg hover:bg-muted transition-colors duration-300 border border-border"
              style={{ gap: '12px' }}
              onClick={handleSearchClick}
            >
              <Search className="w-5 h-5 text-secondary-foreground" />
              <span className="text-secondary-foreground text-left flex-1">
                {t.searchPlaceholder}
              </span>
            </button>
          </div>
        </div>

        {/* Section / Korean Food Categories - Horizontal Scrollable */}
        <div className="bg-background border-b border-border">
          <div className="px-4 py-4">
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1" style={{ gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {koreanFoodCategories.map((category) => (
                <button
                  key={category.key}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg transition-all duration-200 snap-start ${
                    selectedFilter === category.key 
                      ? 'bg-primary text-primary-foreground' 
                      : `${category.defaultBg} ${category.defaultIcon} hover:scale-105 active:scale-95`
                  }`}
                  style={{ 
                    gap: '6px',
                    minWidth: '80px',
                    boxShadow: selectedFilter === category.key ? 'var(--elevation-sm)' : 'none'
                  }}
                  onClick={() => handleFilterClick(category.key)}
                >
                  <category.icon className={`w-6 h-6 ${selectedFilter === category.key ? 'text-primary-foreground' : category.defaultIcon}`} />
                  <span className={`text-center whitespace-nowrap ${selectedFilter === category.key ? 'text-primary-foreground' : 'text-foreground'}`} style={{ fontSize: 'var(--text-sm)', lineHeight: '1.2' }}>
                    {t.filters[category.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section / Secondary Filter Chips - Chip / Filter components */}
        <div className="bg-background border-b border-border">
          <div className="px-4 py-3">
            <div className="flex overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory" style={{ gap: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {secondaryCategories.map((chip) => (
                <button
                  key={chip.key}
                  className={`flex-shrink-0 flex items-center px-4 py-3 rounded-lg transition-all duration-200 snap-start ${
                    selectedFilter === chip.key 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted active:scale-95'
                  }`}
                  style={{ gap: '8px' }}
                  onClick={() => handleFilterClick(chip.key)}
                >
                  <chip.icon className={`w-4 h-4 flex-shrink-0 ${selectedFilter === chip.key ? 'text-primary-foreground' : 'text-secondary-foreground'}`} />
                  <span className={`whitespace-nowrap ${selectedFilter === chip.key ? 'text-primary-foreground' : 'text-secondary-foreground'}`} style={{ fontSize: 'var(--text-sm)' }}>
                    {t.filters[chip.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section / Content Discovery - Vertical Auto Layout */}
        <div className="px-4" style={{ paddingTop: '16px', paddingBottom: '16px', gap: '24px' }}>
          
          {/* Card / AI Recommendation - AI-Powered Personalization Section */}
          <section className="snap-start">
            <button 
              className="w-full bg-background rounded-lg border border-border p-4 hover:bg-card transition-all duration-200 active:scale-[0.98]"
              style={{ boxShadow: 'var(--elevation-sm)' }}
              onClick={() => onNavigateToSearchResults?.('ai-recommendations')}
            >
              <div className="flex items-center" style={{ gap: '12px' }}>
                {/* AI Avatar - Icon / Standard */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 text-left">
                  {/* H2 / Bold / 20px, Color: Text / Primary */}
                  <h2 className="text-foreground mb-1">
                    {t.sections['ai-recommendation']}
                  </h2>
                  {/* Body / Regular / 16px, Color: Text / Secondary */}
                  <p className="text-secondary-foreground">
                    {t.sections['ai-subtitle']}
                  </p>
                </div>
                
                {/* CTA Arrow - Icon / Standard, Color: Accent */}
                <ChevronRight className="w-5 h-5 text-accent" />
              </div>
            </button>
          </section>

          {/* Section / Recommended - Horizontal Scrollable List */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* H2 / Bold / 20px */}
                <h2 className="text-foreground">{t.sections['recommended-for-you']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['recommended-subtitle']}</p>
              </div>
              {/* Button / Text Only - See All */}
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('recommended-for-you')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1" style={{ gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {recommendedRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="snap-start">
                  <RestaurantCard
                    restaurant={restaurant}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    onHeartClick={handleHeartClick}
                    isSaved={savedItems.has(restaurant.id)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section / Banner Advertisement */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="bg-muted rounded-lg p-4 text-center">
              <span className="text-muted-foreground text-sm">광고</span>
            </div>
          </section>

          {/* Section / Event Banner Carousel - 3 Rolling Banners */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <EventBannerCarousel />
          </section>

          {/* Section / Hidden Gems - Horizontal Scrollable List */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground">{t.sections['hidden-gems']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['hidden-gems-subtitle']}</p>
              </div>
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('hidden-gems')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1" style={{ gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {hiddenGemsRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="snap-start">
                  <RestaurantCard
                    restaurant={restaurant}
                    onClick={() => handleRestaurantClick(restaurant.id)}
                    onHeartClick={handleHeartClick}
                    isSaved={savedItems.has(restaurant.id)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section / Trending This Week - Vertical Grid/List */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground">{t.sections['trending-week']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['trending-week-subtitle']}</p>
              </div>
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('trending-week')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div style={{ gap: '16px' }}>
              {trendingRestaurants.map((restaurant) => (
                <TrendingCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                  onHeartClick={handleHeartClick}
                  isSaved={savedItems.has(restaurant.id)}
                />
              ))}
            </div>
          </section>

          {/* Section / Google In-App Advertisement (Banner Ad) */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="bg-primary rounded-lg p-4 text-center">
              <span className="text-white text-sm">한식 문화 체험 광고</span>
            </div>
          </section>

          {/* Section / Popular Categories - Card / Photo components */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground">{t.sections['popular-categories']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['popular-categories-subtitle']}</p>
              </div>
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('popular-categories')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1" style={{ gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {popularCategories.map((category) => (
                <div key={category.id} className="snap-start">
                  <CategoryCard
                    category={category}
                    onClick={() => handleSeeAllClick(`category-${category.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>



          {/* Section / Popular Reviews - Review cards */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground">{t.sections['popular-reviews']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['popular-reviews-subtitle']}</p>
              </div>
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('popular-reviews')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1" style={{ gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                {
                  id: 'review-1',
                  userName: 'FoodieExplorer',
                  rating: 5,
                  reviewText: 'Amazing authentic Korean BBQ! The galbi was perfectly marinated and the banchan was fresh.',
                  restaurantName: 'Seoul Garden BBQ',
                  image: 'https://images.unsplash.com/photo-1552757909-2bc6e5e16ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByZXN0YXVyYW50JTIwcmV2aWV3JTIwdmlkZW8lMjB2ZXJ0aWNhbHxlbnwxfHx8fDE3NTk1MTgzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                },
                {
                  id: 'review-2',
                  userName: 'SeoulExpert',
                  rating: 4,
                  reviewText: 'Great atmosphere and delicious kimchi jjigae. Service was a bit slow but worth the wait.',
                  restaurantName: 'Traditional House',
                  image: 'https://images.unsplash.com/photo-1714782380594-d857b46265fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzdHJlZXQlMjBmb29kJTIwbWFya2V0JTIwbmlnaHR8ZW58MXx8fHwxNTU5NTE4NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                }
              ].map((review) => (
                <div key={review.id} className="snap-start">
                  <div className="w-72 bg-background rounded-lg border border-border p-4 hover:bg-card transition-all duration-200" style={{ boxShadow: 'var(--elevation-sm)' }}>
                    <div className="flex items-center mb-3" style={{ gap: '8px' }}>
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{review.userName}</h4>
                        <div className="flex items-center" style={{ gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.4' }}>
                      {review.reviewText}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {review.restaurantName}
                      </span>
                      <button className="text-accent hover:underline" style={{ fontSize: 'var(--text-sm)' }}>
                        View Restaurant
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section / Short-form Videos - Restaurant Stories */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground">{t.sections['short-form-videos']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['short-form-videos-subtitle']}</p>
              </div>
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('short-form-videos')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1" style={{ gap: '12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                {
                  id: 'video-1',
                  title: 'Making Korean Fried Chicken',
                  restaurant: 'Chicken Plus',
                  views: '12.5K',
                  duration: '0:45',
                  thumbnail: 'https://images.unsplash.com/photo-1665846607973-ff96ae1e4bdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBjaGVmJTIwY29va2luZyUyMHRpa3RvayUyMHZpZGVvfGVufDF8fHx8MTc1OTUxODQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                },
                {
                  id: 'video-2',
                  title: 'Secret to Perfect Bibimbap',
                  restaurant: 'Seoul Kitchen',
                  views: '8.2K',
                  duration: '1:12',
                  thumbnail: 'https://images.unsplash.com/photo-1702294185615-dab9cc1597bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMG1hcmtldCUyMHZlbmRvcnxlbnwxfHx8fDE3NTk1MTg0MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                },
                {
                  id: 'video-3',
                  title: 'BBQ Grilling Techniques',
                  restaurant: 'Gangnam BBQ',
                  views: '15.1K',
                  duration: '0:58',
                  thumbnail: 'https://images.unsplash.com/photo-1708388466726-54ff913ad930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBncmlsbGVkJTIwYmVlZiUyMGJ1bGdvZ2l8ZW58MXx8fHwxNzU5NTE3NDMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                }
              ].map((video) => (
                <div key={video.id} className="snap-start">
                  <div className="w-44 bg-background rounded-lg border border-border overflow-hidden hover:bg-card transition-all duration-200 relative group" style={{ boxShadow: 'var(--elevation-sm)' }}>
                    <div className="relative w-full h-56 bg-secondary">
                      <ImageWithFallback
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-200">
                        <div className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded" style={{ fontSize: 'var(--text-sm)' }}>
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-foreground mb-1" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.3' }}>
                        {video.title}
                      </h4>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {video.restaurant}
                      </p>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {video.views} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>





          {/* Section / Announcements - Vertical List */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-foreground">{t.sections['announcements']}</h2>
                <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{t.sections['announcements-subtitle']}</p>
              </div>
              <button 
                className="text-secondary-foreground hover:text-foreground transition-colors duration-300"
                style={{ fontSize: 'var(--text-sm)' }}
                onClick={() => handleSeeAllClick('announcements')}
              >
                {t.sections.seeAll}
              </button>
            </div>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <button
                  key={announcement.id}
                  className="w-full text-left py-3 border-b border-border hover:bg-card transition-colors duration-200"
                  onClick={() => handleSeeAllClick(`announcement-${announcement.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1" style={{ gap: '8px' }}>
                        <h3 className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                          {announcement.title[selectedLanguage]}
                        </h3>
                        <span className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs">
                          {announcement.badge}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.4' }}>
                        {announcement.description[selectedLanguage]}
                      </p>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {announcement.date}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Section / Rewarded Advertisement */}
          <section className="snap-start" style={{ marginTop: '24px' }}>
            <div className="bg-accent rounded-lg p-4 text-center">
              <span className="text-white text-sm">광고 보고 포인트 받기</span>
            </div>
          </section>

          {/* Bottom Spacing for Fixed Navigation */}
          <div style={{ height: '100px' }}></div>

        </div>
      </div>

      {/* Global / Bottom Navigation Bar - Sticky Bottom Navigation */}
      <div className="sticky bottom-0 z-40 bg-background border-t border-border" style={{ boxShadow: 'var(--elevation-sm)' }}>
        <div className="flex items-center justify-around py-2">
          <BottomNavItem 
            icon={Compass}
            label={t.bottomNav.discover}
            isActive={true}
            onClick={() => handleBottomNavClick('discover')}
          />
          <BottomNavItem 
            icon={MessageCircle}
            label={t.bottomNav.ai}
            isActive={false}
            onClick={() => handleBottomNavClick('ai')}
          />
          <BottomNavItem 
            icon={Bookmark}
            label={t.bottomNav.saved}
            isActive={false}
            onClick={() => handleBottomNavClick('saved')}
          />
          <BottomNavItem 
            icon={User}
            label={t.bottomNav.my}
            isActive={false}
            onClick={() => handleBottomNavClick('profile')}
          />
        </div>
      </div>
    </div>
  );
}

// Card / Restaurant Component
interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    description: string;
    priceRange: string;
    image: string;
  };
  onClick: () => void;
  onHeartClick: (id: string, e: React.MouseEvent) => void;
  isSaved: boolean;
}

function RestaurantCard({ restaurant, onClick, onHeartClick, isSaved }: RestaurantCardProps) {
  return (
    <div className="w-64 bg-background rounded-lg border border-border overflow-hidden hover:bg-card transition-all duration-200 relative group" style={{ boxShadow: 'var(--elevation-sm)' }}>
      {/* Heart Icon */}
      <button
        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-background bg-opacity-90 hover:bg-opacity-100 transition-all duration-300"
        onClick={(e) => onHeartClick(restaurant.id, e)}
      >
        <Heart className={`w-4 h-4 transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-400'}`} />
      </button>

      {/* Clickable Card Content */}
      <button 
        className="w-full text-left active:scale-[0.98] transition-transform duration-200"
        onClick={onClick}
      >
        {/* Restaurant Image */}
        <div className="w-full h-40 bg-secondary">
          <ImageWithFallback
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Restaurant Info */}
        <div className="p-3" style={{ gap: '4px' }}>
          <div className="flex items-center justify-between mb-1">
            {/* H3 / Bold / 18px */}
            <h3 className="text-foreground font-medium">{restaurant.name}</h3>
            {/* Caption / Regular / 12px */}
            <span className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{restaurant.priceRange}</span>
          </div>
          
          <div className="flex items-center mb-1" style={{ gap: '8px' }}>
            <div className="flex items-center" style={{ gap: '4px' }}>
              <Star className="w-3 h-3 text-accent fill-current" />
              {/* Small / Medium / 14px with Accent color */}
              <span className="text-accent font-medium" style={{ fontSize: 'var(--text-sm)' }}>{restaurant.rating}</span>
            </div>
            <span className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>({restaurant.reviewCount} reviews)</span>
          </div>
          
          {/* Body / Regular / 16px */}
          <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{restaurant.description}</p>
        </div>
      </button>
    </div>
  );
}

interface TrendingCardProps {
  restaurant: {
    id: string;
    name: string;
    rating: number;
    description: string;
    priceRange: string;
    trendingBadge: string;
    image: string;
  };
  onClick: () => void;
  onHeartClick: (id: string, e: React.MouseEvent) => void;
  isSaved: boolean;
}

function TrendingCard({ restaurant, onClick, onHeartClick, isSaved }: TrendingCardProps) {
  return (
    <div className="w-full bg-background rounded-lg border border-border overflow-hidden hover:bg-card transition-all duration-200 relative group mb-4" style={{ boxShadow: 'var(--elevation-sm)' }}>
      {/* Trending Badge */}
      <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
        <span className="font-medium" style={{ fontSize: 'var(--text-sm)' }}>{restaurant.trendingBadge}</span>
      </div>

      {/* Heart Icon */}
      <button
        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-background bg-opacity-90 hover:bg-opacity-100 transition-all duration-300"
        onClick={(e) => onHeartClick(restaurant.id, e)}
      >
        <Heart className={`w-4 h-4 transition-colors duration-300 ${isSaved ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-400'}`} />
      </button>

      {/* Clickable Card Content */}
      <button 
        className="w-full text-left active:scale-[0.98] transition-transform duration-200"
        onClick={onClick}
      >
        <div className="flex">
          {/* Restaurant Image */}
          <div className="w-28 h-28 bg-secondary flex-shrink-0">
            <ImageWithFallback
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Restaurant Info */}
          <div className="flex-1 p-4" style={{ gap: '8px' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-foreground">{restaurant.name}</h2>
              <span className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{restaurant.priceRange}</span>
            </div>
            
            <div className="flex items-center" style={{ gap: '8px' }}>
              <div className="flex items-center" style={{ gap: '4px' }}>
                <Star className="w-4 h-4 text-accent fill-current" />
                <span className="text-accent font-medium">{restaurant.rating}</span>
              </div>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            
            <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>{restaurant.description}</p>
          </div>
        </div>
      </button>
    </div>
  );
}

// Card / Photo Component
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    subtitle: string;
    image: string;
  };
  onClick: () => void;
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button 
      className="flex-shrink-0 w-48 h-32 bg-background rounded-lg border border-border overflow-hidden hover:bg-card transition-all duration-200 active:scale-[0.98] relative"
      style={{ boxShadow: 'var(--elevation-sm)' }}
      onClick={onClick}
    >
      <ImageWithFallback
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
        <div className="p-3 text-left text-white">
          <h2 className="mb-1">{category.name}</h2>
          <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>{category.subtitle}</p>
        </div>
      </div>
    </button>
  );
}

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
      <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-secondary-foreground'}`} />
      <span className={`${isActive ? 'text-primary font-medium' : 'text-secondary-foreground'}`} style={{ fontSize: 'var(--text-sm)' }}>
        {label}
      </span>
    </button>
  );
}

// Announcement Card Component
interface AnnouncementCardProps {
  announcement: {
    id: string;
    title: {
      'English': string;
      '한국어': string;
      '日本語': string;
    };
    date: string;
    badge: string;
    description: {
      'English': string;
      '한국어': string;
      '日本語': string;
    };
  };
  language: 'English' | '한국어' | '日本語';
  onClick: () => void;
}

function AnnouncementCard({ announcement, language, onClick }: AnnouncementCardProps) {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return 'bg-accent text-accent-foreground';
      case 'EVENT':
        return 'bg-primary text-primary-foreground';
      case 'UPDATE':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <button 
      className="w-full bg-background rounded-lg border border-border p-4 hover:bg-card transition-all duration-200 active:scale-[0.98] mb-3"
      style={{ boxShadow: 'var(--elevation-sm)' }}
      onClick={onClick}
    >
      <div className="flex items-start" style={{ gap: '12px' }}>
        {/* Announcement Icon */}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-foreground font-medium">
              {announcement.title[language]}
            </h3>
            <span 
              className={`px-2 py-1 rounded-full ${getBadgeColor(announcement.badge)}`}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {announcement.badge}
            </span>
          </div>
          
          <p className="text-secondary-foreground mb-2" style={{ fontSize: 'var(--text-sm)' }}>
            {announcement.description[language]}
          </p>
          
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {announcement.date}
          </span>
        </div>
        
        {/* Arrow Icon */}
        <ChevronRight className="w-5 h-5 text-secondary-foreground" />
      </div>
    </button>
  );
}

// Event Banner Carousel Component - 3 Rolling Banners
function EventBannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = [
    {
      id: 'banner-1',
      title: 'Korean New Year Special',
      subtitle: 'Up to 30% off at selected restaurants',
      description: 'Valid until Feb 28, 2024',
      buttonText: 'View Deals',
      gradient: 'from-accent to-accent/80',
      buttonStyle: 'bg-accent-foreground text-accent'
    },
    {
      id: 'banner-2', 
      title: 'First Visit Bonus',
      subtitle: 'Get 1000 points for your first restaurant review',
      description: 'Start your Korean food journey today',
      buttonText: 'Learn More',
      gradient: 'from-primary to-primary/80',
      buttonStyle: 'bg-primary-foreground text-primary'
    },
    {
      id: 'banner-3',
      title: 'Weekend Special',
      subtitle: 'Free delivery on orders over $30',
      description: 'Available Saturday & Sunday',
      buttonText: 'Order Now',
      gradient: 'from-chart-3 to-chart-3/80',
      buttonStyle: 'bg-white text-chart-3'
    }
  ];

  // Auto-rotate banners every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative overflow-hidden">
      <div className="mb-4">
        <h2 className="text-foreground">Special Events</h2>
        <p className="text-secondary-foreground" style={{ fontSize: 'var(--text-sm)' }}>
          Limited time offers and exclusive deals
        </p>
      </div>
      
      <div className="relative">
        {/* Banner Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
            gap: '0px'
          }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className="w-full flex-shrink-0"
            >
              <div className={`bg-gradient-to-r ${banner.gradient} rounded-lg p-4 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1" style={{ fontSize: 'var(--text-base)' }}>
                        {banner.title}
                      </h3>
                      <p style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>
                        {banner.subtitle}
                      </p>
                      <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>
                        {banner.description}
                      </p>
                    </div>
                    <button 
                      className={`${banner.buttonStyle} px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105`} 
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      {banner.buttonText}
                    </button>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full translate-y-4 -translate-x-4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-4" style={{ gap: '8px' }}>
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentIndex === index 
                  ? 'bg-accent' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
