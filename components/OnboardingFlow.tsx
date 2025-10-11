import React, { useState } from 'react';
import OnboardingDiscover from './OnboardingDiscover';
import OnboardingAI from './OnboardingAI';
import OnboardingCommunity from './OnboardingCommunity';
import OnboardingPermission from './OnboardingPermission';

type OnboardingStep = 'discover' | 'ai' | 'community' | 'permission' | 'main';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('discover');

  const handleNext = () => {
    switch (currentStep) {
      case 'discover':
        setCurrentStep('ai');
        break;
      case 'ai':
        setCurrentStep('community');
        break;
      case 'community':
        setCurrentStep('permission');
        break;
      case 'permission':
        setCurrentStep('main');
        onComplete?.();
        break;
    }
  };

  const handleSkip = () => {
    setCurrentStep('main');
    onComplete?.();
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'ai':
        setCurrentStep('discover');
        break;
      case 'community':
        setCurrentStep('ai');
        break;
      case 'permission':
        setCurrentStep('community');
        break;
    }
  };

  if (currentStep === 'main') {
    return (
      <div className="w-[393px] h-[852px] bg-white mx-auto relative overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="hsd-h1 hsd-text-primary">Welcome to Han Sik Dang</h1>
          <p className="hsd-body hsd-text-secondary">Main app screen will be implemented here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {currentStep === 'discover' && (
        <OnboardingDiscover
          onNext={handleNext}
          onSkip={handleSkip}
        />
      )}
      {currentStep === 'ai' && (
        <OnboardingAI
          onNext={handleNext}
          onSkip={handleSkip}
          onBack={handleBack}
        />
      )}
      {currentStep === 'community' && (
        <OnboardingCommunity
          onNext={handleNext}
          onSkip={handleSkip}
          onBack={handleBack}
        />
      )}
      {currentStep === 'permission' && (
        <OnboardingPermission
          onAllow={() => {
            setCurrentStep('main');
            onComplete?.();
          }}
          onMaybeLater={() => {
            setCurrentStep('main');
            onComplete?.();
          }}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
