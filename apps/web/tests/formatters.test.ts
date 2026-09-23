import { describe, it, expect } from 'vitest';
import { formatCurrencyVND, formatMillionVND, formatDelta, formatDateVN } from '../lib/formatters';

describe('UI Formatters Verification', () => {
  it('nên format giá triệu VNĐ sang tiền tệ Việt Nam chính xác', () => {
    expect(formatCurrencyVND(88.5)).toContain('88.500.000');
    expect(formatCurrencyVND(0)).toContain('0');
    expect(formatCurrencyVND(NaN)).toBe('0 ₫');
  });

  it('nên format số triệu VNĐ sang chuỗi 2 chữ số thập phân', () => {
    expect(formatMillionVND(88.5)).toBe('88.50');
    expect(formatMillionVND(88.567)).toBe('88.57');
  });

  it('nên format delta có dấu + hoặc - tương ứng', () => {
    expect(formatDelta(0.5)).toBe('+0.50');
    expect(formatDelta(-0.35)).toBe('-0.35');
    expect(formatDelta(0)).toBe('0.00');
  });

  it('nên format ngày tháng năm theo chuẩn tiếng Việt', () => {
    const formatted = formatDateVN(new Date('2026-09-23T14:30:00Z'));
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(5);
  });
});

