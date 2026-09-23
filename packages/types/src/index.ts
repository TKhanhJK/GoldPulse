// 1. Crawler & Adapter Interfaces (Gold Price)
export interface ScrapedGoldPrice {
  symbol: string;
  name: string;
  buyPrice: number;   // Triệu VNĐ / lượng (chuẩn hóa theo triệu VNĐ/lượng ví dụ 88.5 = 88.500.000đ)
  sellPrice: number;  // Triệu VNĐ / lượng
  source: string;     // SJC, DOJI, PNJ
}

export interface IGoldPriceAdapter {
  readonly source: string;
  fetchPrices(): Promise<ScrapedGoldPrice[]>;
}

// 2. Crawler & Adapter Interfaces (News & Policy)
export interface ScrapedNewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date | string;
}

export interface INewsAdapter {
  readonly source: string;
  fetchNews(): Promise<ScrapedNewsItem[]>;
}

export interface NewsCrawlResult {
  success: boolean;
  totalSaved: number;
  totalSkipped: number;
  logs: CrawlLogItem[];
  timestamp: string;
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

// 3. Gold Price API DTOs
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

// 4. News & Policy DTOs
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

// 5. Market Overview & Dashboard DTOs
export interface MarketOverviewStats {
  sjcBuyPrice: number;
  sjcSellPrice: number;
  deltaBuy: number;
  deltaSell: number;
  spread: number;
  marketTrend: 'UP' | 'DOWN' | 'STABLE';
  lastUpdated: string;
}

// 6. AI & Machine Learning Price Forecasting DTOs
export interface ForecastPoint {
  timestamp: string;
  forecastPrice: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface TechnicalIndicators {
  rsi: number;              // Relative Strength Index 14 ngày (0 - 100)
  sma7: number;             // Simple Moving Average 7 ngày
  sma20: number;            // Simple Moving Average 20 ngày
  trendSignal: 'ACCUMULATE' | 'TAKE_PROFIT' | 'NEUTRAL'; // Tín hiệu gợi ý thị trường
  signalReason: string;     // Lý giải chi tiết từ mô hình định lượng
  volatility: number;       // Biên độ biến động giá gần nhất (%)
}

export interface PriceForecastResponse {
  success: boolean;
  symbol: string;
  currentPrice: number;
  forecastDays: number;
  indicators: TechnicalIndicators;
  forecastPoints: ForecastPoint[];
  historicalPoints: PriceHistoryPoint[];
}
