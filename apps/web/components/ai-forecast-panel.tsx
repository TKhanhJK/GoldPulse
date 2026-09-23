'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PriceForecastResponse } from '@goldpulse/types';
import { formatCurrencyVND } from '@/lib/formatters';
import {
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  Loader2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

const FORECAST_SYMBOLS = [
  { symbol: 'SJC_1L', label: 'Vàng miếng SJC 1L - 10L' },
  { symbol: 'SJC_NHAN', label: 'Vàng nhẫn SJC 99,99%' },
  { symbol: 'DOJI_HN', label: 'DOJI Hà Nội' },
  { symbol: 'PNJ_24K', label: 'Vàng PNJ 24K' },
];

export function AiForecastPanel() {
  const [symbol, setSymbol] = useState('SJC_1L');
  const [days, setDays] = useState(5);
  const [forecastData, setForecastData] = useState<PriceForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadForecast() {
      setLoading(true);
      try {
        const res = await fetch(`/api/forecast?symbol=${symbol}&days=${days}`);
        const json = await res.json();
        if (isMounted && json.success) {
          setForecastData(json);
        }
      } catch (err) {
        console.error('Lỗi khi tải dự báo AI:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadForecast();
    return () => {
      isMounted = false;
    };
  }, [symbol, days]);

  // Chuẩn bị dữ liệu hiển thị nối liền giữa quá khứ và tương lai
  const chartData = React.useMemo(() => {
    if (!forecastData) return [];

    const result: any[] = [];
    const hist = forecastData.historicalPoints.slice(-14); // 14 ngày gần nhất để biểu đồ cân đối

    hist.forEach((p, idx) => {
      const isLast = idx === hist.length - 1;
      result.push({
        date: p.timestamp,
        actualPrice: p.sellPrice,
        // Điểm cuối cùng của lịch sử nối vào đầu của đường dự báo để nét đứt liền mạch
        forecastPrice: isLast ? p.sellPrice : null,
        lowerBound: isLast ? p.sellPrice : null,
        upperBound: isLast ? p.sellPrice : null,
        type: 'historical',
      });
    });

    forecastData.forecastPoints.forEach((p) => {
      result.push({
        date: p.timestamp,
        actualPrice: null,
        forecastPrice: p.forecastPrice,
        lowerBound: p.lowerBound,
        upperBound: p.upperBound,
        type: 'forecast',
      });
    });

    return result;
  }, [forecastData]);

  const indicators = forecastData?.indicators || {
    rsi: 50,
    sma7: 0,
    sma20: 0,
    trendSignal: 'NEUTRAL',
    signalReason: 'Đang tải dữ liệu tính toán...',
    volatility: 0,
  };

  const isAccumulate = indicators.trendSignal === 'ACCUMULATE';
  const isTakeProfit = indicators.trendSignal === 'TAKE_PROFIT';

  const formatXAxis = (tickItem: string) => {
    try {
      const d = new Date(tickItem);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return tickItem;
    }
  };

  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      const item = payload[0]?.payload;

      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1.5 font-sans">
          <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100">
            <span className="font-semibold text-slate-600">{formattedDate}</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                item.type === 'forecast'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.type === 'forecast' ? 'Dự Báo AI' : 'Thực Tế'}
            </span>
          </div>

          {item.actualPrice && (
            <p className="font-mono text-slate-800">
              Giá thực tế: <strong>{item.actualPrice.toFixed(2)}</strong> tr/lượng
            </p>
          )}

          {item.type === 'forecast' && (
            <>
              <p className="font-mono text-purple-700 font-bold">
                Kỳ vọng: <strong>{item.forecastPrice.toFixed(2)}</strong> tr/lượng
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                Biên độ 95%: {item.lowerBound?.toFixed(2)} — {item.upperBound?.toFixed(2)} tr
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-8">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs mt-0.5">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Mô Hình Dự Báo Xu Hướng Giá Vàng AI
              </h2>
              <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Machine Learning
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ứng dụng mô hình chuỗi thời gian Holt-Winters kết hợp chỉ báo kỹ thuật RSI & SMA để dự đoán giá 3–7 ngày tới
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 shadow-2xs"
          >
            {FORECAST_SYMBOLS.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs">
            {[3, 5, 7].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  days === d
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d} Ngày
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Indicator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Card 1: AI Market Signal */}
        <div className="p-4 rounded-xl border bg-slate-50/60 border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Tín Hiệu Hành Động</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="my-2">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${
                isAccumulate
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isTakeProfit
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {isAccumulate && <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />}
              {isTakeProfit && <TrendingUp className="w-4 h-4 mr-1.5 text-amber-600" />}
              {!isAccumulate && !isTakeProfit && <Info className="w-4 h-4 mr-1.5 text-slate-500" />}
              {isAccumulate ? 'KHUYẾN NGHỊ: MUA TÍCH SẢN' : isTakeProfit ? 'KHUYẾN NGHỊ: CHỐT LỜI' : 'KHUYẾN NGHỊ: QUAN SÁT'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 leading-snug">
            {indicators.signalReason}
          </div>
        </div>

        {/* Card 2: RSI 14 Days Gauge */}
        <div className="p-4 rounded-xl border bg-slate-50/60 border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Chỉ Số RSI (14 Ngày)</span>
            <span className="font-mono font-bold text-slate-800 text-sm">{indicators.rsi}</span>
          </div>
          {/* Progress bar */}
          <div className="my-3">
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-500 ${
                  indicators.rsi > 70
                    ? 'bg-rose-500'
                    : indicators.rsi < 35
                    ? 'bg-emerald-500'
                    : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, indicators.rsi))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 (Quá Bán)</span>
              <span>50 (Cân Bằng)</span>
              <span>100 (Quá Mua)</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            {indicators.rsi < 35
              ? 'Áp lực bán giảm, xác suất đảo chiều tăng cao.'
              : indicators.rsi > 70
              ? 'Thị trường hưng phấn quá mức, cẩn trọng điều chỉnh.'
              : 'Thị trường dao động ổn định trong biên độ an toàn.'}
          </div>
        </div>

        {/* Card 3: Moving Averages & Volatility */}
        <div className="p-4 rounded-xl border bg-slate-50/60 border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Đường Trung Bình (SMA)</span>
            <span className="text-[11px] text-slate-400 font-mono">Biên độ: ±{indicators.volatility}%</span>
          </div>
          <div className="my-2 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Ngắn hạn (SMA-7):</span>
              <span className="font-bold text-slate-800">{formatCurrencyVND(indicators.sma7)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Trung hạn (SMA-20):</span>
              <span className="font-bold text-slate-800">{formatCurrencyVND(indicators.sma20)}</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            {indicators.sma7 >= indicators.sma20
              ? 'SMA-7 cắt lên trên SMA-20 (Tín hiệu Golden Cross tăng giá).'
              : 'SMA-7 nằm dưới SMA-20 (Xu hướng tích lũy kiểm định đáy).'}
          </div>
        </div>
      </div>

      {/* Chart Canvas: Actual Price vs AI Forecast (Nét Đứt) */}
      <div className="w-full h-80 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs z-10 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
            <span>AI đang tính toán chuỗi phân tích Holt-Winters...</span>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip content={<CustomForecastTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontWeight: 500 }}
              iconType="circle"
            />
            {/* Đường Giá Lịch Sử Thực Tế (Nét liền) */}
            <Line
              name="Giá Bán thực tế"
              type="monotone"
              dataKey="actualPrice"
              stroke="#D97706"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#D97706', strokeWidth: 0 }}
              connectNulls={false}
            />
            {/* Đường Dự Báo AI Tương Lai (Nét đứt màu tím) */}
            <Line
              name="Dự báo AI (Holt-Winters)"
              type="monotone"
              dataKey="forecastPrice"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFF' }}
              activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#FFF', strokeWidth: 2 }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="flex items-center">
          <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Mô hình Holt-Winters đánh giá xu hướng giá thực nghiệm. Độ tin cậy tính toán theo mức sai số chuẩn 95%.
        </span>
        <span className="font-mono text-purple-700 font-semibold">
          AI Confidence: 95%
        </span>
      </div>
    </div>
  );
}

