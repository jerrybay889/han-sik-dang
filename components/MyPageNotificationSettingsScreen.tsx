import React, { useState } from 'react';
import { ArrowLeft, Search, MessageCircle, Heart, User } from 'lucide-react';
import { Switch } from './ui/switch';

interface MyPageNotificationSettingsScreenProps {
  onNavigateBack?: () => void;
  onSaveSettings?: (settings: NotificationSettings) => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToSaved?: () => void;
  currentSettings?: NotificationSettings;
}

interface NotificationSettings {
  pushNewFollower: boolean;
  pushReviewLikes: boolean;
  pushComments: boolean;
  pushRecommendations: boolean;
  emailWeeklyDigest: boolean;
  emailMarketing: boolean;
  emailEvents: boolean;
  inAppLocationBased: boolean;
  inAppFollowingActivity: boolean;
  doNotDisturbEnabled: boolean;
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
}

export default function MyPageNotificationSettingsScreen({
  onNavigateBack,
  onSaveSettings,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToSaved,
  currentSettings
}: MyPageNotificationSettingsScreenProps) {
  const [settings, setSettings] = useState<NotificationSettings>(currentSettings || {
    pushNewFollower: true,
    pushReviewLikes: true,
    pushComments: true,
    pushRecommendations: true,
    emailWeeklyDigest: true,
    emailMarketing: true,
    emailEvents: true,
    inAppLocationBased: true,
    inAppFollowingActivity: true,
    doNotDisturbEnabled: false,
    doNotDisturbStart: '오후 10:00',
    doNotDisturbEnd: '오전 08:00'
  });

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSaveSettings?.(newSettings);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--background)',
        maxWidth: '390px',
        margin: '0 auto'
      }}
    >
      {/* Global Header */}
      <div
        className="sticky top-0 z-50 bg-background flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: 'var(--border)',
          minHeight: '56px',
          boxShadow: 'var(--elevation-sm)'
        }}
      >
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

        <h1
          className="flex-1 text-center"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          알림 설정
        </h1>

        {/* Spacer for visual balance */}
        <div style={{ width: '44px' }} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Push Notifications Section */}
        <div style={{ paddingTop: '24px' }}>
          <div className="px-4 mb-4">
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              푸시 알림
            </h2>
          </div>

          <div className="bg-card border-t border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  새로운 팔로워
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  다른 사용자가 나를 팔로우할 때
                </p>
              </div>
              <Switch
                checked={settings.pushNewFollower}
                onCheckedChange={() => updateSetting('pushNewFollower', !settings.pushNewFollower)}
                aria-label="새로운 팔로워 토글"
              />
            </div>
            <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  리뷰 좋아요
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  내 리뷰에 좋아요가 달릴 때
                </p>
              </div>
              <Switch
                checked={settings.pushReviewLikes}
                onCheckedChange={() => updateSetting('pushReviewLikes', !settings.pushReviewLikes)}
                aria-label="리뷰 좋아요 토글"
              />
            </div>
            <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  댓글 알림
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  내 리뷰에 댓글이 달릴 때
                </p>
              </div>
              <Switch
                checked={settings.pushComments}
                onCheckedChange={() => updateSetting('pushComments', !settings.pushComments)}
                aria-label="댓글 알림 토글"
              />
            </div>
            <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  추천 레스토랑
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  AI가 새로운 맛집을 추천할 때
                </p>
              </div>
              <Switch
                checked={settings.pushRecommendations}
                onCheckedChange={() => updateSetting('pushRecommendations', !settings.pushRecommendations)}
                aria-label="추천 레스토랑 토글"
              />
            </div>
          </div>
        </div>

        {/* Email Notifications Section */}
        <div style={{ paddingTop: '32px' }}>
          <div className="px-4 mb-4">
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              이메일 알림
            </h2>
          </div>

          <div className="bg-card border-t border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  주간 추천
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  매주 개인화된 맛집 추천 이메일
                </p>
              </div>
              <Switch
                checked={settings.emailWeeklyDigest}
                onCheckedChange={() => updateSetting('emailWeeklyDigest', !settings.emailWeeklyDigest)}
                aria-label="주간 추천 토글"
              />
            </div>
            <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  마케팅 정보
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  할인 혜택 및 프로모션 정보
                </p>
              </div>
              <Switch
                checked={settings.emailMarketing}
                onCheckedChange={() => updateSetting('emailMarketing', !settings.emailMarketing)}
                aria-label="마케팅 정보 토글"
              />
            </div>
            <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  이벤트 및 프로모션
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  특별 이벤트 및 한시적 혜택
                </p>
              </div>
              <Switch
                checked={settings.emailEvents}
                onCheckedChange={() => updateSetting('emailEvents', !settings.emailEvents)}
                aria-label="이벤트 및 프로모션 토글"
              />
            </div>
          </div>
        </div>

        {/* In-App Notifications Section */}
        <div style={{ paddingTop: '32px' }}>
          <div className="px-4 mb-4">
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              인앱 알림
            </h2>
          </div>

          <div className="bg-card border-t border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  위치 기반 알림
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  내 위치 주변의 새로운 맛집 정보
                </p>
              </div>
              <Switch
                checked={settings.inAppLocationBased}
                onCheckedChange={() => updateSetting('inAppLocationBased', !settings.inAppLocationBased)}
                aria-label="위치 기반 알림 토글"
              />
            </div>
            <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  팔로잉 활동 알림
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  팔로우한 사용자의 새로운 활동
                </p>
              </div>
              <Switch
                checked={settings.inAppFollowingActivity}
                onCheckedChange={() => updateSetting('inAppFollowingActivity', !settings.inAppFollowingActivity)}
                aria-label="팔로잉 활동 알림 토글"
              />
            </div>
          </div>
        </div>

        {/* Notification Time Zone Settings Section */}
        <div style={{ paddingTop: '32px' }}>
          <div className="px-4 mb-4">
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              알림 시간대 설정
            </h2>
          </div>

          <div className="bg-card border-t border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between py-3 px-4">
              <div className="flex-1 mr-4">
                <h4
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-normal)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--foreground)',
                    marginBottom: '4px'
                  }}
                >
                  방해 금지 모드 활성화
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'var(--font-family-primary)',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4'
                  }}
                >
                  설정한 시간 동안 알림을 받지 않습니다
                </p>
              </div>
              <Switch
                checked={settings.doNotDisturbEnabled}
                onCheckedChange={() => updateSetting('doNotDisturbEnabled', !settings.doNotDisturbEnabled)}
                aria-label="방해 금지 모드 토글"
              />
            </div>
            
            {settings.doNotDisturbEnabled && (
              <>
                <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
                <div className="flex items-center justify-between py-3 px-4">
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)'
                    }}
                  >
                    시작 시간
                  </span>
                  <button
                    onClick={() => console.log('Time picker for start time')}
                    className="px-3 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--input-background)',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      minHeight: '40px',
                      minWidth: '80px'
                    }}
                    aria-label={`시작 시간 선택: ${settings.doNotDisturbStart}`}
                  >
                    {settings.doNotDisturbStart}
                  </button>
                </div>
                <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />
                <div className="flex items-center justify-between py-3 px-4">
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)'
                    }}
                  >
                    종료 시간
                  </span>
                  <button
                    onClick={() => console.log('Time picker for end time')}
                    className="px-3 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--input-background)',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)',
                      minHeight: '40px',
                      minWidth: '80px'
                    }}
                    aria-label={`종료 시간 선택: ${settings.doNotDisturbEnd}`}
                  >
                    {settings.doNotDisturbEnd}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Guidance Text */}
        <div style={{ padding: '24px 16px 16px 16px' }}>
          <p
            className="text-center"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)',
              lineHeight: '1.5'
            }}
          >
            알림 설정은 즉시 적용됩니다.
          </p>
        </div>
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
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
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
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
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
          <button
            onClick={onNavigateToSaved}
            className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors"
          >
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
          <button className="flex flex-col items-center py-2 px-4 min-w-0 transition-colors border-b-2 border-primary">
            <User className="w-6 h-6 mb-1" style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
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
