import React, { useState, Suspense, lazy } from 'react';

// Lazy loading for all components
// Foundation screens
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow'));
const OnboardingAI = lazy(() => import('./components/OnboardingAI'));
const OnboardingDiscover = lazy(() => import('./components/OnboardingDiscover'));
const OnboardingCommunity = lazy(() => import('./components/OnboardingCommunity'));
const OnboardingPermission = lazy(() => import('./components/OnboardingPermission'));
const MainScreen = lazy(() => import('./components/MainScreen'));
const AIConciergeScreen = lazy(() => import('./components/AIConciergeScreen'));

// Search & Results
const SearchResultsScreen = lazy(() => import('./components/SearchResultsScreen'));
const SearchResultsEmpty = lazy(() => import('./components/SearchResultsEmpty'));

// Restaurant Detail Series
const RestaurantDetailScreen = lazy(() => import('./components/RestaurantDetailScreen'));
const RestaurantDetailInfoScreen = lazy(() => import('./components/RestaurantDetailInfoScreen'));
const RestaurantDetailMenuScreen = lazy(() => import('./components/RestaurantDetailMenuScreen'));
const MenuAIDetailModal = lazy(() => import('./components/MenuAIDetailModal'));
const RestaurantDetailReviewListScreen = lazy(() => import('./components/RestaurantDetailReviewListScreen'));
const RestaurantDetailReviewWriteScreen = lazy(() => import('./components/RestaurantDetailReviewWriteScreen'));
const RestaurantDetailPhotoListScreen = lazy(() => import('./components/RestaurantDetailPhotoListScreen'));
const RestaurantDetailReviewDetailScreen = lazy(() => import('./components/RestaurantDetailReviewDetailScreen'));
const RestaurantDetailMenuListScreen = lazy(() => import('./components/RestaurantDetailMenuListScreen'));

// My Page Series
const MyPageHomeScreen = lazy(() => import('./components/MyPageHomeScreen'));
const MyPageSettingsScreen = lazy(() => import('./components/MyPageSettingsScreen'));
const MyPageSavedListScreen = lazy(() => import('./components/MyPageSavedListScreen'));
const MyPageReviewListScreen = lazy(() => import('./components/MyPageReviewListScreen'));
const MyPageVisitListScreen = lazy(() => import('./components/MyPageVisitListScreen'));
const MyPageEditProfileScreen = lazy(() => import('./components/MyPageEditProfileScreen'));
const MyPagePublicProfileScreen = lazy(() => import('./components/MyPagePublicProfileScreen'));
const MyPagePrivacySettingsScreen = lazy(() => import('./components/MyPagePrivacySettingsScreen'));
const MyPageLanguageSettingsScreen = lazy(() => import('./components/MyPageLanguageSettingsScreen'));
const MyPageNotificationSettingsScreen = lazy(() => import('./components/MyPageNotificationSettingsScreen'));

// Social & Community
const UserDiscoveryScreen = lazy(() => import('./components/UserDiscoveryScreen'));
const FollowerManagementScreen = lazy(() => import('./components/FollowerManagementScreen'));
const FollowingFeedScreen = lazy(() => import('./components/FollowingFeedScreen'));
const SocialActivityFeedsScreen = lazy(() => import('./components/SocialActivityFeedsScreen'));

// Gallery
const ScreenGalleryView = lazy(() => import('./components/ScreenGalleryView'));

// GitHub Uploaders
const GitHubUploaderScreen = lazy(() => import('./components/GitHubUploaderScreen'));
const GitHubUploader2Utils = lazy(() => import('./components/GitHubUploader2Utils'));
const GitHubUploader3App = lazy(() => import('./components/GitHubUploader3App'));
const GitHubUploader4Part1 = lazy(() => import('./components/GitHubUploader4Part1'));
const GitHubUploader5Part2 = lazy(() => import('./components/GitHubUploader5Part2'));
const GitHubUploader6Part3 = lazy(() => import('./components/GitHubUploader6Part3'));
const GitHubUploader7Part4 = lazy(() => import('./components/GitHubUploader7Part4'));

