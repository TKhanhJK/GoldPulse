import { getLatestPricesData, getNewsData } from '@/lib/api-services';
import { MarketTicker } from '@/components/market-ticker';
import { StatCards } from '@/components/stat-cards';
import { PriceChart } from '@/components/price-chart';
import { AiForecastPanel } from '@/components/ai-forecast-panel';
import { PriceTable } from '@/components/price-table';
import { NewsHub } from '@/components/news-hub';
import { formatDateVN } from '@/lib/formatters';
import { RefreshCw, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const latestResponse = await getLatestPricesData();
  const initialNews = await getNewsData(1, 6);

  const prices = latestResponse.data;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. Market Ticker Bar trên đỉnh */}
      <MarketTicker prices={prices} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Dữ liệu trực tiếp theo thời gian thực 24/7
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Thị Trường Giá Vàng & Chính Sách Điều Hành
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                Hệ thống tự động tổng hợp giá vàng miếng SJC, DOJI, PNJ, tính toán mức chênh lệch Mua - Bán (Spread) và cập nhật tin tức pháp lý vĩ mô từ Ngân hàng Nhà nước.
              </p>
            </div>

            <div className="flex items-center self-start md:self-auto bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs shadow-xs">
              <RefreshCw className="w-4 h-4 text-amber-600 mr-2.5 animate-spin-slow" />
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Phiên cập nhật gần nhất</span>
                <span className="text-slate-900 font-mono font-bold">
                  {formatDateVN(latestResponse.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Thẻ Thống Kê Tổng Quan (Stat Cards) */}
        <section id="stats">
          <StatCards prices={prices} />
        </section>

        {/* 3. Biểu Đồ Tương Tác Chuỗi Thời Gian (Price Chart) */}
        <section id="chart">
          <PriceChart initialSymbol="SJC_1L" initialRange="7d" />
        </section>

        {/* 4. Mô Hình Dự Báo AI & Chỉ Báo Kỹ Thuật (Machine Learning Forecast) */}
        <section id="forecast">
          <AiForecastPanel />
        </section>

        {/* 5. Bảng Giá Thị Trường Chi Tiết (Price Table) */}
        <section id="table">
          <PriceTable prices={prices} />
        </section>

        {/* 6. Trung Tâm Tin Tức & Chính Sách Vàng (News Hub) */}
        <section id="news">
          <NewsHub initialNews={initialNews} />
        </section>
      </div>
    </div>
  );
}
