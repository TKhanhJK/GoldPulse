'use client';

import React from 'react';
import { GoldPriceItem } from '@goldpulse/types';
import { formatCurrencyVND, formatDelta } from '@/lib/formatters';
import { ArrowUpRight, ArrowDownRight, Scale, Activity, Coins } from 'lucide-react';

interface StatCardsProps {
  prices: GoldPriceItem[];
}

export function StatCards({ prices }: StatCardsProps) {
  // Lấy dữ liệu SJC miếng làm đại diện chuẩn của thị trường
  const sjc = prices.find((p) => p.symbol === 'SJC_1L') || prices[0];

  if (!sjc) return null;

  const isBuyUp = sjc.deltaBuy > 0;
  const isBuyDown = sjc.deltaBuy < 0;

  const isSellUp = sjc.deltaSell > 0;
  const isSellDown = sjc.deltaSell < 0;

  let trendText = 'Thị trường ổn định';
  let trendColor = 'text-slate-700 bg-slate-100 border-slate-200';

  if (sjc.deltaSell > 0.3) {
    trendText = 'Xu hướng tăng mạnh';
    trendColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
  } else if (sjc.deltaSell > 0) {
    trendText = 'Xu hướng tăng nhẹ';
    trendColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
  } else if (sjc.deltaSell < -0.3) {
    trendText = 'Xu hướng giảm mạnh';
    trendColor = 'text-rose-800 bg-rose-50 border-rose-200';
  } else if (sjc.deltaSell < 0) {
    trendText = 'Xu hướng giảm nhẹ';
    trendColor = 'text-rose-800 bg-rose-50 border-rose-200';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. SJC Mua vào */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">SJC Mua Vào</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            {formatCurrencyVND(sjc.buyPrice)}
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span
              className={`inline-flex items-center font-bold ${
                isBuyUp ? 'text-emerald-600' : isBuyDown ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {isBuyUp && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {isBuyDown && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {formatDelta(sjc.deltaBuy)} tr/lượng
            </span>
            <span className="text-slate-400 ml-2">so với phiên trước</span>
          </div>
        </div>
      </div>

      {/* 2. SJC Bán ra */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">SJC Bán Ra</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            {formatCurrencyVND(sjc.sellPrice)}
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span
              className={`inline-flex items-center font-bold ${
                isSellUp ? 'text-emerald-600' : isSellDown ? 'text-rose-600' : 'text-slate-500'
              }`}
            >
              {isSellUp && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {isSellDown && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {formatDelta(sjc.deltaSell)} tr/lượng
            </span>
            <span className="text-slate-400 ml-2">so với phiên trước</span>
          </div>
        </div>
      </div>

      {/* 3. Chênh lệch Mua - Bán (Spread) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Chênh lệch (Spread)</span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold font-mono text-amber-700 tracking-tight">
            {formatCurrencyVND(sjc.spread)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>Biên độ Mua - Bán SJC</span>
          </div>
        </div>
      </div>

      {/* 4. Trạng thái thị trường */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Trạng thái Thị trường</span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-base font-bold text-slate-900 tracking-tight mt-1">
            <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${trendColor}`}>
              {trendText}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Dữ liệu chuẩn thị trường Việt Nam
          </div>
        </div>
      </div>
    </div>
  );
}
