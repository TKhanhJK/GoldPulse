import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { AdminAlertItem } from '@goldpulse/types';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const alerts = await prisma.priceAlert.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
      take: 50,
    });

    const data: AdminAlertItem[] = alerts.map(a => ({
      id: a.id,
      userId: a.userId,
      userEmail: a.user.email,
      userName: a.user.name,
      symbol: a.symbol,
      targetPrice: a.targetPrice,
      condition: a.condition,
      isActive: a.isActive,
      lastTriggeredAt: a.lastTriggeredAt ? a.lastTriggeredAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[ADMIN ALERTS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách quy tắc cảnh báo' },
      { status: 500 }
    );
  }
}
