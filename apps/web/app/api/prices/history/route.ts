import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistoryData } from '@/lib/api-services';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const range = (searchParams.get('range') || '7d') as '7d' | '30d';

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số bắt buộc "symbol"' },
        { status: 400 }
      );
    }

    if (range !== '7d' && range !== '30d') {
      return NextResponse.json(
        { success: false, error: 'Tham số "range" chỉ chấp nhận giá trị "7d" hoặc "30d"' },
        { status: 400 }
      );
    }

    const data = await getPriceHistoryData(symbol, range);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi truy vấn lịch sử giá vàng:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể truy vấn lịch sử giá vàng' },
      { status: 500 }
    );
  }
}
