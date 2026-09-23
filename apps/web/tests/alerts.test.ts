import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateAlertEmailHtml, sendPriceAlertEmail } from '../lib/email-service';
import { checkAndTriggerPriceAlerts } from '../lib/alert-engine';
import { prisma } from '@goldpulse/database';
import { GoldPriceItem } from '@goldpulse/types';

describe('Price Alert Engine & Notification Service Tests', () => {
  const testEmail = `test_alert_${Date.now()}@example.com`;
  let testUserId = '';
  let testAlertIdAbove = '';
  let testAlertIdBelow = '';

  beforeAll(async () => {
    // Tạo user giả lập cho bài kiểm thử
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: 'dummy_hash',
        name: 'Người dùng thử nghiệm',
      },
    });
    testUserId = user.id;

    // Tạo 2 quy tắc cảnh báo
    // Quy tắc 1: ABOVE khi SJC_1L >= 85.0
    const alertAbove = await prisma.priceAlert.create({
      data: {
        userId: testUserId,
        symbol: 'SJC_1L',
        targetPrice: 85.0,
        condition: 'ABOVE',
        isActive: true,
      },
    });
    testAlertIdAbove = alertAbove.id;

    // Quy tắc 2: BELOW khi DOJI_HN <= 80.0
    const alertBelow = await prisma.priceAlert.create({
      data: {
        userId: testUserId,
        symbol: 'DOJI_HN',
        targetPrice: 80.0,
        condition: 'BELOW',
        isActive: true,
      },
    });
    testAlertIdBelow = alertBelow.id;
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu kiểm thử
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
  });

  it('1. Tạo template HTML email cảnh báo giá đạt chuẩn Fintech Minimalist', () => {
    const html = generateAlertEmailHtml({
      email: 'investor@goldpulse.vn',
      name: 'Nguyễn Văn A',
      symbol: 'SJC_1L',
      symbolName: 'Vàng miếng SJC 1 Lượng',
      condition: 'ABOVE',
      targetPrice: 86.5,
      currentPrice: 87.2,
    });

    expect(html).toContain('GOLDPULSE INTELLIGENCE');
    expect(html).toContain('Vàng miếng SJC 1 Lượng');
    expect(html).toContain('86,5');
    expect(html).toContain('87,2');
    expect(html).toContain('VƯỢT TRÊN NGƯỠNG');
  });

  it('2. Gửi email thông báo mô phỏng thành công với mã định danh messageId', async () => {
    const res = await sendPriceAlertEmail({
      email: 'test@goldpulse.vn',
      symbol: 'DOJI_HN',
      condition: 'BELOW',
      targetPrice: 82.0,
      currentPrice: 81.5,
    });

    expect(res.success).toBe(true);
    expect(res.simulated).toBe(true);
    expect(res.messageId).toBeDefined();
    expect(res.recipient).toBe('test@goldpulse.vn');
  });

  it('3. Động cơ cảnh báo kích hoạt chính xác khi giá chạm hoặc vượt ngưỡng ABOVE', async () => {
    const mockPrices: GoldPriceItem[] = [
      {
        id: 'p-1',
        symbol: 'SJC_1L',
        name: 'Vàng SJC 1L',
        source: 'SJC',
        buyPrice: 84.0,
        sellPrice: 86.0, // 86.0 >= 85.0 -> TRIGGER
        deltaBuy: 0,
        deltaSell: 0,
        spread: 2.0,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'p-2',
        symbol: 'DOJI_HN',
        name: 'DOJI Hà Nội',
        source: 'DOJI',
        buyPrice: 82.0, // 82.0 > 80.0 -> KHÔNG TRIGGER
        sellPrice: 83.5,
        deltaBuy: 0,
        deltaSell: 0,
        spread: 1.5,
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = await checkAndTriggerPriceAlerts(mockPrices);
    expect(result.triggeredAlertIds).toContain(testAlertIdAbove);
    expect(result.triggeredAlertIds).not.toContain(testAlertIdBelow);

    // Kiểm tra bản ghi log kiểm toán đã được tạo
    const logs = await prisma.alertLog.findMany({
      where: { alertId: testAlertIdAbove },
    });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].status).toBe('SUCCESS');
    expect(logs[0].sentPrice).toBe(86.0);
  });

  it('4. Chống spam email: không kích hoạt lại cùng 1 alert nếu thời gian giãn cách < 120 phút', async () => {
    const mockPrices: GoldPriceItem[] = [
      {
        id: 'p-1',
        symbol: 'SJC_1L',
        name: 'Vàng SJC 1L',
        source: 'SJC',
        buyPrice: 84.0,
        sellPrice: 87.0, // Vẫn >= 85.0 nhưng vừa kích hoạt ở test trước!
        deltaBuy: 0,
        deltaSell: 0,
        spread: 3.0,
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = await checkAndTriggerPriceAlerts(mockPrices);
    // testAlertIdAbove không được gửi lại do còn trong cooldown
    expect(result.triggeredAlertIds).not.toContain(testAlertIdAbove);
  });

  it('5. Động cơ cảnh báo kích hoạt chính xác cho điều kiện BELOW', async () => {
    const mockPrices: GoldPriceItem[] = [
      {
        id: 'p-2',
        symbol: 'DOJI_HN',
        name: 'DOJI Hà Nội',
        source: 'DOJI',
        buyPrice: 79.5, // 79.5 <= 80.0 -> TRIGGER
        sellPrice: 81.0,
        deltaBuy: 0,
        deltaSell: 0,
        spread: 1.5,
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = await checkAndTriggerPriceAlerts(mockPrices);
    expect(result.triggeredAlertIds).toContain(testAlertIdBelow);
  });
});

