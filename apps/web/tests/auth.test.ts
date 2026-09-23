import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, createToken, verifyToken, extractTokenFromRequest } from '../lib/auth';
import { prisma } from '@goldpulse/database';

describe('User Authentication & Security Layer', () => {
  const testUser = {
    id: 'user-test-uuid-12345',
    email: 'investor@goldpulse.vn',
    name: 'Nhà Đầu Tư Vàng',
    role: 'USER' as const,
  };

  it('1. Băm mật khẩu và so khớp mật khẩu chính xác bằng bcrypt', async () => {
    const rawPassword = 'SecurePassword2026@';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword('WrongPassword123', hash);
    expect(isWrong).toBe(false);
  });

  it('2. Tạo JWT token và giải mã xác thực thông tin UserSession', () => {
    const token = createToken(testUser);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(testUser.id);
    expect(decoded?.email).toBe(testUser.email);
    expect(decoded?.name).toBe(testUser.name);
    expect(decoded?.role).toBe('USER');
  });

  it('3. Từ chối token không hợp lệ hoặc bị giả mạo', () => {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';
    const decoded = verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });

  it('4. Trích xuất token từ Authorization Bearer header', () => {
    const fakeToken = 'sample_jwt_token_123';
    const request = new Request('http://localhost:3000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${fakeToken}`,
      },
    });

    const extracted = extractTokenFromRequest(request);
    expect(extracted).toBe(fakeToken);
  });

  it('5. Trích xuất token từ Cookie header gp_token', () => {
    const fakeToken = 'sample_cookie_token_456';
    const request = new Request('http://localhost:3000/api/auth/me', {
      headers: {
        Cookie: `other_cookie=xyz; gp_token=${fakeToken}; theme=light`,
      },
    });

    const extracted = extractTokenFromRequest(request);
    expect(extracted).toBe(fakeToken);
  });
});
