import React, { useState } from 'react';
import { ArrowLeft, Check, Search, MessageCircle, Heart, User } from 'lucide-react';

interface MyPageLanguageSettingsScreenProps {
  onNavigateBack?: () => void;
  onLanguageSelect?: (languageCode: string) => void;
  onNavigateToMain?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToSaved?: () => void;
  currentLanguage?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export default function MyPageLanguageSettingsScreen({
  onNavigateBack,
  onLanguageSelect,
  onNavigateToMain,
  onNavigateToSearch,
  onNavigateToAI,
  onNavigateToSaved,
  currentLanguage = 'ko'
}: MyPageLanguageSettingsScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  // Simplified language list for better performance
  const languages: Language[] = [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文(简体)' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' }
  ];

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onLanguageSelect?.(languageCode);
    console.log(`Language changed to: ${languageCode}`);
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
          언어 설정
        </h1>

        {/* Spacer for visual balance */}
        <div style={{ width: '44px' }} />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Language List Section */}
        <div style={{ paddingTop: '8px' }}>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="w-full flex items-center justify-between px-4 py-3 transition-all duration-200 hover:bg-muted active:scale-98"
                style={{
                  minHeight: '44px',
                  backgroundColor: selectedLanguage === language.code ? 'var(--muted)' : 'transparent'
                }}
                aria-label={`${language.nativeName} 선택`}
              >
                <div className="flex-1 text-left">
                  <span
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      fontFamily: 'var(--font-family-primary)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {language.nativeName}
                  </span>
                  {language.name !== language.nativeName && (
                    <span
                      className="ml-2"
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-family-primary)',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      ({language.name})
                    </span>
                  )}
                </div>

                {selectedLanguage === language.code && (
                  <Check 
                    className="w-5 h-5 flex-shrink-0" 
                    style={{ color: 'var(--primary)' }}
                    aria-hidden="true" 
                  />
                )}
              </button>
            ))}
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
            언어 변경 시 앱이 다시 시작될 수 있습니다.
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
