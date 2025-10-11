import React, { useState } from 'react';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface MyPageEditProfileScreenProps {
  onNavigateBack: () => void;
  onSaveProfile: (data: { nickname: string; bio: string }) => void;
  currentNickname?: string;
  currentBio?: string;
}

export default function MyPageEditProfileScreen({
  onNavigateBack,
  onSaveProfile,
  currentNickname = "한식탐험가",
  currentBio = "대한민국 숨은 맛집을 찾아 떠나는 미식 여정!"
}: MyPageEditProfileScreenProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [bio, setBio] = useState(currentBio);
  const [isNicknameValid, setIsNicknameValid] = useState(true);

  // Check if data has changed from original
  const hasChanges = nickname !== currentNickname || bio !== currentBio;

  // Validate nickname (2-10 characters, Korean/English/Numbers only)
  const validateNickname = (value: string) => {
    const regex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    const isValid = regex.test(value) && value.length >= 2 && value.length <= 10;
    setIsNicknameValid(isValid);
    return isValid;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    if (value) {
      validateNickname(value);
    } else {
      setIsNicknameValid(false);
    }
  };

  const handleSave = () => {
    if (isNicknameValid && nickname.trim() && hasChanges) {
      onSaveProfile({
        nickname: nickname.trim(),
        bio: bio.trim()
      });
    }
  };

  const canSave = isNicknameValid && nickname.trim() && hasChanges;

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
          className="font-medium text-center"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: 'var(--foreground)'
          }}
        >
          프로필 편집
        </h1>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="transition-colors px-3 py-2 rounded-lg"
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            fontFamily: 'var(--font-family-primary)',
            color: canSave ? 'var(--accent)' : 'var(--muted-foreground)',
            minHeight: '44px'
          }}
        >
          저장
        </button>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Profile Photo Section */}
        <section 
          className="flex flex-col items-center py-8 px-4"
          style={{
            backgroundColor: 'var(--background)',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {/* Profile Image */}
          <div 
            className="relative mb-6 rounded-full border-4 flex items-center justify-center overflow-hidden"
            style={{
              width: '100px',
              height: '100px',
              borderColor: 'var(--border)',
              backgroundColor: 'var(--muted)'
            }}
          >
            <User 
              className="w-12 h-12"
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>

          {/* Change Photo Button */}
          <button
            className="flex items-center gap-2 transition-colors hover:opacity-80"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-normal)',
              fontFamily: 'var(--font-family-primary)',
              color: 'var(--muted-foreground)',
              minHeight: '44px'
            }}
          >
            <Camera className="w-5 h-5" />
            사진 변경
          </button>
        </section>

        {/* Input Fields Section */}
        <section className="flex-1 p-4 space-y-6">
          {/* Nickname Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="nickname"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              닉네임
            </Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력해주세요"
              className={`transition-colors ${!isNicknameValid && nickname ? 'border-destructive focus:border-destructive' : ''}`}
              style={{
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family-primary)',
                minHeight: '44px',
                backgroundColor: 'var(--input-background)',
                borderColor: !isNicknameValid && nickname ? 'var(--destructive)' : 'var(--border)'
              }}
            />
            <p 
              className={`transition-colors ${!isNicknameValid && nickname ? 'text-destructive' : ''}`}
              style={{
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-family-primary)',
                color: !isNicknameValid && nickname ? 'var(--destructive)' : 'var(--muted-foreground)'
              }}
            >
              2-10자 한글, 영문, 숫자만 가능합니다.
            </p>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="bio"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-medium)',
                fontFamily: 'var(--font-family-primary)',
                color: 'var(--foreground)'
              }}
            >
              소개글
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 표현하는 한 문장을 작성해주세요"
              className="resize-none"
              rows={4}
              maxLength={50}
              style={{
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family-primary)',
                backgroundColor: 'var(--input-background)',
                borderColor: 'var(--border)'
              }}
            />
            <div className="flex justify-between items-center">
              <div /> {/* Spacer */}
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  color: 'var(--muted-foreground)'
                }}
              >
                {bio.length}/50자
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
