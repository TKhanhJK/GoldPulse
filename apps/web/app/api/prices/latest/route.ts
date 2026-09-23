import { NextResponse } from 'next/server';
import { getLatestPricesData } from '@/lib/api-services';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLatestPricesData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi truy vấn giá mới nhất:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể truy vấn dữ liệu giá vàng mới nhất' },
      { status: 500 }
    );
  }
}
