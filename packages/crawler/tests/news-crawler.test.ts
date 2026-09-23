import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SbvNewsAdapter } from '../src/adapters/sbv-news.adapter';
import { CafefNewsAdapter } from '../src/adapters/cafef-news.adapter';
import { NewsCrawlerService } from '../src/news-crawler.service';
import { INewsAdapter, ScrapedNewsItem } from '../src/adapters/news-base';
import { prisma } from '@goldpulse/database';

describe('News Crawler Engine & Deduplication Tests', () => {
  beforeAll(async () => {
    await prisma.news.deleteMany({
      where: { url: { contains: 'test-mock' } },
    });
    await prisma.crawlLog.deleteMany({
      where: { source: { in: ['MOCK_NEWS', 'MOCK_FAILING_NEWS'] } },
    });
  });

  afterAll(async () => {
    await prisma.news.deleteMany({
      where: { url: { contains: 'test-mock' } },
    });
    await prisma.crawlLog.deleteMany({
      where: { source: { in: ['MOCK_NEWS', 'MOCK_FAILING_NEWS'] } },
    });
  });

  describe('1. SBV News HTML Parser', () => {
    it('nên bóc tách thông báo văn bản từ SBV chính xác', () => {
      const adapter = new SbvNewsAdapter();
      const mockHtml = `
        <div class="news-item">
          <a href="/tin-tuc/thanh-tra-vang">Thanh tra hoạt động kinh doanh vàng miếng năm 2026</a>
          <p class="desc">NHNN tiếp tục tăng cường quản lý nhà nước về thị trường vàng.</p>
        </div>
      `;

      const results = adapter.parseHtml(mockHtml);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].title).toContain('Thanh tra hoạt động');
      expect(results[0].url).toContain('https://sbv.gov.vn/tin-tuc/thanh-tra-vang');
    });
  });

  describe('2. CafeF News HTML Parser', () => {
    it('nên bóc tách tin tức thị trường vàng từ CafeF chính xác', () => {
      const adapter = new CafefNewsAdapter();
      const mockHtml = `
        <div class="item-news">
          <a href="/gia-vang-sjc-tang-manh.chn">Giá vàng miếng SJC tăng vọt trở lại đỉnh 90 triệu đồng</a>
          <p class="sapo">Nhu cầu mua vàng nhẫn và vàng miếng tăng đột biến trong phiên sáng nay.</p>
        </div>
      `;

      const results = adapter.parseHtml(mockHtml);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].title).toContain('Giá vàng miếng SJC');
      expect(results[0].url).toContain('https://cafef.vn/gia-vang-sjc-tang-manh.chn');
    });
  });

  describe('3. NewsCrawlerService & Deduplication (Chống trùng lặp)', () => {
    it('nên chỉ lưu bài viết mới và bỏ qua (skip) bài viết đã tồn tại', async () => {
      const mockAdapter: INewsAdapter = {
        source: 'MOCK_NEWS',
        fetchNews: async (): Promise<ScrapedNewsItem[]> => [
          {
            title: 'Bài viết test kiểm tra chống trùng lặp dữ liệu',
            summary: 'Tóm tắt bài viết test',
            source: 'MOCK_NEWS',
            url: 'https://test-mock.example.com/bai-viet-1',
            publishedAt: new Date(),
          },
        ],
      };

      const service = new NewsCrawlerService([mockAdapter]);

      // Lần chạy 1: Bài viết mới hoàn toàn -> phải được lưu
      const run1 = await service.crawlAllNews();
      expect(run1.success).toBe(true);
      expect(run1.totalSaved).toBe(1);
      expect(run1.totalSkipped).toBe(0);

      // Lần chạy 2: Cùng URL -> phải bị bỏ qua (Deduplication)
      const run2 = await service.crawlAllNews();
      expect(run2.success).toBe(true);
      expect(run2.totalSaved).toBe(0);
      expect(run2.totalSkipped).toBe(1);
    });

    it('không bị sập khi một news adapter gặp sự cố mạng (Fault Tolerance)', async () => {
      const mockSuccessAdapter: INewsAdapter = {
        source: 'MOCK_NEWS',
        fetchNews: async (): Promise<ScrapedNewsItem[]> => [
          {
            title: 'Bài viết số 2 sau sự cố mạng',
            summary: 'Tóm tắt bài 2',
            source: 'MOCK_NEWS',
            url: 'https://test-mock.example.com/bai-viet-2',
            publishedAt: new Date(),
          },
        ],
      };

      const mockFailingAdapter: INewsAdapter = {
        source: 'MOCK_FAILING_NEWS',
        fetchNews: async (): Promise<ScrapedNewsItem[]> => {
          throw new Error('Connection refused: remote news server 503');
        },
      };

      const service = new NewsCrawlerService([mockSuccessAdapter, mockFailingAdapter]);
      const result = await service.crawlAllNews();

      expect(result.success).toBe(true);
      expect(result.totalSaved).toBe(1);
      expect(result.logs.some(l => l.source === 'MOCK_FAILING_NEWS' && l.status === 'FAILED')).toBe(true);
    });
  });
});
