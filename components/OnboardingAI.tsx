import image_e324e06c6bdb62dd55f81144a66ca21e4193b0b4 from 'figma:asset/e324e06c6bdb62dd55f81144a66ca21e4193b0b4.png';
import image_f2defad02c685cdf09c5f7acfd7bc0d74b24016c from 'figma:asset/f2defad02c685cdf09c5f7acfd7bc0d74b24016c.png';
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

interface OnboardingAIProps {
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export default function OnboardingAI({ onNext, onSkip, onBack }: OnboardingAIProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setIsDropdownOpen(false);
  };

  const handleNext = () => {
    console.log('Navigate to 1.1c Onboarding - Community screen');
    onNext?.();
  };

  const handleSkip = () => {
    console.log('Navigate to 2.0 Main Screen');
    onSkip?.();
  };

  const handleBack = () => {
    console.log('Navigate back to 1.1a Onboarding - Discover screen');
    onBack?.();
  };

  return (
    <div className="w-[393px] h-[852px] bg-white mx-auto relative overflow-hidden flex flex-col">
      {/* iPhone 14 Pro Frame - 393x852px */}
      
      {/* Screen Title Header */}
      <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground p-2 text-center z-50">
        <span style={{ fontSize: 'var(--text-sm)' }}>1.1b Onboarding - AI</span>
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
            src={image_e324e06c6bdb62dd55f81144a66ca21e4193b0b4}
            alt="AI chatbot food recommendation mobile interface"
            className="w-full h-full object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Text Area */}
      <div className="px-8 py-4 text-center space-y-4">
        <h1 className="hsd-h1 hsd-text-primary leading-tight">
          Your Personal Korean Food Concierge
        </h1>
        
        <p className="hsd-body hsd-text-secondary leading-relaxed px-2">
          Tell our AI what you crave, and get instant, tailored recommendations just for you.
        </p>
      </div>

      {/* Footer Area */}
      <div className="flex items-center justify-between px-8 py-6 pb-12">
        {/* Page Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full hsd-bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>

        {/* Skip Button */}
        <button 
          className="hsd-button hsd-text-secondary px-4 py-2 hover:hsd-text-primary transition-colors"
          onClick={handleSkip}
        >
          Skip
        </button>

        {/* Next Button */}
        <button 
          className="hsd-bg-primary text-white px-6 py-3 rounded-lg hsd-button hover:bg-[#0f4761] transition-colors active:scale-95 transform"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