type AppState = 'splash' | 'onboarding' | 'onboarding-ai' | 'onboarding-discover' | 'onboarding-community' | 'onboarding-permission' | 'main' | 'ai-concierge' | 'search' | 'empty' | 'detail' | 'detail-info' | 'detail-menu' | 'menu-ai-modal' | 'detail-reviews' | 'write-review' | 'photo-list' | 'review-detail' | 'menu-list' | 'my-page' | 'settings' | 'saved-list' | 'my-reviews' | 'visit-list' | 'edit-profile' | 'public-profile' | 'privacy-settings' | 'language-settings' | 'notification-settings' | 'user-discovery' | 'follower-management' | 'following-feed' | 'social-feeds' | 'gallery' | 'test-menu' | 'github-uploader' | 'github-uploader-2' | 'github-uploader-3' | 'github-uploader-4' | 'github-uploader-5' | 'github-uploader-6' | 'github-uploader-7';

// Simple loading spinner
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div 
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        style={{ 
          borderColor: 'var(--primary)',
          borderTopColor: 'transparent'
        }}
      />
      <p 
        style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--muted-foreground)'
        }}
      >
        로딩 중...
      </p>
    </div>
  </div>
);

// Simple error fallback
const ErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center p-4">
      <h2 
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--foreground)',
          marginBottom: '8px'
        }}
      >
        문제가 발생했습니다
      </h2>
      <p 
        style={{
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--muted-foreground)',
          marginBottom: '16px'
        }}
      >
        {error.message}
      </p>
      <button
        onClick={retry}
        style={{
          backgroundColor: 'var(--primary)',
          color: '#FFFFFF',
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-family-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '8px 16px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        다시 시도
      </button>
    </div>
  </div>
);

// Simple error boundary
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }
    return this.props.children;
  }
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('test-menu');

  const navigate = (newState: AppState) => {
    setAppState(newState);
  };

  const renderScreen = () => {
    switch (appState) {
      case 'splash':
        return (
          <SplashScreen 
            onNavigateToOnboarding={() => navigate('onboarding')}
            onNavigateToMain={() => navigate('main')}
          />
        );

      case 'onboarding':
        return (
          <OnboardingFlow 
            onComplete={() => navigate('main')}
            onSkip={() => navigate('main')}
          />
        );

      case 'onboarding-ai':
        return (
          <OnboardingAI 
            onNext={() => navigate('onboarding-discover')}
            onSkip={() => navigate('main')}
          />
        );

      case 'onboarding-discover':
        return (
          <OnboardingDiscover 
            onNext={() => navigate('onboarding-community')}
            onSkip={() => navigate('main')}
          />
        );

      case 'onboarding-community':
        return (
          <OnboardingCommunity 
            onNext={() => navigate('onboarding-permission')}
            onSkip={() => navigate('main')}
          />
        );

      case 'onboarding-permission':
        return (
          <OnboardingPermission 
            onComplete={() => navigate('main')}
            onSkip={() => navigate('main')}
          />
        );

      case 'main':
        return (
          <MainScreen 
            onNavigateToAI={() => navigate('ai-concierge')}
            onNavigateToSearchResults={() => navigate('search')}
            onNavigateToDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
            onNavigateToSaved={() => navigate('my-page')}
            onNavigateToProfile={() => navigate('my-page')}
            onNavigateToTestMenu={() => navigate('test-menu')}
          />
        );

      case 'ai-concierge':
        return (
          <AIConciergeScreen 
            onNavigateBack={() => navigate('main')}
            onNavigateToRestaurantDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
            onNavigateToSearch={() => navigate('search')}
            onNavigateToMain={() => navigate('main')}
            onNavigateToSaved={() => navigate('my-page')}
          />
        );

      case 'search':
        return (
          <SearchResultsScreen 
            onNavigateBack={() => navigate('main')}
            onNavigateToDetail={(restaurantId) => {
              console.log(`Navigate to Restaurant Detail: ${restaurantId}`);
              navigate('detail');
            }}
            onNavigateToAI={() => navigate('ai-concierge')}
            onNavigateToUserProfile={(userId) => {
              console.log(`Navigate to User Profile: ${userId}`);
              navigate('my-page');
            }}
            onFollowUser={(userId) => {
              console.log(`Follow user: ${userId}`);
            }}
            onUnfollowUser={(userId) => {
              console.log(`Unfollow user: ${userId}`);
            }}
            searchQuery="매콤한 저녁 데이트"
          />
        );

      case 'empty':
        return (
          <SearchResultsEmpty 
            onNavigateBack={() => navigate('main')}
            onNavigateToAI={() => navigate('ai-concierge')}
            onResetFilters={() => navigate('search')}
            searchQuery="매콤한 저녁 데이트"
          />
        );

      case 'detail':
        return (
          <RestaurantDetailScreen 
            onNavigateBack={() => navigate('search')}
            onNavigateToMenu={() => navigate('detail-menu')}
            onNavigateToReviews={() => navigate('detail-reviews')}
            onNavigateToWriteReview={() => navigate('write-review')}
            onNavigateToPhotoList={() => navigate('photo-list')}
            onNavigateToAI={() => navigate('ai-concierge')}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'detail-info':
        return (
          <RestaurantDetailInfoScreen 
            onNavigateBack={() => navigate('detail')}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'detail-menu':
        return (
          <RestaurantDetailMenuScreen 
            onNavigateBack={() => navigate('detail')}
            onNavigateToAI={() => navigate('menu-ai-modal')}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'menu-ai-modal':
        return (
          <MenuAIDetailModal 
            onClose={() => navigate('detail-menu')}
            menuItem={{
              id: 'bibimbap-special',
              name: '비빔밥',
              description: '고슬고슬한 밥 위에 나물과 고기를 올린 한국의 대표 요리',
              price: 12000,
              spicyLevel: 2
            }}
          />
        );

      case 'detail-reviews':
        return (
          <RestaurantDetailReviewListScreen 
            onNavigateBack={() => navigate('detail')}
            onNavigateToWriteReview={() => navigate('write-review')}
            onNavigateToReviewDetail={(reviewId) => {
              console.log(`Navigate to review detail: ${reviewId}`);
              navigate('review-detail');
            }}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'write-review':
        return (
          <RestaurantDetailReviewWriteScreen 
            onNavigateBack={() => navigate('detail-reviews')}
            onSubmitReview={() => navigate('detail-reviews')}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'photo-list':
        return (
          <RestaurantDetailPhotoListScreen 
            onNavigateBack={() => navigate('detail')}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'review-detail':
        return (
          <RestaurantDetailReviewDetailScreen 
            onNavigateBack={() => navigate('detail-reviews')}
            reviewId="review-123"
          />
        );

      case 'menu-list':
        return (
          <RestaurantDetailMenuListScreen 
            onNavigateBack={() => navigate('detail')}
            onNavigateToMenuItem={(menuId) => {
              console.log(`Navigate to menu item: ${menuId}`);
              navigate('menu-ai-modal');
            }}
            restaurantId="myeongdong-kyoja"
          />
        );

      case 'gallery':
        return (
          <ScreenGalleryView 
            onNavigateBack={() => navigate('main')}
          />
        );

      case 'github-uploader':
        return (
          <GitHubUploaderScreen 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'github-uploader-2':
        return (
          <GitHubUploader2Utils 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'github-uploader-3':
        return (
          <GitHubUploader3App 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'github-uploader-4':
        return (
          <GitHubUploader4Part1 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'github-uploader-5':
        return (
          <GitHubUploader5Part2 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'github-uploader-6':
        return (
          <GitHubUploader6Part3 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'github-uploader-7':
        return (
          <GitHubUploader7Part4 
            onNavigateBack={() => navigate('test-menu')}
          />
        );

      case 'my-page':
        return (
          <MyPageHomeScreen 
            onNavigateToSettings={() => navigate('settings')}
            onNavigateToReviews={() => navigate('my-reviews')}
            onNavigateToSaved={() => navigate('saved-list')}
            onNavigateToVisits={() => navigate('visit-list')}
            onNavigateToNotice={() => {
              console.log('Navigate to notice');
            }}
            onNavigateToSupport={() => {
              console.log('Navigate to support');
            }}
            onNavigateToProfile={() => navigate('edit-profile')}
            onNavigateToMain={() => navigate('main')}
            onNavigateToSearch={() => navigate('search')}
            onNavigateToAI={() => navigate('ai-concierge')}
            onNavigateToCoupons={() => {
              console.log('Navigate to coupons');
            }}
            onNavigateToNotifications={() => navigate('notification-settings')}
            onNavigateToCreateCollection={() => {
              console.log('Navigate to create collection');
            }}
            onNavigateToBirthdayRegistration={() => {
              console.log('Navigate to birthday registration');
            }}
            userId="user-vip-123"
          />
        );

      case 'settings':
        return (
          <MyPageSettingsScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToLanguage={() => navigate('language-settings')}
            onNavigateToPrivacy={() => navigate('privacy-settings')}
            onNavigateToNotifications={() => navigate('notification-settings')}
          />
        );

      case 'saved-list':
        return (
          <MyPageSavedListScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToRestaurantDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
          />
        );

      case 'my-reviews':
        return (
          <MyPageReviewListScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToReviewDetail={(reviewId) => {
              console.log(`Navigate to review detail: ${reviewId}`);
              navigate('review-detail');
            }}
            onNavigateToRestaurantDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
          />
        );

      case 'visit-list':
        return (
          <MyPageVisitListScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToRestaurantDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
          />
        );

      case 'edit-profile':
        return (
          <MyPageEditProfileScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToPublicProfile={() => navigate('public-profile')}
            onSaveProfile={() => navigate('my-page')}
          />
        );

      case 'public-profile':
        return (
          <MyPagePublicProfileScreen 
            onNavigateBack={() => navigate('edit-profile')}
            userId="user-vip-123"
          />
        );

      case 'privacy-settings':
        return (
          <MyPagePrivacySettingsScreen 
            onNavigateBack={() => navigate('settings')}
          />
        );

      case 'language-settings':
        return (
          <MyPageLanguageSettingsScreen 
            onNavigateBack={() => navigate('settings')}
            onLanguageChange={(language) => {
              console.log(`Language changed to: ${language}`);
            }}
          />
        );

      case 'notification-settings':
        return (
          <MyPageNotificationSettingsScreen 
            onNavigateBack={() => navigate('settings')}
          />
        );

      case 'user-discovery':
        return (
          <UserDiscoveryScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToUserProfile={(userId) => {
              console.log(`Navigate to user profile: ${userId}`);
              navigate('public-profile');
            }}
            onFollowUser={(userId) => {
              console.log(`Follow user: ${userId}`);
            }}
            onUnfollowUser={(userId) => {
              console.log(`Unfollow user: ${userId}`);
            }}
          />
        );

      case 'follower-management':
        return (
          <FollowerManagementScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToUserProfile={(userId) => {
              console.log(`Navigate to user profile: ${userId}`);
              navigate('public-profile');
            }}
            onRemoveFollower={(userId) => {
              console.log(`Remove follower: ${userId}`);
            }}
            onFollowBack={(userId) => {
              console.log(`Follow back user: ${userId}`);
            }}
          />
        );

      case 'following-feed':
        return (
          <FollowingFeedScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToRestaurantDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
            onNavigateToUserProfile={(userId) => {
              console.log(`Navigate to user profile: ${userId}`);
              navigate('public-profile');
            }}
            onLikePost={(postId) => {
              console.log(`Like post: ${postId}`);
            }}
            onCommentPost={(postId) => {
              console.log(`Comment on post: ${postId}`);
            }}
          />
        );

      case 'social-feeds':
        return (
          <SocialActivityFeedsScreen 
            onNavigateBack={() => navigate('my-page')}
            onNavigateToRestaurantDetail={(restaurantId) => {
              console.log(`Navigate to restaurant detail: ${restaurantId}`);
              navigate('detail');
            }}
            onNavigateToUserProfile={(userId) => {
              console.log(`Navigate to user profile: ${userId}`);
              navigate('public-profile');
            }}
            onFollowUser={(userId) => {
              console.log(`Follow user: ${userId}`);
            }}
            onUnfollowUser={(userId) => {
              console.log(`Unfollow user: ${userId}`);
            }}
          />
        );

      case 'test-menu':
        return (
          <div 
            className="min-h-screen"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <div className="max-w-md mx-auto min-h-screen">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    한식당 테스트 메뉴 🍽️
                  </h1>
                  <p 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    총 29개 화면 구현 완료 (95% 완성도)
                  </p>
                </div>
                
                {/* GitHub Upload Progress */}
                <div className="space-y-3 mb-6">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    📤 GitHub 업로드 진행 상황
                  </h3>

                  <button 
                    onClick={() => navigate('github-uploader')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none'
                    }}
                  >
                    ✅ 1단계: 설정 파일 (완료)
                  </button>

                  <button 
                    onClick={() => navigate('github-uploader-2')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none'
                    }}
                  >
                    ✅ 2단계: 유틸리티 파일 (완료)
                  </button>

                  <button 
                    onClick={() => navigate('github-uploader-3')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none'
                    }}
                  >
                    ✅ 3단계: App.tsx (완료)
                  </button>

                  <button 
                    onClick={() => navigate('github-uploader-4')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none'
                    }}
                  >
                    ✅ 4단계: Components Part 1 (완료)
                  </button>

                  <button 
                    onClick={() => navigate('github-uploader-5')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none'
                    }}
                  >
                    ✅ 5단계: Components Part 2 (완료)
                  </button>

                  <button 
                    onClick={() => navigate('github-uploader-6')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none'
                    }}
                  >
                    ✅ 6단계: Components Part 3 (완료)
                  </button>

                  <button 
                    onClick={() => navigate('github-uploader-7')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      minHeight: '44px',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-family-primary)',
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      border: 'none'
                    }}
                  >
                    🚀 7단계: Components Part 4 (5개) - 마지막!
                  </button>
                </div>

                {/* Back to Main Button */}
                <button 
                  onClick={() => navigate('main')}
                  className="block w-full px-4 py-3 mb-6 rounded-lg transition-all duration-200 hover:opacity-90 active:scale-98"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    minHeight: '44px',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-family-primary)',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    border: 'none'
                  }}
                >
                  ← 메인 앱으로 돌아가기
                </button>

                {/* Foundation Screens */}
                <div className="space-y-3">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    🏗️ 기초 화면 (Foundation)
                  </h3>
                  
                  <button 
                    onClick={() => navigate('splash')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🚀 1.0_Splash_Screen
                  </button>
                  
                  <button 
                    onClick={() => navigate('onboarding')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📚 1.X_Onboarding_Flow
                  </button>

                  <button 
                    onClick={() => navigate('onboarding-ai')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-2)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🤖 1.1a_Onboarding_AI
                  </button>

                  <button 
                    onClick={() => navigate('onboarding-discover')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-3)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🔍 1.1b_Onboarding_Discover
                  </button>

                  <button 
                    onClick={() => navigate('onboarding-community')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-5)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    👥 1.2_Onboarding_Community
                  </button>

                  <button 
                    onClick={() => navigate('onboarding-permission')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-4)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🔐 1.3_Onboarding_Permission
                  </button>
                  
                  <button 
                    onClick={() => navigate('main')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🏠 2.0_Main_Screen
                  </button>
                  
                  <button 
                    onClick={() => navigate('ai-concierge')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🤖 3.0_AI_Concierge
                  </button>
                </div>

                {/* Search & Results */}
                <div className="space-y-3 mt-6">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    🔍 검색 & 결과 (4.0+)
                  </h3>
                  
                  <button 
                    onClick={() => navigate('search')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📋 4.0_Search_Results
                  </button>
                  
                  <button 
                    onClick={() => navigate('empty')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-4)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📭 4.1_Search_Results_Empty
                  </button>
                </div>

                {/* Restaurant Details */}
                <div className="space-y-3 mt-6">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    🍽️ 레스토랑 상세 (5.0+)
                  </h3>
                  
                  <button 
                    onClick={() => navigate('detail')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🏪 5.0_Restaurant_Detail_Home
                  </button>

                  <button 
                    onClick={() => navigate('detail-info')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📍 5.1_Restaurant_Detail_Info
                  </button>

                  <button 
                    onClick={() => navigate('detail-menu')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-3)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🍽️ 5.2_Restaurant_Detail_Menu
                  </button>

                  <button 
                    onClick={() => navigate('menu-ai-modal')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-2)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🤖 5.3_Menu_AI_Detail_Modal
                  </button>

                  <button 
                    onClick={() => navigate('detail-reviews')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    ⭐ 5.4_Restaurant_Detail_Review_List
                  </button>

                  <button 
                    onClick={() => navigate('write-review')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    ✍️ 5.5_Restaurant_Detail_Review_Write
                  </button>

                  <button 
                    onClick={() => navigate('photo-list')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-5)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📷 5.6_Restaurant_Detail_Photo_List
                  </button>

                  <button 
                    onClick={() => navigate('review-detail')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-3)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📝 5.7_Restaurant_Detail_Review_Detail
                  </button>

                  <button 
                    onClick={() => navigate('menu-list')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-4)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📋 5.8_Restaurant_Detail_Menu_List
                  </button>
                </div>

                {/* My Page & Profile */}
                <div className="space-y-3 mt-6">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    👤 마이페이지 & 프로필 (6.0+)
                  </h3>
                  
                  <button 
                    onClick={() => navigate('my-page')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🏠 6.0_My_Page_Home
                  </button>

                  <button 
                    onClick={() => navigate('settings')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    ⚙️ 6.1_My_Page_Settings
                  </button>

                  <button 
                    onClick={() => navigate('saved-list')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-2)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    ❤️ 6.2_My_Page_Saved_List
                  </button>

                  <button 
                    onClick={() => navigate('my-reviews')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-3)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📝 6.3_My_Page_Review_List
                  </button>

                  <button 
                    onClick={() => navigate('visit-list')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-5)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📍 6.4_My_Page_Visit_List
                  </button>

                  <button 
                    onClick={() => navigate('edit-profile')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-4)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    ✏️ 6.5_My_Page_Edit_Profile
                  </button>

                  <button 
                    onClick={() => navigate('public-profile')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🌟 6.6_My_Page_Public_Profile
                  </button>

                  <button 
                    onClick={() => navigate('privacy-settings')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🔒 6.7_My_Page_Privacy_Settings
                  </button>

                  <button 
                    onClick={() => navigate('language-settings')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-2)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🌍 6.8_My_Page_Language_Settings
                  </button>

                  <button 
                    onClick={() => navigate('notification-settings')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-3)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🔔 6.13_Notification_Settings
                  </button>
                </div>

                {/* Social & Community */}
                <div className="space-y-3 mt-6">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    👥 소셜 & 커뮤니티 (6.9+)
                  </h3>

                  <button 
                    onClick={() => navigate('social-feeds')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--primary)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📱 6.9_Social_Activity_Feeds
                  </button>

                  <button 
                    onClick={() => navigate('user-discovery')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--accent)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    👥 6.10_User_Discovery
                  </button>

                  <button 
                    onClick={() => navigate('follower-management')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-2)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    👫 6.11_Follower_Management
                  </button>

                  <button 
                    onClick={() => navigate('following-feed')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: 'var(--chart-3)', 
                      fontSize: 'var(--text-sm)', 
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    📰 6.12_Following_Feed
                  </button>
                </div>

                {/* Gallery View */}
                <div className="space-y-3 mt-6">
                  <h3 
                    style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      marginBottom: '8px'
                    }}
                  >
                    🖼️ 전체 보기
                  </h3>
                  
                  <button 
                    onClick={() => navigate('gallery')}
                    className="block w-full px-4 py-3 rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ 
                      fontSize: 'var(--text-base)', 
                      fontWeight: 'var(--font-weight-medium)',
                      fontFamily: 'var(--font-family-primary)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                      color: '#FFFFFF',
                      border: 'none'
                    }}
                  >
                    🖼️ 전체 화면 갤러리 (29개)
                  </button>
                </div>

                {/* Footer Info */}
                <div 
                  className="text-center mt-8 pt-4 border-t" 
                  style={{ borderColor: 'var(--border)' }}
                >
                  <p 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    💡 각 화면별로 개별 테스트가 가능하며, 갤러리에서 모든 화면을 한눈에 볼 수 있습니다
                  </p>
                  <p 
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--muted-foreground)',
                      marginTop: '8px'
                    }}
                  >
                    🎯 총 29개 화면이 카테고리별로 정리되어 있습니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <p style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-family-primary)', color: 'var(--foreground)' }}>
                알 수 없는 화면입니다.
              </p>
              <button 
                onClick={() => navigate('main')}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                메인으로 돌아가기
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <SimpleErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-background">
          {renderScreen()}
        </div>
      </Suspense>
    </SimpleErrorBoundary>
  );
}
