import { ScrapedGoldPrice, IGoldPriceAdapter } from '@goldpulse/types';

export { ScrapedGoldPrice, IGoldPriceAdapter };

/**
 * Hàm chuẩn hóa chuỗi giá số liệu tiếng Việt sang số thực (triệu VNĐ/lượng)
 * Ví dụ:
 *  "88,500,000" -> 88.5
 *  "88.500.000" -> 88.5
 *  "88.5" -> 88.5
 *  "8,850" (nghìn/chỉ) -> 88.5
 */
export function normalizePrice(raw: string | number): number {
  if (typeof raw === 'number') {
    if (raw > 1000000) {
      return Math.round((raw / 1000000) * 100) / 100;
    }
    if (raw > 1000) {
      // Đơn vị nghìn đồng/chỉ (1 lượng = 10 chỉ)
      return Math.round(((raw * 10) / 1000) * 100) / 100;
    }
    return Math.round(raw * 100) / 100;
  }

  if (!raw) return 0;

  // Xóa mọi ký tự ngoại trừ chữ số, dấu chấm, dấu phẩy
  const cleaned = raw.trim().replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;

  // Xác định định dạng phân cách
  let numericValue = 0;
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // Kiểu 88.500,00 hoặc 88,500.00
    if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
      numericValue = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else {
      numericValue = parseFloat(cleaned.replace(/,/g, ''));
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      numericValue = parseFloat(cleaned.replace(/,/g, ''));
    } else {
      numericValue = parseFloat(cleaned.replace(',', '.'));
    }
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      numericValue = parseFloat(cleaned.replace(/\./g, ''));
    } else {
      numericValue = parseFloat(cleaned);
    }
  } else {
    numericValue = parseFloat(cleaned);
  }

  if (isNaN(numericValue)) return 0;

  if (numericValue > 1000000) {
    return Math.round((numericValue / 1000000) * 100) / 100;
  }
  if (numericValue > 1000) {
    return Math.round(((numericValue * 10) / 1000) * 100) / 100;
  }
  return Math.round(numericValue * 100) / 100;
}
