import { prisma } from '@goldpulse/database';
import {
  ForecastPoint,
  TechnicalIndicators,
  PriceForecastResponse,
  PriceHistoryPoint,
} from '@goldpulse/types';

/**
 * Tính toán đường trung bình động đơn giản (Simple Moving Average - SMA)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  const slice = prices.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / slice.length) * 100) / 100;
}

/**
 * Tính toán Chỉ số Sức mạnh Tương đối (Relative Strength Index - RSI 14 ngày)
 * RSI = 100 - (100 / (1 + RS))
 * Vùng < 30: Quá bán (Oversold -> Mua/Tích sản)
 * Vùng > 70: Quá mua (Overbought -> Chốt lời)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) {
    return 50; // Giá trị trung lập mặc định khi không đủ dữ liệu
  }

  let gains = 0;
  let losses = 0;

  // Tính biến động cho period ngày đầu tiên
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  if (avgGain === 0) return 0;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return Math.round(rsi * 10) / 10;
}

/**
 * Dự báo Chuỗi Thời Gian bằng Mô hình Holt's Linear Exponential Smoothing
 * Thích hợp dự báo ngắn hạn 3-7 ngày dựa trên xu hướng thực tế của giá vàng
 */
export function calculateHoltLinearForecast(
  historicalPrices: number[],
  days: number = 5,
  alpha: number = 0.6,
  beta: number = 0.3
): { forecast: number[]; lowerBounds: number[]; upperBounds: number[]; residualsStd: number } {
  const n = historicalPrices.length;
  if (n < 3) {
    const lastPrice = historicalPrices[n - 1] || 88.0;
    return {
      forecast: Array(days).fill(lastPrice),
      lowerBounds: Array(days).fill(lastPrice - 0.5),
      upperBounds: Array(days).fill(lastPrice + 0.5),
      residualsStd: 0.5,
    };
  }

  // Khởi tạo mức (Level) và Xu hướng (Trend)
  let level = historicalPrices[0];
  let trend = historicalPrices[1] - historicalPrices[0];
  const fitted: number[] = [level];

  // Khớp mô hình qua dữ liệu lịch sử
  for (let t = 1; t < n; t++) {
    const prevLevel = level;
    const prevTrend = trend;
    const currentPrice = historicalPrices[t];

    level = alpha * currentPrice + (1 - alpha) * (prevLevel + prevTrend);
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
    fitted.push(prevLevel + prevTrend);
  }

  // Tính sai số dư (Residuals Standard Deviation)
  let sumSquaredDiff = 0;
  for (let i = 1; i < n; i++) {
    const diff = historicalPrices[i] - fitted[i];
    sumSquaredDiff += diff * diff;
  }
  const std = Math.sqrt(sumSquaredDiff / (n - 1)) || 0.3;

  // Dự báo h bước tương lai
  const forecast: number[] = [];
  const lowerBounds: number[] = [];
  const upperBounds: number[] = [];

  for (let h = 1; h <= days; h++) {
    const predicted = Math.round((level + h * trend) * 100) / 100;
    const margin = Math.round(1.96 * std * Math.sqrt(h) * 100) / 100; // Độ tin cậy 95%
    forecast.push(predicted);
    lowerBounds.push(Math.round((predicted - margin) * 100) / 100);
    upperBounds.push(Math.round((predicted + margin) * 100) / 100);
  }

  return { forecast, lowerBounds, upperBounds, residualsStd: Math.round(std * 100) / 100 };
}

/**
 * Tạo tín hiệu thị trường dựa trên phân tích kỹ thuật tổng hợp
 */
