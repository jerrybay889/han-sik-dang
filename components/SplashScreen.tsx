import React from 'react';
import hansikdangLogo from 'figma:asset/7820f889ab213db5821f3500391bb3253f52c68c.png';

export default function SplashScreen() {
  return (
    <div className="w-[393px] h-[852px] bg-white mx-auto relative overflow-hidden">
      {/* iPhone 14 Pro Frame - 393x852px */}
      
      {/* Screen Title Header */}
      <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground p-2 text-center z-50">
        <span style={{ fontSize: 'var(--text-sm)' }}>1.0 Splash</span>
      </div>
      
      {/* Main Content Area - Centered */}
      <div className="flex flex-col items-center justify-center h-full px-8">
        
        {/* Logo Area */}
        <div className="text-center mb-8">
          {/* han sik dang Logo Image - Background Removed */}
          <img 
            src={hansikdangLogo} 
            alt="han sik dang logo"
            className="w-72 h-auto mx-auto"
          />
        </div>

        {/* Slogan */}
        <div className="text-center">
          <p 
            className="text-base leading-relaxed" 
            style={{ 
              color: '#868B94',
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 400
            }}
          >
            Your personal guide to authentic Korean taste.
          </p>
        </div>

      </div>
    </div>
  );
}
