import { prisma as defaultPrisma, PrismaClient } from '@goldpulse/database';
import { INewsAdapter, NewsCrawlResult, CrawlLogItem } from '@goldpulse/types';
import { SbvNewsAdapter } from './adapters/sbv-news.adapter';
import { CafefNewsAdapter } from './adapters/cafef-news.adapter';

export class NewsCrawlerService {
  private adapters: INewsAdapter[] = [];
  private db: PrismaClient;

  constructor(adapters?: INewsAdapter[], dbClient?: PrismaClient) {
    this.adapters = adapters && adapters.length > 0
      ? adapters
      : [new SbvNewsAdapter(), new CafefNewsAdapter()];
    this.db = dbClient || defaultPrisma;
  }

  public registerAdapter(adapter: INewsAdapter): void {
    this.adapters.push(adapter);
  }

  public getAdapters(): INewsAdapter[] {
    return [...this.adapters];
  }

  /**
   * Cào tin tức tự động với Fault Tolerance và chống trùng lặp (Deduplication)
   */
  public async crawlAllNews(): Promise<NewsCrawlResult> {
    const timestamp = new Date().toISOString();
    const logs: CrawlLogItem[] = [];
    let totalSaved = 0;
    let totalSkipped = 0;

    const settledResults = await Promise.allSettled(
      this.adapters.map(async (adapter) => {
        const news = await adapter.fetchNews();
        return {
          source: adapter.source,
          news,
        };
      })
    );

    for (let i = 0; i < this.adapters.length; i++) {
      const adapter = this.adapters[i];
      const result = settledResults[i];

      if (result.status === 'fulfilled') {
        const { source, news } = result.value;
        let adapterSaved = 0;

        for (const item of news) {
          // Cơ chế chống trùng lặp theo URL
          const existing = await this.db.news.findFirst({
            where: { url: item.url },
          });

          if (!existing) {
            await this.db.news.create({
              data: {
                title: item.title,
                summary: item.summary,
                source: item.source,
                url: item.url,
                publishedAt: new Date(item.publishedAt),
              },
            });
            adapterSaved++;
            totalSaved++;
          } else {
            totalSkipped++;
          }
        }

        const log = await this.db.crawlLog.create({
          data: {
            source,
            status: 'SUCCESS',
            itemsCount: adapterSaved,
            error: null,
          },
        });

        logs.push({
          id: log.id,
          source,
          status: 'SUCCESS',
          itemsCount: adapterSaved,
          createdAt: log.createdAt,
        });
      } else {
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
      totalSkipped,
      logs,
      timestamp,
    };
  }
}