export function generateTechnicalSignal(
  rsi: number,
  sma7: number,
  sma20: number,
  currentPrice: number
): { signal: 'ACCUMULATE' | 'TAKE_PROFIT' | 'NEUTRAL'; reason: string; volatility: number } {
  const diffPercent = sma20 > 0 ? ((sma7 - sma20) / sma20) * 100 : 0;
  const volatility = Math.round(Math.abs(diffPercent) * 100) / 100;

  if (rsi < 38 || (currentPrice < sma20 && sma7 > sma20)) {
    return {
      signal: 'ACCUMULATE',
      reason: `Chỉ số RSI ở mức ${rsi} (vùng tích lũy an toàn). Đường ngắn hạn SMA-7 (${sma7}) đang giữ vững trên ngưỡng hỗ trợ SMA-20 (${sma20}). Thích hợp mua tích sản dài hạn.`,
      volatility,
    };
  }

  if (rsi > 68 || (currentPrice > sma7 * 1.02 && sma7 > sma20)) {
    return {
      signal: 'TAKE_PROFIT',
      reason: `Chỉ số RSI đạt ${rsi} (tiệm cận vùng quá mua). Giá vàng đang neo cao hơn đường trung bình SMA-20. Khuyến nghị cân nhắc hiện thực hóa lợi nhuận một phần.`,
      volatility,
    };
  }

  return {
    signal: 'NEUTRAL',
    reason: `RSI duy trì ở mức cân bằng ${rsi}. Chênh lệch giữa SMA-7 (${sma7}) và SMA-20 (${sma20}) ổn định. Thị trường đang trong pha tích lũy đi ngang, khuyến nghị tiếp tục quan sát.`,
    volatility,
  };
}

/**
 * Hàm lấy dữ liệu dự báo hoàn chỉnh từ cơ sở dữ liệu
 */
export async function getForecastData(
  symbol = 'SJC_1L',
  days = 5
): Promise<PriceForecastResponse> {
  const safeDays = Math.max(3, Math.min(14, days));

  // Lấy dữ liệu 30 ngày qua
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const records = await prisma.goldPrice.findMany({
    where: {
      symbol,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Gom nhóm mỗi ngày 1 điểm giá đại diện
  const dailyPointsMap = new Map<string, { timestamp: string; buyPrice: number; sellPrice: number }>();
  for (const r of records) {
    const key = r.createdAt.toISOString().slice(0, 10);
    dailyPointsMap.set(key, {
      timestamp: r.createdAt.toISOString(),
      buyPrice: r.buyPrice,
      sellPrice: r.sellPrice,
    });
  }

  const historicalPoints: PriceHistoryPoint[] = Array.from(dailyPointsMap.values());
  const sellPrices = historicalPoints.map((p) => p.sellPrice);
  const currentPrice = sellPrices[sellPrices.length - 1] || 89.5;

  // Tính toán các chỉ báo kỹ thuật
  const rsi = calculateRSI(sellPrices, 14);
  const sma7 = calculateSMA(sellPrices, 7);
  const sma20 = calculateSMA(sellPrices, 20);
  const signalInfo = generateTechnicalSignal(rsi, sma7, sma20, currentPrice);

  // Tính toán dự báo tương lai
  const { forecast, lowerBounds, upperBounds } = calculateHoltLinearForecast(sellPrices, safeDays);

  const forecastPoints: ForecastPoint[] = [];
  const lastDate = historicalPoints.length > 0
    ? new Date(historicalPoints[historicalPoints.length - 1].timestamp)
    : new Date();

  for (let i = 0; i < safeDays; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + (i + 1));

    forecastPoints.push({
      timestamp: nextDate.toISOString(),
      forecastPrice: forecast[i],
      lowerBound: lowerBounds[i],
      upperBound: upperBounds[i],
      confidence: 95,
    });
  }

  return {
    success: true,
    symbol,
    currentPrice,
    forecastDays: safeDays,
    indicators: {
      rsi,
      sma7,
      sma20,
      trendSignal: signalInfo.signal,
      signalReason: signalInfo.reason,
      volatility: signalInfo.volatility,
    },
    forecastPoints,
    historicalPoints,
  };
}
