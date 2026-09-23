import { describe, it, expect } from 'vitest';
import {
  calculateSMA,
  calculateRSI,
  calculateHoltLinearForecast,
  generateTechnicalSignal,
  getForecastData,
} from '../lib/forecasting-engine';

describe('AI Price Forecasting & Technical Indicators Tests', () => {
  describe('1. Simple Moving Average (SMA)', () => {
    it('nên tính SMA chính xác cho chuỗi giá', () => {
      const prices = [80, 82, 84, 86, 88, 90, 92];
      const sma3 = calculateSMA(prices, 3);
      expect(sma3).toBe(90); // (88 + 90 + 92) / 3 = 90

      const sma7 = calculateSMA(prices, 7);
      expect(sma7).toBe(86); // sum / 7 = 86
    });
  });

  describe('2. Relative Strength Index (RSI)', () => {
    it('nên trả về giá trị trong khoảng 0 đến 100', () => {
      const prices = [85, 86, 85.5, 87, 88, 87.5, 89, 89.5, 90, 91, 90.5, 92, 92.5, 93, 93.5];
      const rsi = calculateRSI(prices, 14);

      expect(rsi).toBeGreaterThanOrEqual(0);
      expect(rsi).toBeLessThanOrEqual(100);
      expect(typeof rsi).toBe('number');
    });

    it('chuỗi giá tăng liên tục phải có RSI cao (> 70)', () => {
      const bullishPrices = Array.from({ length: 20 }, (_, i) => 80 + i * 0.5);
      const rsi = calculateRSI(bullishPrices, 14);
      expect(rsi).toBeGreaterThanOrEqual(70);
    });

    it('chuỗi giá giảm liên tục phải có RSI thấp (< 35)', () => {
      const bearishPrices = Array.from({ length: 20 }, (_, i) => 90 - i * 0.5);
      const rsi = calculateRSI(bearishPrices, 14);
      expect(rsi).toBeLessThanOrEqual(35);
    });
  });

  describe('3. Holt-Winters Linear Forecasting', () => {
    it('nên sinh đủ số ngày dự báo và biên trên luôn lớn hơn biên dưới', () => {
      const prices = [86, 86.5, 87, 87.2, 87.8, 88, 88.5, 89, 89.2, 89.5];
      const days = 5;
      const { forecast, lowerBounds, upperBounds } = calculateHoltLinearForecast(prices, days);

      expect(forecast).toHaveLength(days);
      expect(lowerBounds).toHaveLength(days);
      expect(upperBounds).toHaveLength(days);

      for (let i = 0; i < days; i++) {
        expect(upperBounds[i]).toBeGreaterThan(lowerBounds[i]);
        expect(forecast[i]).toBeGreaterThanOrEqual(lowerBounds[i]);
        expect(forecast[i]).toBeLessThanOrEqual(upperBounds[i]);
      }
    });
  });

  describe('4. AI Signal Generation', () => {
    it('nên phát tín hiệu ACCUMULATE khi RSI thấp', () => {
      const signal = generateTechnicalSignal(30, 88.0, 87.5, 87.0);
      expect(signal.signal).toBe('ACCUMULATE');
      expect(signal.reason).toContain('RSI');
    });

    it('nên phát tín hiệu TAKE_PROFIT khi RSI quá cao', () => {
      const signal = generateTechnicalSignal(75, 92.0, 88.0, 94.0);
      expect(signal.signal).toBe('TAKE_PROFIT');
    });

    it('nên phát tín hiệu NEUTRAL khi thị trường cân bằng', () => {
      const signal = generateTechnicalSignal(50, 88.0, 88.0, 88.0);
      expect(signal.signal).toBe('NEUTRAL');
    });
  });

  describe('5. getForecastData Integration with Database', () => {
    it('nên trả về đầy đủ kết quả dự báo 5 ngày cho SJC_1L', async () => {
      const res = await getForecastData('SJC_1L', 5);

      expect(res.success).toBe(true);
      expect(res.symbol).toBe('SJC_1L');
      expect(res.forecastDays).toBe(5);
      expect(res.forecastPoints).toHaveLength(5);
      expect(res.indicators.rsi).toBeDefined();
      expect(res.indicators.sma7).toBeGreaterThan(0);
      expect(res.indicators.sma20).toBeGreaterThan(0);
      expect(res.indicators.trendSignal).toBeDefined();
      expect(res.historicalPoints.length).toBeGreaterThan(0);
    });
  });
});
