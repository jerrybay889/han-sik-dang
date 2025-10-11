import React from 'react';
import { ArrowLeft, ChevronRight, User, Lock, LogOut, UserX, Bell, Globe, Palette, FileText, Shield, Book, Info } from 'lucide-react';

interface MyPageSettingsScreenProps {
  onNavigateBack?: () => void;
  onNavigateToEditProfile?: () => void;
  onNavigateToPrivacySettings?: () => void;
  onNavigateToChangePassword?: () => void;
  onNavigateToNotificationSettings?: () => void;
  onNavigateToLanguageSettings?: () => void;
  onNavigateToThemeSettings?: () => void;
  onNavigateToNotices?: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToTermsOfService?: () => void;
  onNavigateToVersionInfo?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  isDanger?: boolean;
  onClick?: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <div style={{ padding: '16px' }}>
      <h3
        className="mb-4"
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-medium)',
          fontFamily: 'var(--font-family-primary)',
          color: 'var(--muted-foreground)'
        }}
      >
        {title}
      </h3>
      <div 
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  rightContent, 
  isDanger = false, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 transition-all duration-200 hover:bg-muted active:scale-98 border-b last:border-b-0"
      style={{
        borderColor: 'var(--border)',
        minHeight: '64px',
        textAlign: 'left'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className="flex-shrink-0"
            style={{ 
              color: isDanger ? 'var(--destructive)' : 'var(--muted-foreground)'
            }}
          >
            {icon}
          </div>
          <div className="flex-1">
            <h4
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: isDanger ? 'var(--destructive)' : 'var(--foreground)',
                marginBottom: subtitle ? '2px' : '0'
              }}
            >
              {title}
            </h4>
            {subtitle && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightContent && (
            <span
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--muted-foreground)'
              }}
            >
              {rightContent}
            </span>
          )}
          <ChevronRight 
            className="w-5 h-5 flex-shrink-0" 
            style={{ color: 'var(--muted-foreground)' }} 
          />
        </div>
      </div>
    </button>
  );
};

export default function MyPageSettingsScreen({
  onNavigateBack,
  onNavigateToEditProfile,
  onNavigateToPrivacySettings,
  onNavigateToChangePassword,
  onNavigateToNotificationSettings,
  onNavigateToLanguageSettings,
  onNavigateToThemeSettings,
  onNavigateToNotices,
  onNavigateToPrivacyPolicy,
  onNavigateToTermsOfService,
  onNavigateToVersionInfo,
  onLogout,
  onDeleteAccount
}: MyPageSettingsScreenProps) {
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
          설정
        </h1>

        <div style={{ width: '44px' }} /> {/* Right spacer */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Account Settings Section */}
        <SettingsSection title="계정 설정">
          <SettingsItem
            icon={<User className="w-6 h-6" />}
            title="프로필 편집"
            subtitle="프로필 사진, 닉네임, 소개글 수정"
            onClick={onNavigateToEditProfile}
          />
          <SettingsItem
            icon={<Shield className="w-6 h-6" />}
            title="개인 정보 설정"
            subtitle="프로필 공개 여부 및 활동 내역 공개 설정"
            onClick={onNavigateToPrivacySettings}
          />
          <SettingsItem
            icon={<Lock className="w-6 h-6" />}
            title="비밀번호 변경"
            subtitle="계정 보안을 위해 정기적으로 변경하세요"
            onClick={onNavigateToChangePassword}
          />
          <SettingsItem
            icon={<LogOut className="w-6 h-6" />}
            title="로그아웃"
            subtitle="다른 계정으로 로그인하기"
            onClick={onLogout}
          />
          <SettingsItem
            icon={<UserX className="w-6 h-6" />}
            title="회원 탈퇴"
            subtitle="계정과 모든 데이터가 삭제됩니다"
            isDanger={true}
            onClick={onDeleteAccount}
          />
        </SettingsSection>

        {/* App Settings Section */}
        <SettingsSection title="앱 설정">
          <SettingsItem
            icon={<Bell className="w-6 h-6" />}
            title="알림 설정"
            subtitle="푸시 알림, 마케팅 수신 동의"
            onClick={onNavigateToNotificationSettings}
          />
          <SettingsItem
            icon={<Globe className="w-6 h-6" />}
            title="언어 설정"
            subtitle="앱 표시 언어 변경"
            rightContent="한국어"
            onClick={onNavigateToLanguageSettings}
          />
          <SettingsItem
            icon={<Palette className="w-6 h-6" />}
            title="테마 설정"
            subtitle="라이트/다크 모드 설정"
            rightContent="라이트"
            onClick={onNavigateToThemeSettings}
          />
        </SettingsSection>

        {/* Information Section */}
        <SettingsSection title="정보">
          <SettingsItem
            icon={<FileText className="w-6 h-6" />}
            title="공지사항"
            subtitle="앱 업데이트 및 이벤트 소식"
            onClick={onNavigateToNotices}
          />
          <SettingsItem
            icon={<Shield className="w-6 h-6" />}
            title="개인정보 처리방침"
            subtitle="개인정보 보호 및 처리 정책"
            onClick={onNavigateToPrivacyPolicy}
          />
          <SettingsItem
            icon={<Book className="w-6 h-6" />}
            title="이용약관"
            subtitle="서비스 이용 약관 및 정책"
            onClick={onNavigateToTermsOfService}
          />
          <SettingsItem
            icon={<Info className="w-6 h-6" />}
            title="버전 정보"
            subtitle="현재 앱 버전과 업데이트 정보"
            rightContent="1.0.0"
            onClick={onNavigateToVersionInfo}
          />
        </SettingsSection>

        {/* Footer Space */}
        <div className="text-center py-8">
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            한식당 앱 v1.0.0
          </p>
          <p
            className="mt-1"
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)'
            }}
          >
            © 2024 한식당. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
