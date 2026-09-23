import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin-auth';
import { CrawlerService, NewsCrawlerService } from '@goldpulse/crawler';
import { checkAndTriggerPriceAlerts } from '@/lib/alert-engine';

export async function POST(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'prices'; // 'prices' | 'news'

    if (type === 'news') {
      const newsCrawler = new NewsCrawlerService();
      const result = await newsCrawler.crawlAllNews();
      return NextResponse.json({
        success: true,
        type: 'news',
        result,
      });
    }

    // Mặc định crawl giá vàng
    const crawler = new CrawlerService();
    const result = await crawler.crawlAll();

    // Tự động kiểm tra cảnh báo giá sau khi crawl giá mới
    let alertCheck = null;
    try {
      alertCheck = await checkAndTriggerPriceAlerts();
    } catch (err) {
      console.error('[ADMIN TRIGGER ALERT CHECK ERROR]', err);
    }

    return NextResponse.json({
      success: true,
      type: 'prices',
      result,
      alertCheck,
    });
  } catch (error) {
    console.error('[ADMIN TRIGGER CRAWL ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi trong quá trình kích hoạt crawler thủ công' },
      { status: 500 }
    );
  }
}
