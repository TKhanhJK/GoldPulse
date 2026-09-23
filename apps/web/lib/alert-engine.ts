import { prisma } from '@goldpulse/database';
import { GoldPriceItem, AlertCheckResult } from '@goldpulse/types';
import { sendPriceAlertEmail } from './email-service';
import { getLatestPricesData } from './api-services';

// Thời gian tối thiểu giữa các lần gửi cảnh báo lặp lại cho cùng 1 quy tắc (tránh spam email)
export const ALERT_COOLDOWN_MINUTES = 120; // 2 tiếng

/**
 * Động cơ quét và kiểm tra các quy tắc cảnh báo giá vàng của người dùng
 */
export async function checkAndTriggerPriceAlerts(
  inputPrices?: GoldPriceItem[]
): Promise<AlertCheckResult> {
  // 1. Lấy danh sách giá vàng mới nhất nếu không được truyền vào
  let prices = inputPrices;
  if (!prices || prices.length === 0) {
    const latestResponse = await getLatestPricesData();
    prices = latestResponse.data;
  }

  // Tạo map tra cứu nhanh theo symbol
  const priceMap = new Map<string, GoldPriceItem>();
  for (const p of prices) {
    priceMap.set(p.symbol, p);
  }

  // 2. Lấy tất cả các quy tắc cảnh báo đang hoạt động kèm thông tin người dùng
  const activeAlerts = await prisma.priceAlert.findMany({
    where: { isActive: true },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  const now = new Date();
  const triggeredAlertIds: string[] = [];

  for (const alert of activeAlerts) {
    const currentPriceItem = priceMap.get(alert.symbol);
    if (!currentPriceItem) continue;

    // 3. Kiểm tra Cooldown chống spam email
    if (alert.lastTriggeredAt) {
      const diffMs = now.getTime() - new Date(alert.lastTriggeredAt).getTime();
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes < ALERT_COOLDOWN_MINUTES) {
        // Vẫn trong thời gian giãn cách, bỏ qua
        continue;
      }
    }

    // 4. Kiểm tra điều kiện kích hoạt
    const isAbove = alert.condition === 'ABOVE';
    const isBelow = alert.condition === 'BELOW';

    // Với ABOVE: Giá bán ra vượt ngưỡng mục tiêu
    // Với BELOW: Giá mua vào rơi xuống dưới ngưỡng mục tiêu
    const currentCheckPrice = isAbove ? currentPriceItem.sellPrice : currentPriceItem.buyPrice;
    let shouldTrigger = false;

    if (isAbove && currentCheckPrice >= alert.targetPrice) {
      shouldTrigger = true;
    } else if (isBelow && currentCheckPrice <= alert.targetPrice) {
      shouldTrigger = true;
    }

    if (shouldTrigger) {
      try {
        // Gửi email cảnh báo
        const dispatchResult = await sendPriceAlertEmail({
          email: alert.user.email,
          name: alert.user.name,
          symbol: alert.symbol,
          symbolName: currentPriceItem.name,
          condition: alert.condition as 'ABOVE' | 'BELOW',
          targetPrice: alert.targetPrice,
          currentPrice: currentCheckPrice,
          triggeredAt: now,
        });

        // Cập nhật trạng thái và ghi log kiểm toán
        await prisma.$transaction([
          prisma.priceAlert.update({
            where: { id: alert.id },
            data: { lastTriggeredAt: now },
          }),
          prisma.alertLog.create({
            data: {
              alertId: alert.id,
              sentPrice: currentCheckPrice,
              sentToEmail: alert.user.email,
              status: dispatchResult.success ? 'SUCCESS' : 'FAILED',
              message: dispatchResult.error || `Kích hoạt cảnh báo giá: ${alert.condition} ${alert.targetPrice} tr/lượng (giá thực tế: ${currentCheckPrice})`,
            },
          }),
        ]);

        triggeredAlertIds.push(alert.id);
      } catch (err) {
        console.error(`[ALERT ENGINE ERROR] Thất bại khi kích hoạt cảnh báo alertId=${alert.id}:`, err);
      }
    }
  }

  return {
    totalChecked: activeAlerts.length,
    totalTriggered: triggeredAlertIds.length,
    triggeredAlertIds,
  };
}

