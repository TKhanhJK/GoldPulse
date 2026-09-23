import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { LoginRequest, AuthResponse } from '@goldpulse/types';
import { verifyPassword, createToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Vui lòng cung cấp email và mật khẩu' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Tìm kiếm tài khoản người dùng
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'USER' | 'ADMIN',
    };

    const token = createToken(session);

    const response = NextResponse.json<AuthResponse>({
      success: true,
      user: session,
      token,
    });

    // Thiết lập cookie bảo mật
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[AUTH LOGIN ERROR]', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Đã xảy ra lỗi trong quá trình đăng nhập' },
      { status: 500 }
    );
  }
}
