import { expect, test } from '@playwright/test';
import { resolveSafeRedirect } from '../src/features/auth/lib/resolveSafeRedirect';

test.describe('로그인 이동 경로 보안 정책', () => {
  test('정상 내부 경로의 쿼리와 해시는 유지한다', () => {
    expect(resolveSafeRedirect('/guestbook?tab=mine#request', 'USER')).toBe(
      '/guestbook?tab=mine#request'
    );
  });

  test('일반 사용자는 관리자 경로로 이동할 수 없다', () => {
    expect(resolveSafeRedirect('/admin/users', 'USER')).toBe('/');
    expect(resolveSafeRedirect('/admin/users', 'ADMIN')).toBe('/admin/users');
  });

  test('외부 URL과 프로토콜 상대 URL은 역할별 기본 경로로 돌린다', () => {
    expect(resolveSafeRedirect('https://example.com', 'USER')).toBe('/');
    expect(resolveSafeRedirect('//example.com', 'ADMIN')).toBe('/admin');
  });

  test('역슬래시를 이용한 외부 호스트 우회를 차단한다', () => {
    expect(resolveSafeRedirect('/\\example.com', 'USER')).toBe('/');
    expect(resolveSafeRedirect('/\\example.com', 'ADMIN')).toBe('/admin');
  });
});
