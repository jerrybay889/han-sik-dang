import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface PrivacySettings {
  profilePublic: boolean;
  reviewsPublic: boolean;
  savedRestaurantsPublic: boolean;
}

interface MyPagePrivacySettingsScreenProps {
  onNavigateBack: () => void;
  onSaveSettings: (settings: PrivacySettings) => void;
  currentSettings?: PrivacySettings;
}

export default function MyPagePrivacySettingsScreen({
  onNavigateBack,
  onSaveSettings,
  currentSettings = {
    profilePublic: true,
    reviewsPublic: true,
    savedRestaurantsPublic: false
  }
}: MyPagePrivacySettingsScreenProps) {
  const [settings, setSettings] = useState<PrivacySettings>(currentSettings);

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Auto-save settings when changed
    onSaveSettings(newSettings);
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        maxWidth: '390px', 
        margin: '0 auto',
        backgroundColor: 'var(--background)',
        fontFamily: 'var(--font-family-primary)'
      }}
    >
      {/* Global Header */}
      <header 
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
          minHeight: '44px'
        }}
      >
        {/* Back Button */}
        <button
          onClick={onNavigateBack}
          className="flex items-center justify-center transition-colors hover:bg-muted rounded-lg"
          style={{
            width: '44px',
            height: '44px',
            color: 'var(--foreground)'
          }}
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Title */}
        <h1 
          className="font-medium text-center flex-1"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          개인 정보 설정
        </h1>

        {/* Empty space for alignment */}
        <div style={{ width: '44px' }} />
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Profile Visibility Section */}
        <section 
          className="px-4 py-6 border-b"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)'
          }}
        >
          {/* Section Title */}
          <h2 
            className="mb-4"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            프로필 공개 설정
          </h2>

          {/* Profile Public Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 pr-4">
              <Label 
                htmlFor="profile-public"
                className="cursor-pointer"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                내 프로필 공개
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
                내 프로필을 다른 사용자에게 공개하여 팔로우 및 활동 내역을 공유할 수 있습니다.
              </p>
            </div>
            <Switch
              id="profile-public"
              checked={settings.profilePublic}
              onCheckedChange={(checked) => handleSettingChange('profilePublic', checked)}
              className="ml-auto"
            />
          </div>
        </section>

        {/* UGC Privacy Section */}
        <section 
          className="px-4 py-6"
          style={{
            backgroundColor: 'var(--background)'
          }}
        >
          {/* Section Title */}
          <h2 
            className="mb-4"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-medium)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--foreground)'
            }}
          >
            활동 내역 공개 설정
          </h2>

          {/* Reviews Public Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex-1 pr-4">
              <Label 
                htmlFor="reviews-public"
                className="cursor-pointer"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                내가 쓴 리뷰 공개
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
                내가 쓴 리뷰를 내 프로필 페이지 및 다른 사용자에게 공개합니다.
              </p>
            </div>
            <Switch
              id="reviews-public"
              checked={settings.reviewsPublic}
              onCheckedChange={(checked) => handleSettingChange('reviewsPublic', checked)}
              className="ml-auto"
            />
          </div>

          {/* Saved Restaurants Public Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex-1 pr-4">
              <Label 
                htmlFor="saved-public"
                className="cursor-pointer"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-normal)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--foreground)'
                }}
              >
                내가 저장한 맛집 공개
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
                내가 저장한 맛집 목록을 내 프로필 페이지 및 다른 사용자에게 공개합니다.
              </p>
            </div>
            <Switch
              id="saved-public"
              checked={settings.savedRestaurantsPublic}
              onCheckedChange={(checked) => handleSettingChange('savedRestaurantsPublic', checked)}
              className="ml-auto"
            />
          </div>
        </section>

        {/* Privacy Notice Section */}
        <section 
          className="px-4 py-6 mt-auto"
          style={{
            backgroundColor: 'var(--card)',
            borderTop: '1px solid var(--border)'
          }}
        >
          <div 
            className="p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <h3 
              className="mb-2"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              개인정보 보호 안내
            </h3>
            <p 
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)',
                lineHeight: '1.4'
              }}
            >
              프로필을 비공개로 설정하면 다른 사용자가 회원님의 프로필, 리뷰, 저장 목록을 볼 수 없습니다. 
              언제든지 설정을 변경할 수 있으며, 변경사항은 즉시 적용됩니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
