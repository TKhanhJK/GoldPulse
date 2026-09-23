'use client';

import React, { useState } from 'react';
import { GoldPriceItem } from '@goldpulse/types';
import { formatCurrencyVND, formatDelta, formatDateVN } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Minus, Clock, ShieldCheck, Bell } from 'lucide-react';

interface PriceTableProps {
  prices: GoldPriceItem[];
  onOpenAlert?: (symbol: string) => void;
}

export function PriceTable({ prices, onOpenAlert }: PriceTableProps) {
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const sources = ['ALL', 'SJC', 'DOJI', 'PNJ'];

  const filteredPrices = selectedSource === 'ALL'
    ? prices
    : prices.filter((p) => p.source.toUpperCase() === selectedSource);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-8">
      {/* Table Header & Brand Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2.5"></span>
            Bảng Giá Thị Trường Chi Tiết
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Niêm yết giá mua vào - bán ra chính thức từ các doanh nghiệp kinh doanh vàng uy tín
          </p>
        </div>

        {/* Source Filter Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs">
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedSource === src
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {src === 'ALL' ? 'Tất cả nguồn' : src}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4 rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Loại Vàng</th>
              <th className="py-3 px-4">Đơn Vị</th>
              <th className="py-3 px-4 text-right">Giá Mua Vào</th>
              <th className="py-3 px-4 text-right">Biến Động (Mua)</th>
              <th className="py-3 px-4 text-right">Giá Bán Ra</th>
              <th className="py-3 px-4 text-right">Biến Động (Bán)</th>
              <th className="py-3 px-4 text-right">Chênh Lệch</th>
              <th className="py-3 px-4 text-right">Cập Nhật</th>
              <th className="py-3 px-4 text-center">Cảnh Báo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filteredPrices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                  Không có dữ liệu giá nào phù hợp với bộ lọc
                </td>
              </tr>
            ) : (
              filteredPrices.map((item) => {
                const isBuyUp = item.deltaBuy > 0;
                const isBuyDown = item.deltaBuy < 0;

                const isSellUp = item.deltaSell > 0;
                const isSellDown = item.deltaSell < 0;

                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-amber-50/20 transition-colors group"
                  >
                    {/* Loại vàng */}
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {item.name}
                    </td>

                    {/* Đơn vị cung cấp */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <ShieldCheck className="w-3 h-3 mr-1 text-amber-600" />
                        {item.source}
                      </span>
                    </td>

                    {/* Giá Mua */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {formatCurrencyVND(item.buyPrice)}
                    </td>

                    {/* Biến Động Mua */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center justify-end text-[11px] font-bold ${
                          isBuyUp
                            ? 'text-emerald-600'
                            : isBuyDown
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {isBuyUp && <TrendingUp className="w-3 h-3 mr-0.5" />}
                        {isBuyDown && <TrendingDown className="w-3 h-3 mr-0.5" />}
                        {!isBuyUp && !isBuyDown && <Minus className="w-3 h-3 mr-0.5" />}
                        {formatDelta(item.deltaBuy)} tr
                      </span>
                    </td>

                    {/* Giá Bán */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrencyVND(item.sellPrice)}
                    </td>

                    {/* Biến Động Bán */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center justify-end text-[11px] font-bold ${
                          isSellUp
                            ? 'text-emerald-600'
                            : isSellDown
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {isSellUp && <TrendingUp className="w-3 h-3 mr-0.5" />}
                        {isSellDown && <TrendingDown className="w-3 h-3 mr-0.5" />}
                        {!isSellUp && !isSellDown && <Minus className="w-3 h-3 mr-0.5" />}
                        {formatDelta(item.deltaSell)} tr
                      </span>
                    </td>

                    {/* Chênh Lệch Spread */}
                    <td className="py-3.5 px-4 text-right font-bold text-amber-700">
                      {formatCurrencyVND(item.spread)}
                    </td>

                    {/* Cập Nhật */}
                    <td className="py-3.5 px-4 text-right text-slate-500 font-sans text-[11px]">
                      <span className="inline-flex items-center text-slate-400">
                        <Clock className="w-3 h-3 mr-1 text-slate-400" />
                        {formatDateVN(item.updatedAt)}
                      </span>
                    </td>

                    {/* Nút Cảnh Báo Giá */}
                    <td className="py-3.5 px-4 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => onOpenAlert?.(item.symbol)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-colors"
                        title={`Đặt cảnh báo giá cho ${item.name}`}
                      >
                        <Bell className="w-3 h-3 text-amber-600" />
                        <span>Đặt chuông</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
