import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getLatestPricesData, getPriceHistoryData, getNewsData, executeCrawlerCron } from '../lib/api-services';
import { prisma } from '@goldpulse/database';

describe('RESTful API Services & Logic Integration Tests', () => {
  describe('1. GET /api/prices/latest logic', () => {
    it('nên trả về đầy đủ danh sách giá vàng mới nhất kèm delta và spread chính xác', async () => {
      const response = await getLatestPricesData();

      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.updatedAt).toBeDefined();

      const sjc = response.data.find(p => p.symbol === 'SJC_1L');
      expect(sjc).toBeDefined();
      if (sjc) {
        expect(sjc.name).toContain('SJC');
        expect(sjc.buyPrice).toBeGreaterThan(0);
        expect(sjc.sellPrice).toBeGreaterThan(sjc.buyPrice);
        expect(sjc.spread).toBe(Math.round((sjc.sellPrice - sjc.buyPrice) * 100) / 100);
        expect(typeof sjc.deltaBuy).toBe('number');
        expect(typeof sjc.deltaSell).toBe('number');
      }
    });
  });

  describe('2. GET /api/prices/history logic', () => {
    it('nên trả về chuỗi thời gian cho 7 ngày của mã SJC_1L', async () => {
      const response = await getPriceHistoryData('SJC_1L', '7d');

      expect(response.success).toBe(true);
      expect(response.symbol).toBe('SJC_1L');
      expect(response.range).toBe('7d');
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      const firstPoint = response.data[0];
      expect(firstPoint.timestamp).toBeDefined();
      expect(firstPoint.buyPrice).toBeGreaterThan(0);
      expect(firstPoint.sellPrice).toBeGreaterThan(0);
    });

    it('nên hỗ trợ range 30 ngày cho mã DOJI_HN', async () => {
      const response = await getPriceHistoryData('DOJI_HN', '30d');

      expect(response.success).toBe(true);
      expect(response.symbol).toBe('DOJI_HN');
      expect(response.range).toBe('30d');
      expect(response.data.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('3. GET /api/news logic & pagination', () => {
    it('nên trả về dữ liệu tin tức kèm metadata phân trang', async () => {
      const page1 = await getNewsData(1, 3);

      expect(page1.success).toBe(true);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(3);
      expect(page1.pagination.totalItems).toBeGreaterThanOrEqual(6);
      expect(page1.pagination.totalPages).toBeGreaterThanOrEqual(2);
      expect(page1.data.length).toBeLessThanOrEqual(3);

      // Kiểm tra sắp xếp theo thời gian công bố giảm dần
      if (page1.data.length > 1) {
        const time0 = new Date(page1.data[0].publishedAt).getTime();
        const time1 = new Date(page1.data[1].publishedAt).getTime();
        expect(time0).toBeGreaterThanOrEqual(time1);
      }
    });
  });

  describe('4. GET /api/cron/crawl security and execution', () => {
    it('nên từ chối khi không có token Authorization hoặc token sai', async () => {
      await expect(executeCrawlerCron(null)).rejects.toThrow('UNAUTHORIZED');
      await expect(executeCrawlerCron('Bearer sai_mat_ma_123')).rejects.toThrow('UNAUTHORIZED');
    });

    it('nên thực thi thành công khi có đúng CRON_SECRET', async () => {
      const validSecret = process.env.CRON_SECRET || 'goldpulse_secret_key_super_secure_2026';
      const result = await executeCrawlerCron(`Bearer ${validSecret}`);

      expect(result.success).toBe(true);
      expect(result.totalSaved).toBeGreaterThan(0);
      expect(result.logs.length).toBeGreaterThan(0);
    });
  });
});
