import { NextRequest, NextResponse } from 'next/server';
import { getNewsData } from '@/lib/api-services';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const data = await getNewsData(page, limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Lỗi khi truy vấn tin tức chính sách:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể truy vấn danh sách tin tức' },
      { status: 500 }
    );
  }
}
