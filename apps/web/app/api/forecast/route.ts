import { NextRequest, NextResponse } from 'next/server';
import { getForecastData } from '@/lib/forecasting-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'SJC_1L';
    const days = parseInt(searchParams.get('days') || '5', 10);

    const forecastResponse = await getForecastData(symbol, days);
    return NextResponse.json(forecastResponse);
  } catch (error) {
    console.error('Lỗi khi tính toán dự báo giá vàng:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tính toán mô hình dự báo giá vàng' },
      { status: 500 }
    );
  }
}

