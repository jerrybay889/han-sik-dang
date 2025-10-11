import React, { useState, useMemo } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface ScreenGalleryViewProps {
  onNavigateBack: () => void;
}

interface ScreenPreview {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: string;
  mockContent: string;
  navigationPath: string;
}

export default function ScreenGalleryView({ onNavigateBack }: ScreenGalleryViewProps) {
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);

  // Mock screen data to avoid heavy component loading
  const allScreens: ScreenPreview[] = useMemo(() => [
    {
      id: '1.0',
      title: '1.0_Splash_Screen',
      subtitle: '앱 시작 화면',
      status: 'completed',
      category: 'Foundation',
      mockContent: '🚀 한식당 로고와 로딩 애니메이션',
      navigationPath: 'splash'
    },
    {
      id: '1.X',
      title: '1.X_Onboarding_Flow',
      subtitle: '온보딩 플로우',
      status: 'completed',
      category: 'Foundation',
      mockContent: '📚 앱 소개 및 권한 요청',
      navigationPath: 'onboarding'
    },
    {
      id: '2.0',
      title: '2.0_Main_Screen',
      subtitle: '메인 화면',
      status: 'completed',
      category: 'Foundation',
      mockContent: '🏠 AI 추천 및 레스토랑 목록',
      navigationPath: 'main'
    },
    {
      id: '3.0',
      title: '3.0_AI_Concierge',
      subtitle: 'AI 컨시어지',
      status: 'completed',
      category: 'Foundation',
      mockContent: '🤖 AI 기반 개인화 추천',
      navigationPath: 'ai-concierge'
    },
    {
      id: '4.0',
      title: '4.0_Search_Results',
      subtitle: '검색 결과',
      status: 'completed',
      category: 'Search',
      mockContent: '📋 필터링된 레스토랑 목록',
      navigationPath: 'search'
    },
    {
      id: '4.1',
      title: '4.1_Search_Results_Empty',
      subtitle: '검색 결과 없음',
      status: 'completed',
      category: 'Search',
      mockContent: '📭 검색 결과가 없을 때 화면',
      navigationPath: 'empty'
    },
    {
      id: '5.0',
      title: '5.0_Restaurant_Detail_Home',
      subtitle: '레스토랑 상세 홈',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '🏪 레스토랑 기본 정보 및 사진',
      navigationPath: 'detail'
    },
    {
      id: '5.1',
      title: '5.1_Restaurant_Detail_Info',
      subtitle: '레스토랑 정보',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '📍 주소, 전화번호, 운영시간',
      navigationPath: 'detail-info'
    },
    {
      id: '5.2',
      title: '5.2_Restaurant_Detail_Menu',
      subtitle: '레스토랑 메뉴',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '🍽️ 메뉴 상세 정보',
      navigationPath: 'detail-menu'
    },
    {
      id: '5.3',
      title: '5.3_Menu_AI_Detail_Modal',
      subtitle: '메뉴 AI 설명',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '🤖 AI 메뉴 설명 모달',
      navigationPath: 'menu-ai-modal'
    },
    {
      id: '5.4',
      title: '5.4_Restaurant_Detail_Review_List',
      subtitle: '리뷰 목록',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '⭐ 사용자 리뷰 목록',
      navigationPath: 'detail-reviews'
    },
    {
      id: '5.5',
      title: '5.5_Restaurant_Detail_Review_Write',
      subtitle: '리뷰 작성',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '✍️ 리뷰 작성 폼',
      navigationPath: 'write-review'
    },
    {
      id: '5.6',
      title: '5.6_Restaurant_Detail_Photo_List',
      subtitle: '사진 목록',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '📷 레스토랑 사진 갤러리',
      navigationPath: 'photo-list'
    },
    {
      id: '5.7',
      title: '5.7_Restaurant_Detail_Review_Detail',
      subtitle: '리뷰 상세',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '📝 개별 리뷰 상세 보기',
      navigationPath: 'review-detail'
    },
    {
      id: '5.8',
      title: '5.8_Restaurant_Detail_Menu_List',
      subtitle: '메뉴 목록',
      status: 'completed',
      category: 'Restaurant Detail',
      mockContent: '📋 전체 메뉴 목록',
      navigationPath: 'menu-list'
    },
    {
      id: '6.0',
      title: '6.0_My_Page_Home',
      subtitle: '마이페이지 홈',
      status: 'completed',
      category: 'My Page',
      mockContent: '👤 사용자 프로필 홈',
      navigationPath: 'my-page'
    },
    {
      id: '6.1',
      title: '6.1_My_Page_Settings',
      subtitle: '설정',
      status: 'completed',
      category: 'My Page',
      mockContent: '⚙️ 앱 설정 화면',
      navigationPath: 'settings'
    },
    {
      id: '6.2',
      title: '6.2_My_Page_Saved_List',
      subtitle: '저장 목록',
      status: 'completed',
      category: 'My Page',
      mockContent: '❤️ 찜한 레스토랑 목록',
      navigationPath: 'saved-list'
    },
    {
      id: '6.3',
      title: '6.3_My_Page_Review_List',
      subtitle: '내 리뷰',
      status: 'completed',
      category: 'My Page',
      mockContent: '📝 작성한 리뷰 목록',
      navigationPath: 'my-reviews'
    },
    {
      id: '6.4',
      title: '6.4_My_Page_Visit_List',
      subtitle: '방문 기록',
      status: 'completed',
      category: 'My Page',
      mockContent: '📍 방문한 레스토랑 기록',
      navigationPath: 'visit-list'
    },
    {
      id: '6.5',
      title: '6.5_My_Page_Edit_Profile',
      subtitle: '프로필 편집',
      status: 'completed',
      category: 'My Page',
      mockContent: '✏️ 프로필 정보 수정',
      navigationPath: 'edit-profile'
    },
    {
      id: '6.6',
      title: '6.6_My_Page_Public_Profile',
      subtitle: '공개 프로필',
      status: 'completed',
      category: 'My Page',
      mockContent: '🌟 다른 사용자에게 보이는 프로필',
      navigationPath: 'public-profile'
    },
    {
      id: '6.7',
      title: '6.7_My_Page_Privacy_Settings',
      subtitle: '개인정보 설정',
      status: 'completed',
      category: 'My Page',
      mockContent: '🔒 개인정보 보호 설정',
      navigationPath: 'privacy-settings'
    },
    {
      id: '6.8',
      title: '6.8_My_Page_Language_Settings',
      subtitle: '언어 설정',
      status: 'completed',
      category: 'My Page',
      mockContent: '🌍 다국어 지원 설정',
      navigationPath: 'language-settings'
    },
    {
      id: '6.9',
      title: '6.9_Social_Activity_Feeds',
      subtitle: '소셜 활동 피드',
      status: 'completed',
      category: 'Social',
      mockContent: '📱 팔로워 활동 피드',
      navigationPath: 'social-feeds'
    },
    {
      id: '6.10',
      title: '6.10_User_Discovery',
      subtitle: '사용자 발견',
      status: 'completed',
      category: 'Social',
      mockContent: '👥 새로운 사용자 발견',
      navigationPath: 'user-discovery'
    },
    {
      id: '6.11',
      title: '6.11_Follower_Management',
      subtitle: '팔로워 관리',
      status: 'completed',
      category: 'Social',
      mockContent: '👫 팔로워/팔로잉 관리',
      navigationPath: 'follower-management'
    },
    {
      id: '6.12',
      title: '6.12_Following_Feed',
      subtitle: '팔로잉 피드',
      status: 'completed',
      category: 'Social',
      mockContent: '📰 팔로잉 사용자 피드',
      navigationPath: 'following-feed'
    },
    {
      id: '6.13',
      title: '6.13_Notification_Settings',
      subtitle: '알림 설정',
      status: 'completed',
      category: 'My Page',
      mockContent: '🔔 알림 설정 화면',
      navigationPath: 'notification-settings'
    }
  ], []);

  const handleScreenClick = (screenId: string) => {
    setSelectedScreen(selectedScreen === screenId ? null : screenId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--primary)';
      case 'in-progress': return 'var(--accent)';
      case 'upcoming': return 'var(--muted-foreground)';
      default: return 'var(--muted-foreground)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '완료';
      case 'in-progress': return '진행중';
      case 'upcoming': return '예정';
      default: return '상태';
    }
  };

  // Sort screens by ID for proper ordering
  const sortedScreens = useMemo(() => 
    [...allScreens].sort((a, b) => {
      const aNum = parseFloat(a.id.replace(/[^0-9.]/g, ''));
      const bNum = parseFloat(b.id.replace(/[^0-9.]/g, ''));
      return aNum - bNum;
    }), [allScreens]
  );

  // Split screens into three rows for 3-row layout
  const screensPerRow = Math.ceil(sortedScreens.length / 3);
  const firstRow = sortedScreens.slice(0, screensPerRow);
  const secondRow = sortedScreens.slice(screensPerRow, screensPerRow * 2);
  const thirdRow = sortedScreens.slice(screensPerRow * 2);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md mx-auto min-h-screen">
        {/* Header */}
        <div 
          className="sticky top-0 z-50 p-4 border-b"
          style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateBack}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
            </button>
            
            <h1
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)',
                textAlign: 'center'
              }}
            >
              전체 화면 갤러리
            </h1>
            
            <div className="w-10 h-10" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Description */}
          <div className="text-center mb-6">
            <h2
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)',
                marginBottom: '8px'
              }}
            >
              ✨ 총 {sortedScreens.length}개 화면 완료! 1.0~6.9 전체 구현 완성 - 3줄 배치로 클릭하여 각 화면을 확대해서 볼 수 있습니다
            </h2>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              한식당 앱의 모든 주요 화면을 한눈에 확인하세요
            </p>
          </div>

          {/* First Row */}
          <div className="mb-3">
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)',
                marginBottom: '8px',
                textAlign: 'center'
              }}
            >
              첫 번째 줄 (1-{firstRow.length}번)
            </h4>
            <div 
              className="flex scrollbar-hide overflow-x-auto pb-2"
              style={{ gap: '8px' }}
            >
              {firstRow.map((screen) => {
                const isSelected = selectedScreen === screen.id;
                
                return (
                  <div
                    key={screen.id}
                    className="flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      width: isSelected ? '280px' : '120px',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      zIndex: isSelected ? 10 : 1
                    }}
                    onClick={() => handleScreenClick(screen.id)}
                  >
                    {/* Screen Title */}
                    <div className="mb-2 text-center">
                      <h3
                        style={{
                          fontSize: isSelected ? 'var(--text-sm)' : '10px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--foreground)',
                          marginBottom: '2px',
                          lineHeight: '1.2'
                        }}
                      >
                        {screen.title}
                      </h3>
                      <p
                        style={{
                          fontSize: isSelected ? 'var(--text-sm)' : '9px',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--muted-foreground)',
                          marginBottom: '2px'
                        }}
                      >
                        {screen.subtitle}
                      </p>
                      {/* Status Badge */}
                      <div
                        className="inline-flex items-center px-1 py-0.5 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(screen.status),
                          fontSize: '8px',
                          fontFamily: 'var(--font-family-primary)',
                          color: '#FFFFFF'
                        }}
                      >
                        <div
                          className="w-1 h-1 rounded-full mr-0.5"
                          style={{ backgroundColor: '#FFFFFF' }}
                        />
                        {getStatusText(screen.status)}
                      </div>
                    </div>

                    {/* Screen Preview */}
                    <div
                      className="relative border rounded-lg overflow-hidden"
                      style={{
                        height: isSelected ? '400px' : '200px',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        borderWidth: isSelected ? '2px' : '1px',
                        backgroundColor: 'var(--card)',
                        boxShadow: isSelected ? 'var(--elevation-sm)' : '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Mock Content */}
                      <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                        <div
                          className="mb-2"
                          style={{
                            fontSize: isSelected ? 'var(--text-xl)' : 'var(--text-lg)',
                            fontFamily: 'var(--font-family-primary)'
                          }}
                        >
                          {screen.mockContent.split(' ')[0]}
                        </div>
                        <p
                          style={{
                            fontSize: isSelected ? 'var(--text-sm)' : '10px',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)',
                            lineHeight: '1.4'
                          }}
                        >
                          {screen.mockContent.substring(screen.mockContent.indexOf(' ') + 1)}
                        </p>
                        
                        {/* Category Badge */}
                        <div
                          className="mt-2 px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--secondary)',
                            fontSize: '8px',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--secondary-foreground)'
                          }}
                        >
                          {screen.category}
                        </div>
                      </div>

                      {/* Expand Icon (when not selected) */}
                      {!isSelected && (
                        <div 
                          className="absolute top-1 right-1 p-1 rounded transition-all duration-200"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 25
                          }}
                        >
                          <ExternalLink className="w-2 h-2" style={{ color: '#FFFFFF' }} />
                        </div>
                      )}
                    </div>

                    {/* Selected Screen Info */}
                    {isSelected && (
                      <div className="mt-2 text-center">
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--primary)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}
                        >
                          ✨ 확대된 화면 - 다시 클릭하면 축소됩니다
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Second Row */}
          <div className="mb-3">
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)',
                marginBottom: '8px',
                textAlign: 'center'
              }}
            >
              두 번째 줄 ({firstRow.length + 1}-{firstRow.length + secondRow.length}번)
            </h4>
            <div 
              className="flex scrollbar-hide overflow-x-auto pb-2"
              style={{ gap: '8px' }}
            >
              {secondRow.map((screen) => {
                const isSelected = selectedScreen === screen.id;
                
                return (
                  <div
                    key={screen.id}
                    className="flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      width: isSelected ? '280px' : '120px',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      zIndex: isSelected ? 10 : 1
                    }}
                    onClick={() => handleScreenClick(screen.id)}
                  >
                    {/* Screen Title */}
                    <div className="mb-2 text-center">
                      <h3
                        style={{
                          fontSize: isSelected ? 'var(--text-sm)' : '10px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--foreground)',
                          marginBottom: '2px',
                          lineHeight: '1.2'
                        }}
                      >
                        {screen.title}
                      </h3>
                      <p
                        style={{
                          fontSize: isSelected ? 'var(--text-sm)' : '9px',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--muted-foreground)',
                          marginBottom: '2px'
                        }}
                      >
                        {screen.subtitle}
                      </p>
                      {/* Status Badge */}
                      <div
                        className="inline-flex items-center px-1 py-0.5 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(screen.status),
                          fontSize: '8px',
                          fontFamily: 'var(--font-family-primary)',
                          color: '#FFFFFF'
                        }}
                      >
                        <div
                          className="w-1 h-1 rounded-full mr-0.5"
                          style={{ backgroundColor: '#FFFFFF' }}
                        />
                        {getStatusText(screen.status)}
                      </div>
                    </div>

                    {/* Screen Preview */}
                    <div
                      className="relative border rounded-lg overflow-hidden"
                      style={{
                        height: isSelected ? '400px' : '200px',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        borderWidth: isSelected ? '2px' : '1px',
                        backgroundColor: 'var(--card)',
                        boxShadow: isSelected ? 'var(--elevation-sm)' : '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Mock Content */}
                      <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                        <div
                          className="mb-2"
                          style={{
                            fontSize: isSelected ? 'var(--text-xl)' : 'var(--text-lg)',
                            fontFamily: 'var(--font-family-primary)'
                          }}
                        >
                          {screen.mockContent.split(' ')[0]}
                        </div>
                        <p
                          style={{
                            fontSize: isSelected ? 'var(--text-sm)' : '10px',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)',
                            lineHeight: '1.4'
                          }}
                        >
                          {screen.mockContent.substring(screen.mockContent.indexOf(' ') + 1)}
                        </p>
                        
                        {/* Category Badge */}
                        <div
                          className="mt-2 px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--secondary)',
                            fontSize: '8px',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--secondary-foreground)'
                          }}
                        >
                          {screen.category}
                        </div>
                      </div>

                      {/* Expand Icon (when not selected) */}
                      {!isSelected && (
                        <div 
                          className="absolute top-1 right-1 p-1 rounded transition-all duration-200"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 25
                          }}
                        >
                          <ExternalLink className="w-2 h-2" style={{ color: '#FFFFFF' }} />
                        </div>
                      )}
                    </div>

                    {/* Selected Screen Info */}
                    {isSelected && (
                      <div className="mt-2 text-center">
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--primary)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}
                        >
                          ✨ 확대된 화면 - 다시 클릭하면 축소됩니다
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Third Row */}
          <div className="mb-4">
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)',
                marginBottom: '8px',
                textAlign: 'center'
              }}
            >
              세 번째 줄 ({firstRow.length + secondRow.length + 1}-{sortedScreens.length}번)
            </h4>
            <div 
              className="flex scrollbar-hide overflow-x-auto pb-2"
              style={{ gap: '8px' }}
            >
              {thirdRow.map((screen) => {
                const isSelected = selectedScreen === screen.id;
                
                return (
                  <div
                    key={screen.id}
                    className="flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      width: isSelected ? '280px' : '120px',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      zIndex: isSelected ? 10 : 1
                    }}
                    onClick={() => handleScreenClick(screen.id)}
                  >
                    {/* Screen Title */}
                    <div className="mb-2 text-center">
                      <h3
                        style={{
                          fontSize: isSelected ? 'var(--text-sm)' : '10px',
                          fontWeight: 'var(--font-weight-medium)',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--foreground)',
                          marginBottom: '2px',
                          lineHeight: '1.2'
                        }}
                      >
                        {screen.title}
                      </h3>
                      <p
                        style={{
                          fontSize: isSelected ? 'var(--text-sm)' : '9px',
                          fontFamily: 'var(--font-family-primary)',
                          color: 'var(--muted-foreground)',
                          marginBottom: '2px'
                        }}
                      >
                        {screen.subtitle}
                      </p>
                      {/* Status Badge */}
                      <div
                        className="inline-flex items-center px-1 py-0.5 rounded-full"
                        style={{
                          backgroundColor: getStatusColor(screen.status),
                          fontSize: '8px',
                          fontFamily: 'var(--font-family-primary)',
                          color: '#FFFFFF'
                        }}
                      >
                        <div
                          className="w-1 h-1 rounded-full mr-0.5"
                          style={{ backgroundColor: '#FFFFFF' }}
                        />
                        {getStatusText(screen.status)}
                      </div>
                    </div>

                    {/* Screen Preview */}
                    <div
                      className="relative border rounded-lg overflow-hidden"
                      style={{
                        height: isSelected ? '400px' : '200px',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        borderWidth: isSelected ? '2px' : '1px',
                        backgroundColor: 'var(--card)',
                        boxShadow: isSelected ? 'var(--elevation-sm)' : '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Mock Content */}
                      <div className="p-4 h-full flex flex-col justify-center items-center text-center">
                        <div
                          className="mb-2"
                          style={{
                            fontSize: isSelected ? 'var(--text-xl)' : 'var(--text-lg)',
                            fontFamily: 'var(--font-family-primary)'
                          }}
                        >
                          {screen.mockContent.split(' ')[0]}
                        </div>
                        <p
                          style={{
                            fontSize: isSelected ? 'var(--text-sm)' : '10px',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--muted-foreground)',
                            lineHeight: '1.4'
                          }}
                        >
                          {screen.mockContent.substring(screen.mockContent.indexOf(' ') + 1)}
                        </p>
                        
                        {/* Category Badge */}
                        <div
                          className="mt-2 px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--secondary)',
                            fontSize: '8px',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--secondary-foreground)'
                          }}
                        >
                          {screen.category}
                        </div>
                      </div>

                      {/* Expand Icon (when not selected) */}
                      {!isSelected && (
                        <div 
                          className="absolute top-1 right-1 p-1 rounded transition-all duration-200"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 25
                          }}
                        >
                          <ExternalLink className="w-2 h-2" style={{ color: '#FFFFFF' }} />
                        </div>
                      )}
                    </div>

                    {/* Selected Screen Info */}
                    {isSelected && (
                      <div className="mt-2 text-center">
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'var(--font-family-primary)',
                            color: 'var(--primary)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}
                        >
                          ✨ 확대된 화면 - 다시 클릭하면 축소됩니다
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div 
              className="text-center p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--primary)',
                  marginBottom: '2px'
                }}
              >
                {sortedScreens.filter(s => s.status === 'completed').length}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                완성
              </div>
            </div>

            <div 
              className="text-center p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--accent)',
                  marginBottom: '2px'
                }}
              >
                {sortedScreens.filter(s => s.status === 'in-progress').length}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                진행중
              </div>
            </div>

            <div 
              className="text-center p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--chart-3)',
                  marginBottom: '2px'
                }}
              >
                95%
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                완성도
              </div>
            </div>

            <div 
              className="text-center p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-medium)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--primary)',
                  marginBottom: '2px'
                }}
              >
                3줄
              </div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                배치
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              💡 각 화면을 클릭하면 상세 정보를 확인할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
