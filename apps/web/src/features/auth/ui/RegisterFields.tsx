'use client';

import Input from '@/shared/ui/Input';

interface RegisterFieldsProps {
  displayName: string;
  username: string;
  onDisplayNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
}

export function RegisterFields({
  displayName,
  username,
  onDisplayNameChange,
  onUsernameChange,
}: RegisterFieldsProps) {
  return (
    <>
      <Input
        type="text"
        placeholder="이름 (예: 홍길동)"
        value={displayName}
        onChange={e => onDisplayNameChange(e.target.value)}
        helperText="실명 또는 닉네임을 입력해 주세요. 피드·댓글에 표시됩니다."
        autoComplete="name"
        data-cy="register-display-name-input"
        maxLength={30}
        required
      />

      <div className="space-y-1">
        <Input
          type="text"
          placeholder="아이디 (예: hong_gildong)"
          value={username}
          onChange={e => onUsernameChange(e.target.value)}
          helperText="영문 소문자·숫자·밑줄(_) 3-20자 · 프로필 URL에 사용됩니다."
          autoComplete="username"
          data-cy="register-username-input"
          minLength={3}
          maxLength={20}
          required
        />
        {username && (
          <p className="text-[11px] text-surface-400 px-1">
            프로필:{' '}
            <span className="text-surface-600 font-medium">
              kscold.com/profile/{username}
            </span>
          </p>
        )}
      </div>
    </>
  );
}
