import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { AdminSystemStats } from '@goldpulse/types';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const [
      totalUsers,
      totalAlerts,
      activeAlerts,
      totalCrawls,
      successfulCrawls,
      totalNews,
      totalPriceRecords,
      totalAlertLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.priceAlert.count(),
      prisma.priceAlert.count({ where: { isActive: true } }),
      prisma.crawlLog.count(),
      prisma.crawlLog.count({ where: { status: 'SUCCESS' } }),
      prisma.news.count(),
      prisma.goldPrice.count(),
      prisma.alertLog.count(),
    ]);

    const stats: AdminSystemStats = {
      totalUsers,
      totalAlerts,
      activeAlerts,
      totalCrawls,
      successfulCrawls,
      totalNews,
      totalPriceRecords,
      totalAlertLogs,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[ADMIN STATS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải số liệu thống kê hệ thống' },
      { status: 500 }
    );
  }
}
