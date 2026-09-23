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
import { PriceHistoryPoint } from '@goldpulse/types';
import { Calendar, Loader2 } from 'lucide-react';

interface PriceChartProps {
  initialSymbol?: string;
  initialRange?: '7d' | '30d';
}

const AVAILABLE_SYMBOLS = [
  { symbol: 'SJC_1L', label: 'Vàng miếng SJC 1L - 10L' },
  { symbol: 'SJC_NHAN', label: 'Vàng nhẫn SJC 99,99%' },
  { symbol: 'DOJI_HN', label: 'DOJI Hà Nội' },
  { symbol: 'DOJI_HCM', label: 'DOJI TP.HCM' },
  { symbol: 'DOJI_NHAN', label: 'Nhẫn Tròn 9999 Hưng Thịnh Vượng' },
  { symbol: 'PNJ_24K', label: 'Vàng PNJ 24K' },
  { symbol: 'PNJ_TRANGSUC', label: 'Vàng nữ trang 999.9 PNJ' },
];

export function PriceChart({
  initialSymbol = 'SJC_1L',
  initialRange = '7d',
}: PriceChartProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [range, setRange] = useState<'7d' | '30d'>(initialRange);
  const [data, setData] = useState<PriceHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prices/history?symbol=${symbol}&range=${range}`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử giá:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [symbol, range]);

  // Format hiển thị ngày trên trục X
  const formatXAxis = (tickItem: string) => {
    try {
      const d = new Date(tickItem);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return tickItem;
    }
  };

  // Tooltip tùy biến nền sáng tinh tế
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1.5">
          <p className="text-slate-500 font-semibold">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }} className="font-mono font-bold">
              {entry.name}: {entry.value?.toFixed(2)} triệu/lượng
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-8">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2.5"></span>
            Biểu Đồ Biến Động Giá Vàng
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            So sánh biến động song song giữa giá Mua vào và Bán ra theo chuỗi thời gian
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Symbol Selector */}
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 shadow-2xs transition-colors"
          >
            {AVAILABLE_SYMBOLS.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Range Buttons */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              onClick={() => setRange('7d')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                range === '7d'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Ngày
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                range === '30d'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Ngày
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 mt-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs z-10 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
            <span>Đang tải chuỗi dữ liệu lịch sử...</span>
          </div>
        )}

        {data.length === 0 && !loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            Chưa có đủ điểm dữ liệu lịch sử cho loại vàng này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="timestamp"
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
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontWeight: 500 }}
                iconType="circle"
              />
              <Line
                name="Giá Bán ra"
                type="monotone"
                dataKey="sellPrice"
                stroke="#D97706"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#D97706', strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: '#FFF', strokeWidth: 2 }}
              />
              <Line
                name="Giá Mua vào"
                type="monotone"
                dataKey="buyPrice"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#059669', strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: '#FFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
