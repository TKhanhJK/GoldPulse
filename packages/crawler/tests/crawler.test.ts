import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { normalizePrice, IGoldPriceAdapter, ScrapedGoldPrice } from '../src/adapters/base';
import { SjcAdapter } from '../src/adapters/sjc.adapter';
import { DojiAdapter } from '../src/adapters/doji.adapter';
import { PnjAdapter } from '../src/adapters/pnj.adapter';
import { CrawlerService } from '../src/crawler.service';
import { prisma } from '@goldpulse/database';

describe('Crawler Engine & Adapter Pattern Tests', () => {
  describe('1. Price Normalization', () => {
    it('nên chuẩn hóa các định dạng chuỗi giá tiền tệ Việt Nam chính xác về triệu VNĐ/lượng', () => {
      expect(normalizePrice('88,500,000')).toBe(88.5);
      expect(normalizePrice('88.500.000')).toBe(88.5);
      expect(normalizePrice('88.5')).toBe(88.5);
      expect(normalizePrice(88.5)).toBe(88.5);
      expect(normalizePrice(88500000)).toBe(88.5);
      expect(normalizePrice('8,850')).toBe(88.5); // 8850 nghìn/chỉ = 88.5 triệu/lượng
      expect(normalizePrice('')).toBe(0);
      expect(normalizePrice('invalid')).toBe(0);
    });
  });

  describe('2. SJC Adapter HTML Parser', () => {
    it('nên bóc tách bảng HTML SJC chính xác', () => {
      const adapter = new SjcAdapter();
      const mockHtml = `
        <table>
          <tr>
            <td>Vàng SJC 1L - 10L</td>
            <td>87.500.000</td>
            <td>89.500.000</td>
          </tr>
          <tr>
            <td>Vàng nhẫn SJC 99,99% 1 chỉ, 2 chỉ</td>
            <td>86.800.000</td>
            <td>88.200.000</td>
          </tr>
        </table>
      `;

      const results = adapter.parseHtml(mockHtml);
      expect(results).toHaveLength(2);
      expect(results[0].symbol).toBe('SJC_1L');
      expect(results[0].buyPrice).toBe(87.5);
      expect(results[0].sellPrice).toBe(89.5);
      expect(results[0].source).toBe('SJC');

      expect(results[1].symbol).toBe('SJC_NHAN');
      expect(results[1].buyPrice).toBe(86.8);
      expect(results[1].sellPrice).toBe(88.2);
    });
  });

  describe('3. DOJI Adapter HTML Parser', () => {
    it('nên bóc tách bảng HTML DOJI chính xác', () => {
      const adapter = new DojiAdapter();
      const mockHtml = `
        <table>
          <tr>
            <td>DOJI Hà Nội (Vàng miếng)</td>
            <td>87.800.000</td>
            <td>89.800.000</td>
          </tr>
          <tr>
            <td>DOJI TP.Hồ Chí Minh</td>
            <td>87.800.000</td>
            <td>89.800.000</td>
          </tr>
          <tr>
            <td>Nhẫn Tròn 9999 Hưng Thịnh Vượng</td>
            <td>87.200.000</td>
            <td>88.600.000</td>
          </tr>
        </table>
      `;

      const results = adapter.parseHtml(mockHtml);
      expect(results).toHaveLength(3);
      expect(results[0].symbol).toBe('DOJI_HN');
      expect(results[1].symbol).toBe('DOJI_HCM');
      expect(results[2].symbol).toBe('DOJI_NHAN');
    });
  });

  describe('4. PNJ Adapter HTML Parser', () => {
    it('nên bóc tách bảng HTML PNJ chính xác', () => {
      const adapter = new PnjAdapter();
      const mockHtml = `
        <table>
          <tr>
            <td>Vàng PNJ 24K</td>
            <td>87.000.000</td>
            <td>88.400.000</td>
          </tr>
          <tr>
            <td>Vàng nữ trang 999.9 PNJ</td>
            <td>86.700.000</td>
            <td>88.100.000</td>
          </tr>
        </table>
      `;

      const results = adapter.parseHtml(mockHtml);
      expect(results).toHaveLength(2);
      expect(results[0].symbol).toBe('PNJ_24K');
      expect(results[1].symbol).toBe('PNJ_TRANGSUC');
    });
  });

  describe('5. CrawlerService & Fault Tolerance (Khả năng chịu lỗi)', () => {
    beforeAll(async () => {
      await prisma.crawlLog.deleteMany({ where: { source: { in: ['MOCK_SJC', 'MOCK_FAILING'] } } });
      await prisma.goldPrice.deleteMany({ where: { source: 'MOCK_SJC' } });
    });

    afterAll(async () => {
      await prisma.crawlLog.deleteMany({ where: { source: { in: ['MOCK_SJC', 'MOCK_FAILING'] } } });
      await prisma.goldPrice.deleteMany({ where: { source: 'MOCK_SJC' } });
    });

    it('không bị sập tiến trình khi một adapter gặp lỗi mạng hoặc DOM, vẫn lưu trữ các nguồn thành công', async () => {
      // Mock 1 adapter thành công
      const mockSuccessfulAdapter: IGoldPriceAdapter = {
        source: 'MOCK_SJC',
        fetchPrices: async (): Promise<ScrapedGoldPrice[]> => [
          {
            symbol: 'MOCK_SJC_1L',
            name: 'Mock SJC',
            buyPrice: 88.0,
            sellPrice: 90.0,
            source: 'MOCK_SJC',
          },
        ],
      };

      // Mock 1 adapter bị lỗi sập mạng
      const mockFailingAdapter: IGoldPriceAdapter = {
        source: 'MOCK_FAILING',
        fetchPrices: async (): Promise<ScrapedGoldPrice[]> => {
          throw new Error('ETIMEDOUT: Connection failed to remote gold exchange server');
        },
      };

      const service = new CrawlerService([mockSuccessfulAdapter, mockFailingAdapter]);
      const result = await service.crawlAll();

      // Kiểm tra kết quả tổng thể
      expect(result.success).toBe(true);
      expect(result.totalSaved).toBe(1);
      expect(result.logs).toHaveLength(2);

      // Log của adapter thành công
      const successLog = result.logs.find(l => l.source === 'MOCK_SJC');
      expect(successLog?.status).toBe('SUCCESS');
      expect(successLog?.itemsCount).toBe(1);

      // Log của adapter bị lỗi: bắt trọn vẹn lỗi mà không làm throw ra ngoài
      const failingLog = result.logs.find(l => l.source === 'MOCK_FAILING');
      expect(failingLog?.status).toBe('FAILED');
      expect(failingLog?.itemsCount).toBe(0);
      expect(failingLog?.error).toContain('ETIMEDOUT');

      // Xác minh DB thực tế đã ghi nhận
      const savedPrice = await prisma.goldPrice.findFirst({ where: { symbol: 'MOCK_SJC_1L' } });
      expect(savedPrice).not.toBeNull();
      expect(savedPrice?.buyPrice).toBe(88.0);
    });
  });
});
