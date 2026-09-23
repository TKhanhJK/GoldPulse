import { prisma as defaultPrisma, PrismaClient } from '@goldpulse/database';
import { IGoldPriceAdapter, ScrapedGoldPrice, CrawlResult, CrawlLogItem } from '@goldpulse/types';
import { SjcAdapter } from './adapters/sjc.adapter';
import { DojiAdapter } from './adapters/doji.adapter';
import { PnjAdapter } from './adapters/pnj.adapter';

export class CrawlerService {
  private adapters: IGoldPriceAdapter[] = [];
  private db: PrismaClient;

  constructor(adapters?: IGoldPriceAdapter[], dbClient?: PrismaClient) {
    this.adapters = adapters && adapters.length > 0
      ? adapters
      : [new SjcAdapter(), new DojiAdapter(), new PnjAdapter()];
    this.db = dbClient || defaultPrisma;
  }

  public registerAdapter(adapter: IGoldPriceAdapter): void {
    this.adapters.push(adapter);
  }

  public getAdapters(): IGoldPriceAdapter[] {
    return [...this.adapters];
  }

  /**
   * Chạy crawl đồng thời tất cả các nguồn theo cơ chế Fault Tolerance (Promise.allSettled)
   */
  public async crawlAll(): Promise<CrawlResult> {
    const timestamp = new Date().toISOString();
    const logs: CrawlLogItem[] = [];
    let totalSaved = 0;

    // Chạy song song không chặn lẫn nhau
    const settledResults = await Promise.allSettled(
      this.adapters.map(async (adapter) => {
        const prices = await adapter.fetchPrices();
        return {
          source: adapter.source,
          prices,
        };
      })
    );

    for (let i = 0; i < this.adapters.length; i++) {
      const adapter = this.adapters[i];
      const result = settledResults[i];

      if (result.status === 'fulfilled') {
        const { source, prices } = result.value;

        // Lưu vào DB
        for (const item of prices) {
          await this.db.goldPrice.create({
            data: {
              symbol: item.symbol,
              name: item.name,
              buyPrice: item.buyPrice,
              sellPrice: item.sellPrice,
              source: item.source,
            },
          });
          totalSaved++;
        }

        // Ghi Audit Log thành công
        const log = await this.db.crawlLog.create({
          data: {
            source,
            status: 'SUCCESS',
            itemsCount: prices.length,
            error: null,
          },
        });

        logs.push({
          id: log.id,
          source,
          status: 'SUCCESS',
          itemsCount: prices.length,
          createdAt: log.createdAt,
        });
      } else {
        // Xử lý lỗi cách ly an toàn (Fault Tolerance)
        const errorMessage = result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);

        const log = await this.db.crawlLog.create({
          data: {
            source: adapter.source,
            status: 'FAILED',
            itemsCount: 0,
            error: errorMessage,
          },
        });

        logs.push({
          id: log.id,
          source: adapter.source,
          status: 'FAILED',
          itemsCount: 0,
          error: errorMessage,
          createdAt: log.createdAt,
        });
      }
    }

    return {
      success: logs.some(l => l.status === 'SUCCESS'),
      totalSaved,
      logs,
      timestamp,
    };
  }
}
