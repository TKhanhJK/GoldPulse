import { NextResponse } from 'next/server';
import { getUserFromRequest } from './auth';
import { UserSession } from '@goldpulse/types';

export interface AdminAuthResult {
  user: UserSession | null;
  errorResponse: NextResponse | null;
}

/**
 * Kiểm tra quyền hạn Quản trị viên (ADMIN) cho các API Routes hoặc Server Actions
 */
export async function verifyAdminRequest(request: Request): Promise<AdminAuthResult> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Yêu cầu đăng nhập tài khoản Quản trị viên' },
        { status: 401 }
      ),
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Truy cập bị từ chối: Yêu cầu quyền hạn ADMIN' },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}
