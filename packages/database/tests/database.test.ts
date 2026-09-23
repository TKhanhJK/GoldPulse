import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/client.js';

describe('Database Layer Verification', () => {
  beforeAll(async () => {
    // Dọn dẹp bản ghi test nếu có
    await prisma.goldPrice.deleteMany({ where: { symbol: 'TEST_GOLD' } });
    await prisma.news.deleteMany({ where: { source: 'TEST_SOURCE' } });
    await prisma.crawlLog.deleteMany({ where: { source: 'TEST_CRAWLER' } });
  });

  afterAll(async () => {
    // Dọn dẹp sau khi test
    await prisma.goldPrice.deleteMany({ where: { symbol: 'TEST_GOLD' } });
    await prisma.news.deleteMany({ where: { source: 'TEST_SOURCE' } });
    await prisma.crawlLog.deleteMany({ where: { source: 'TEST_CRAWLER' } });
    await prisma.$disconnect();
  });

  it('nên tạo và truy vấn bản ghi GoldPrice thành công', async () => {
    const created = await prisma.goldPrice.create({
      data: {
        symbol: 'TEST_GOLD',
        name: 'Vàng Kiểm Thử',
        source: 'TEST',
        buyPrice: 85.5,
        sellPrice: 87.5,
      },
    });

    expect(created.id).toBeDefined();
    expect(created.symbol).toBe('TEST_GOLD');
    expect(created.buyPrice).toBe(85.5);
    expect(created.sellPrice).toBe(87.5);
    expect(created.sellPrice - created.buyPrice).toBe(2.0); // Spread = 2.0

    const found = await prisma.goldPrice.findFirst({
      where: { symbol: 'TEST_GOLD' },
    });
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Vàng Kiểm Thử');
  });

  it('nên tạo và truy vấn bản ghi News phân trang thành công', async () => {
    await prisma.news.create({
      data: {
        title: 'Chính sách kiểm thử mới',
        summary: 'Tóm tắt nội dung kiểm thử',
        source: 'TEST_SOURCE',
        url: 'https://test.example.com',
        publishedAt: new Date(),
      },
    });

    const [total, items] = await Promise.all([
      prisma.news.count({ where: { source: 'TEST_SOURCE' } }),
      prisma.news.findMany({
        where: { source: 'TEST_SOURCE' },
        take: 5,
        skip: 0,
        orderBy: { publishedAt: 'desc' },
      }),
    ]);

    expect(total).toBeGreaterThanOrEqual(1);
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].source).toBe('TEST_SOURCE');
  });

  it('nên ghi nhật ký CrawlLog chính xác', async () => {
    const log = await prisma.crawlLog.create({
      data: {
        source: 'TEST_CRAWLER',
        status: 'SUCCESS',
        itemsCount: 10,
        error: null,
      },
    });

    expect(log.id).toBeDefined();
    expect(log.status).toBe('SUCCESS');
    expect(log.itemsCount).toBe(10);
  });
});
