import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { AdminUserItem } from '@goldpulse/types';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { alerts: true },
        },
      },
    });

    const data: AdminUserItem[] = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      alertsCount: u._count.alerts,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[ADMIN USERS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách người dùng' },
      { status: 500 }
    );
  }
}
