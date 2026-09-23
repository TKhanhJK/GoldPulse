import { NextResponse } from 'next/server';
import { checkAndTriggerPriceAlerts } from '@/lib/alert-engine';

/**
 * POST /api/alerts/check - Kích hoạt quét và kiểm tra các cảnh báo giá
 */
export async function POST() {
  try {
    const result = await checkAndTriggerPriceAlerts();
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[MANUAL ALERT CHECK ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi kích hoạt kiểm tra cảnh báo giá' },
      { status: 500 }
    );
  }
}

