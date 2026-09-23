import { NextRequest, NextResponse } from 'next/server';
import { executeNewsCrawlerCron } from '@/lib/api-services';

export const dynamic = 'force-dynamic';

async function handleNewsCrawl(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const result = await executeNewsCrawlerCron(authHeader);

    return NextResponse.json({
      success: true,
      message: `Đã crawl thành công ${result.totalSaved} bài viết mới, bỏ qua ${result.totalSkipped} bài viết trùng lặp`,
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
  return handleNewsCrawl(request);
}

export async function POST(request: NextRequest) {
  return handleNewsCrawl(request);
}

