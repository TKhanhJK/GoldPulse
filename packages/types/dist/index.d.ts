export interface ScrapedGoldPrice {
    symbol: string;
    name: string;
    buyPrice: number;
    sellPrice: number;
    source: string;
}
export interface IGoldPriceAdapter {
    readonly source: string;
    fetchPrices(): Promise<ScrapedGoldPrice[]>;
}
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
export interface MarketOverviewStats {
    sjcBuyPrice: number;
    sjcSellPrice: number;
    deltaBuy: number;
    deltaSell: number;
    spread: number;
    marketTrend: 'UP' | 'DOWN' | 'STABLE';
    lastUpdated: string;
}
export interface ForecastPoint {
    timestamp: string;
    forecastPrice: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
}
export interface TechnicalIndicators {
    rsi: number;
    sma7: number;
    sma20: number;
    trendSignal: 'ACCUMULATE' | 'TAKE_PROFIT' | 'NEUTRAL';
    signalReason: string;
    volatility: number;
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
export interface UserSession {
    id: string;
    email: string;
    name?: string | null;
    role: 'USER' | 'ADMIN';
}
export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    success: boolean;
    user?: UserSession;
    token?: string;
    error?: string;
}
export interface PriceAlertItem {
    id: string;
    userId: string;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    channel: string;
    isActive: boolean;
    lastTriggeredAt?: string | null;
    createdAt: string;
}
export interface CreateAlertRequest {
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
}
export interface AlertCheckResult {
    totalChecked: number;
    totalTriggered: number;
    triggeredAlertIds: string[];
}
export interface AdminSystemStats {
    totalUsers: number;
    totalAlerts: number;
    activeAlerts: number;
    totalCrawls: number;
    successfulCrawls: number;
    totalNews: number;
    totalPriceRecords: number;
    totalAlertLogs: number;
}
export interface AdminUserItem {
    id: string;
    email: string;
    name: string | null;
    role: string;
    alertsCount: number;
    createdAt: string;
}
export interface AdminAlertItem {
    id: string;
    userId: string;
    userEmail: string;
    userName: string | null;
    symbol: string;
    targetPrice: number;
    condition: string;
    isActive: boolean;
    lastTriggeredAt: string | null;
    createdAt: string;
}
//# sourceMappingURL=index.d.ts.map