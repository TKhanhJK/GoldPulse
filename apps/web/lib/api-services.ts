import { prisma } from '@goldpulse/database';
import { GoldPriceItem, LatestPricesResponse, PriceHistoryPoint, PriceHistoryResponse, NewsPaginationResponse, CrawlResult, NewsCrawlResult } from '@goldpulse/types';
import { CrawlerService, NewsCrawlerService } from '@goldpulse/crawler';

/**
 * Lấy danh sách giá vàng mới nhất, tự động tính toán biến động deltaBuy, deltaSell và spread
 */
export async function getLatestPricesData(): Promise<LatestPricesResponse> {
  // Lấy danh sách các symbol duy nhất
  const distinctSymbols = await prisma.goldPrice.findMany({
    select: { symbol: true },
    distinct: ['symbol'],
  });

  const items: GoldPriceItem[] = [];
  let latestUpdate = new Date(0);

  for (const { symbol } of distinctSymbols) {
    // Lấy 2 bản ghi gần nhất của symbol để so sánh
    const records = await prisma.goldPrice.findMany({
      where: { symbol },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    if (records.length > 0) {
      const current = records[0];
      const previous = records.length > 1 ? records[1] : null;

      const deltaBuy = previous
        ? Math.round((current.buyPrice - previous.buyPrice) * 100) / 100
        : 0;
      const deltaSell = previous
        ? Math.round((current.sellPrice - previous.sellPrice) * 100) / 100
        : 0;
      const spread = Math.round((current.sellPrice - current.buyPrice) * 100) / 100;

      if (current.createdAt > latestUpdate) {
        latestUpdate = current.createdAt;
      }

      items.push({
        id: current.id,
        symbol: current.symbol,
        name: current.name,
        source: current.source,
        buyPrice: current.buyPrice,
        sellPrice: current.sellPrice,
        deltaBuy,
        deltaSell,
        spread,
        updatedAt: current.createdAt.toISOString(),
      });
    }
  }

  // Sắp xếp ưu tiên: SJC trước, sau đó đến DOJI, PNJ
  const priorityMap: Record<string, number> = {
    'SJC_1L': 1,
    'SJC_NHAN': 2,
    'DOJI_HN': 3,
    'DOJI_HCM': 4,
    'DOJI_NHAN': 5,
    'PNJ_24K': 6,
    'PNJ_TRANGSUC': 7,
  };

  items.sort((a, b) => (priorityMap[a.symbol] || 99) - (priorityMap[b.symbol] || 99));

  return {
    success: true,
    updatedAt: latestUpdate.getTime() > 0 ? latestUpdate.toISOString() : new Date().toISOString(),
    data: items,
  };
}

/**
 * Lấy lịch sử biến động giá theo symbol và khoảng thời gian (7d | 30d)
 */
export async function getPriceHistoryData(symbol: string, range: '7d' | '30d' = '7d'): Promise<PriceHistoryResponse> {
  const days = range === '30d' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const records = await prisma.goldPrice.findMany({
    where: {
      symbol,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Gom nhóm dữ liệu theo ngày để biểu đồ mượt mà không bị trùng điểm cùng ngày
  const pointsByDate = new Map<string, { timestamp: string; buyPrice: number; sellPrice: number }>();

  for (const r of records) {
    const dateKey = r.createdAt.toISOString().slice(0, 10);
    // Lưu điểm cuối cùng trong ngày
    pointsByDate.set(dateKey, {
      timestamp: r.createdAt.toISOString(),
      buyPrice: r.buyPrice,
      sellPrice: r.sellPrice,
    });
  }

  const data: PriceHistoryPoint[] = Array.from(pointsByDate.values());

  return {
    success: true,
    symbol,
    range,
    data,
  };
}

/**
 * Lấy danh sách tin tức chính sách có phân trang
 */
export async function getNewsData(page = 1, limit = 6): Promise<NewsPaginationResponse> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(50, limit));
  const skip = (safePage - 1) * safeLimit;

  const [totalItems, items] = await Promise.all([
    prisma.news.count(),
    prisma.news.findMany({
      skip,
      take: safeLimit,
      orderBy: {
        publishedAt: 'desc',
      },
    }),
  ]);

  return {
    success: true,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages: Math.ceil(totalItems / safeLimit) || 1,
    },
    data: items.map(n => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      source: n.source,
      url: n.url,
      publishedAt: n.publishedAt.toISOString(),
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

/**
 * Thực thi crawler định kỳ bảo mật bằng CRON_SECRET
 */
export async function executeCrawlerCron(authHeader?: string | null): Promise<CrawlResult> {
  const expectedSecret = process.env.CRON_SECRET || 'goldpulse_secret_key_super_secure_2026';
  
  if (!authHeader) {
    throw new Error('UNAUTHORIZED: Thiếu header xác thực Authorization');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token !== expectedSecret) {
    throw new Error('UNAUTHORIZED: Token CRON_SECRET không hợp lệ');
  }

  const crawler = new CrawlerService();
  const crawlResult = await crawler.crawlAll();

  // Tự động kiểm tra và gửi cảnh báo giá cho người dùng sau khi crawl dữ liệu mới
  try {
    const { checkAndTriggerPriceAlerts } = await import('./alert-engine');
    await checkAndTriggerPriceAlerts();
  } catch (alertErr) {
    console.error('[CRON ALERT TRIGGER ERROR] Không thể kiểm tra cảnh báo giá sau crawl:', alertErr);
  }

  return crawlResult;
}

/**
 * Thực thi crawler tin tức chính sách định kỳ bảo mật bằng CRON_SECRET
 */
export async function executeNewsCrawlerCron(authHeader?: string | null): Promise<NewsCrawlResult> {
  const expectedSecret = process.env.CRON_SECRET || 'goldpulse_secret_key_super_secure_2026';
  
  if (!authHeader) {
    throw new Error('UNAUTHORIZED: Thiếu header xác thực Authorization');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token !== expectedSecret) {
    throw new Error('UNAUTHORIZED: Token CRON_SECRET không hợp lệ');
  }

  const newsCrawler = new NewsCrawlerService();
  return await newsCrawler.crawlAllNews();
}

