import React, { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const languages = [
  'English',
  '日本語', 
  '中文',
  'Español',
  'Tiếng Việt',
  'ไทย',
  'Bahasa Indonesia',
  '한국어'
];

interface OnboardingPermissionProps {
  onAllow?: () => void;
  onMaybeLater?: () => void;
  onBack?: () => void;
}

export default function OnboardingPermission({ onAllow, onMaybeLater, onBack }: OnboardingPermissionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsDropdownOpen(false);
  };

  const handleAllowLocation = () => {
    console.log('Navigate to 2.0 Main Screen - Location Allowed');
    onAllow?.();
  };

  const handleMaybeLater = () => {
    console.log('Navigate to 2.0 Main Screen - Location Denied');
    onMaybeLater?.();
  };

  const handleBack = () => {
    console.log('Navigate back to 1.2 Onboarding - Culture screen');
    onBack?.();
  };

  return (
    <div className="w-[393px] h-[852px] bg-white mx-auto relative overflow-hidden flex flex-col">
      {/* iPhone 14 Pro Frame - 393x852px */}
      
      {/* Screen Title Header */}
      <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground p-2 text-center z-50">
        <span style={{ fontSize: 'var(--text-sm)' }}>1.3 Permission</span>
      </div>
      
      {/* Header Area */}
      <div className="flex justify-end p-4 pt-12 relative">
        <div className="text-right">
          <button 
            className="hsd-body hsd-text-secondary flex items-center gap-1 hover:hsd-text-primary transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedLanguage} ▼
          </button>
          
          {/* Language Dropdown Overlay */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
              {languages.map((language) => (
                <button
                  key={language}
                  className={`w-full text-right px-4 py-2 hsd-body hover:hsd-bg-background-secondary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedLanguage === language ? 'hsd-text-primary hsd-bg-background-secondary' : 'hsd-text-secondary'
                  }`}
                  onClick={() => handleLanguageSelect(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Illustration Area - Large middle section */}
      <div className="flex-1 flex items-center justify-center px-8 py-4">
        <div className="w-full max-w-[280px] aspect-square">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1588551240529-80bb20095725?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXAlMjBsb2NhdGlvbiUyMHNlcnZpY2VzJTIwcmVzdGF1cmFudCUyMGRpc2NvdmVyeXxlbnwxfHx8fDE3NTk1MTI2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Location services and map with restaurant pins"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Text Area */}
      <div className="px-8 py-4 text-center space-y-4">
        <h1 className="hsd-h1 hsd-text-primary leading-tight">
          Find Hidden Gems Right Around You.
        </h1>
        
        <p className="hsd-body hsd-text-secondary leading-relaxed px-2">
          Allow 'han sik dang' to access your location to discover the best authentic Korean restaurants nearby, tailored just for you.
        </p>
      </div>

      {/* Footer Area */}
      <div className="flex flex-col items-center px-8 py-6 pb-12 space-y-4">
        {/* Allow Location Access Button */}
        <button 
          className="w-full hsd-bg-primary text-white px-6 py-4 rounded-lg hsd-button hover:bg-[#0f4761] transition-colors active:scale-95 transform"
          onClick={handleAllowLocation}
        >
          Allow Location Access
        </button>

        {/* Maybe Later Button */}
        <button 
          className="hsd-button hsd-text-secondary hover:hsd-text-primary transition-colors"
          onClick={handleMaybeLater}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
