import { NextRequest, NextResponse } from 'next/server';
import { executeCrawlerCron } from '@/lib/api-services';

export const dynamic = 'force-dynamic';

async function handleCrawl(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const result = await executeCrawlerCron(authHeader);

    return NextResponse.json({
      success: true,
      message: `Đã crawl thành công ${result.totalSaved} bản ghi giá vàng`,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống';
    const status = message.includes('UNAUTHORIZED') ? 401 : 500;

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCrawl(request);
}

export async function POST(request: NextRequest) {
  return handleCrawl(request);
}

