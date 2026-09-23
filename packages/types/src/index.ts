// 1. Crawler & Adapter Interfaces
export interface ScrapedGoldPrice {
  symbol: string;
  name: string;
  buyPrice: number;   // Triệu VNĐ / lượng (hoặc VNĐ, được chuẩn hóa theo triệu VNĐ/lượng ví dụ 88.5 = 88.500.000đ)
  sellPrice: number;  // Triệu VNĐ / lượng
  source: string;     // SJC, DOJI, PNJ
}

export interface IGoldPriceAdapter {
  readonly source: string;
  fetchPrices(): Promise<ScrapedGoldPrice[]>;
}

export interface CrawlLogItem {
  id?: string;
  source: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  itemsCount: number;
  error?: string | null;
  createdAt?: Date | string;
}

export interface CrawlResult {
  success: boolean;
  totalSaved: number;
  logs: CrawlLogItem[];
  timestamp: string;
}

// 2. Gold Price API DTOs
export interface GoldPriceItem {
  id?: string;
  symbol: string;
  name: string;
  source: string;
  buyPrice: number;
  sellPrice: number;
  deltaBuy: number;
  deltaSell: number;
  spread: number;
  updatedAt: string | Date;
}

export interface LatestPricesResponse {
  success: boolean;
  updatedAt: string;
  data: GoldPriceItem[];
}

export interface PriceHistoryPoint {
  timestamp: string;
  buyPrice: number;
  sellPrice: number;
}

export interface PriceHistoryResponse {
  success: boolean;
  symbol: string;
  range: '7d' | '30d';
  data: PriceHistoryPoint[];
}

// 3. News & Policy DTOs
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string | Date;
  createdAt?: string | Date;
}

export interface NewsPaginationResponse {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  data: NewsItem[];
}

// 4. Market Overview & Dashboard DTOs
export interface MarketOverviewStats {
  sjcBuyPrice: number;
  sjcSellPrice: number;
  deltaBuy: number;
  deltaSell: number;
  spread: number;
  marketTrend: 'UP' | 'DOWN' | 'STABLE';
  lastUpdated: string;
}

