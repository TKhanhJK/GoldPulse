import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { RegisterRequest, AuthResponse } from '@goldpulse/types';
import { hashPassword, createToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name } = body;

    // 1. Kiểm tra validation cơ bản
    if (!email || !email.includes('@')) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Địa chỉ email không hợp lệ' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Kiểm tra tài khoản đã tồn tại chưa
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Email này đã được đăng ký trong hệ thống' },
        { status: 409 }
      );
    }

    // 3. Hash mật khẩu và tạo người dùng mới
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
        role: 'USER',
      },
    });

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
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });

    return response;
  } catch (error) {
    console.error('[AUTH REGISTER ERROR]', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Đã xảy ra lỗi trong quá trình đăng ký' },
      { status: 500 }
    );
  }
}

