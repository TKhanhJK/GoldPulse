import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserSession } from '@goldpulse/types';
import { prisma } from '@goldpulse/database';

const JWT_SECRET = process.env.JWT_SECRET || 'goldpulse_jwt_secret_fintech_production_2026';
const TOKEN_EXPIRY = '7d';
export const AUTH_COOKIE_NAME = 'gp_token';

/**
 * Băm mật khẩu người dùng bằng bcrypt với độ phức tạp salt = 10
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * So khớp mật khẩu đầu vào với mật khẩu đã băm trong database
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Tạo JWT token chứa thông tin phiên đăng nhập UserSession
 */
export function createToken(payload: UserSession): string {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * Giải mã và xác thực tính hợp lệ của JWT token
 */
export function verifyToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    if (!decoded || !decoded.id || !decoded.email) {
      return null;
    }
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || null,
      role: decoded.role || 'USER',
    };
  } catch {
    return null;
  }
}

/**
 * Trích xuất token từ Authorization Header (Bearer token) hoặc Cookie
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Kiểm tra header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Kiểm tra Cookie header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${AUTH_COOKIE_NAME}=`)) {
        return decodeURIComponent(cookie.substring(AUTH_COOKIE_NAME.length + 1));
      }
    }
  }

  return null;
}

/**
 * Trích xuất và kiểm tra thông tin UserSession từ request
 */
export async function getUserFromRequest(request: Request): Promise<UserSession | null> {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  const session = verifyToken(token);
  if (!session) return null;

  // Xác thực lại với database để đảm bảo user vẫn tồn tại
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: (user.role as 'USER' | 'ADMIN') || 'USER',
  };
}

