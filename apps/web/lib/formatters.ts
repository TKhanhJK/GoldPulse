/**
 * Format giá vàng (triệu VNĐ/lượng)
 * Ví dụ: 88.5 -> "88.500.000 ₫" hoặc "88.50 triệu/lượng"
 */
export function formatCurrencyVND(millionVnd: number): string {
  if (millionVnd === undefined || millionVnd === null || isNaN(millionVnd)) return '0 ₫';
  const vnd = Math.round(millionVnd * 1000000);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(vnd);
}

export function formatMillionVND(millionVnd: number): string {
  if (millionVnd === undefined || millionVnd === null || isNaN(millionVnd)) return '0.00';
  return (Math.round(millionVnd * 100) / 100).toFixed(2);
}

export function formatDelta(delta: number): string {
  if (!delta || delta === 0) return '0.00';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}`;
}

export function formatDateVN(dateStr: string | Date): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

