import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[AUTH ME ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xác thực danh tính người dùng' },
      { status: 500 }
    );
  }
}

