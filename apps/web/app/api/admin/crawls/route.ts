import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const logs = await prisma.crawlLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({
      success: true,
      data: logs.map(l => ({
        id: l.id,
        source: l.source,
        status: l.status,
        itemsCount: l.itemsCount,
        error: l.error,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[ADMIN CRAWLS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải nhật ký crawl' },
      { status: 500 }
    );
  }
}
