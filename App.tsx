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

type AppState = 'splash' | 'onboarding' | 'onboarding-ai' | 'onboarding-discover' | 'onboarding-community' | 'onboarding-permission' | 'main' | 'ai-concierge' | 'search' | 'empty' | 'detail' | 'detail-info' | 'detail-menu' | 'menu-ai-modal' | 'detail-reviews' | 'write-review' | 'photo-list' | 'review-detail' | 'menu-list' | 'my-page' | 'settings' | 'saved-list' | 'my-reviews' | 'visit-list' | 'edit-profile' | 'public-profile' | 'privacy-settings' | 'language-settings' | 'notification-settings' | 'user-discovery' | 'follower-management' | 'following-feed' | 'social-feeds' | 'gallery' | 'test-menu';

export default function App() {
  const [appState, setAppState] = useState<AppState>('main');

  const navigate = (newState: AppState) => {
    setAppState(newState);
  };

  const renderScreen = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onNavigateToOnboarding={() => navigate('onboarding')} onNavigateToMain={() => navigate('main')} />;
      case 'main':
        return <MainScreen onNavigateToAI={() => navigate('ai-concierge')} onNavigateToSearchResults={() => navigate('search')} onNavigateToDetail={() => navigate('detail')} onNavigateToSaved={() => navigate('my-page')} onNavigateToProfile={() => navigate('my-page')} onNavigateToTestMenu={() => navigate('test-menu')} />;
      default:
        return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
    }
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <div className="min-h-screen bg-background">{renderScreen()}</div>
    </Suspense>
  );
}