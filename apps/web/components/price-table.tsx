'use client';

import React, { useState } from 'react';
import { GoldPriceItem } from '@goldpulse/types';
import { formatCurrencyVND, formatDelta, formatDateVN } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Minus, Clock, ShieldCheck } from 'lucide-react';

interface PriceTableProps {
  prices: GoldPriceItem[];
}

export function PriceTable({ prices }: PriceTableProps) {
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const sources = ['ALL', 'SJC', 'DOJI', 'PNJ'];

  const filteredPrices = selectedSource === 'ALL'
    ? prices
    : prices.filter((p) => p.source.toUpperCase() === selectedSource);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg backdrop-blur mb-8">
      {/* Table Header & Brand Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2.5"></span>
            Bảng Giá Thị Trường Chi Tiết
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Niêm yết giá mua vào - bán ra chính thức từ các doanh nghiệp kinh doanh vàng uy tín
          </p>
        </div>

        {/* Source Filter Tabs */}
        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/80 p-0.5 text-xs">
          {sources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                selectedSource === src
                  ? 'bg-gold-500 text-slate-950 shadow font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {src === 'ALL' ? 'Tất cả nguồn' : src}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Loại Vàng</th>
              <th className="py-3 px-4">Đơn Vị</th>
              <th className="py-3 px-4 text-right">Giá Mua Vào</th>
              <th className="py-3 px-4 text-right">Biến Động (Mua)</th>
              <th className="py-3 px-4 text-right">Giá Bán Ra</th>
              <th className="py-3 px-4 text-right">Biến Động (Bán)</th>
              <th className="py-3 px-4 text-right">Chênh Lệch</th>
              <th className="py-3 px-4 text-right">Cập Nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredPrices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
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
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Loại vàng */}
                    <td className="py-3.5 px-4 font-sans font-semibold text-white group-hover:text-gold-400 transition-colors">
                      {item.name}
                    </td>

                    {/* Đơn vị cung cấp */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-slate-800 text-gold-400 border border-slate-700">
                        <ShieldCheck className="w-3 h-3 mr-1 text-gold-500" />
                        {item.source}
                      </span>
                    </td>

                    {/* Giá Mua */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                      {formatCurrencyVND(item.buyPrice)}
                    </td>

                    {/* Biến Động Mua */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center justify-end text-[11px] font-semibold ${
                          isBuyUp
                            ? 'text-emerald-400'
                            : isBuyDown
                            ? 'text-rose-400'
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
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {formatCurrencyVND(item.sellPrice)}
                    </td>

                    {/* Biến Động Bán */}
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center justify-end text-[11px] font-semibold ${
                          isSellUp
                            ? 'text-emerald-400'
                            : isSellDown
                            ? 'text-rose-400'
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
                    <td className="py-3.5 px-4 text-right font-medium text-gold-400">
                      {formatCurrencyVND(item.spread)}
                    </td>

                    {/* Cập Nhật */}
                    <td className="py-3.5 px-4 text-right text-slate-400 font-sans text-[11px]">
                      <span className="inline-flex items-center text-slate-400">
                        <Clock className="w-3 h-3 mr-1 text-slate-500" />
                        {formatDateVN(item.updatedAt)}
                      </span>
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
