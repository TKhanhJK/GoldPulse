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
  let trendColor = 'text-slate-400 bg-slate-800/60 border-slate-700';

  if (sjc.deltaSell > 0.3) {
    trendText = 'Xu hướng tăng mạnh';
    trendColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
  } else if (sjc.deltaSell > 0) {
    trendText = 'Xu hướng tăng nhẹ';
    trendColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
  } else if (sjc.deltaSell < -0.3) {
    trendText = 'Xu hướng giảm mạnh';
    trendColor = 'text-rose-400 bg-rose-950/40 border-rose-800/50';
  } else if (sjc.deltaSell < 0) {
    trendText = 'Xu hướng giảm nhẹ';
    trendColor = 'text-rose-400 bg-rose-950/40 border-rose-800/50';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. SJC Mua vào */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur relative overflow-hidden group hover:border-gold-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">SJC Mua Vào</span>
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatCurrencyVND(sjc.buyPrice)}
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span
              className={`inline-flex items-center font-semibold ${
                isBuyUp ? 'text-emerald-400' : isBuyDown ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {isBuyUp && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {isBuyDown && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {formatDelta(sjc.deltaBuy)} tr/lượng
            </span>
            <span className="text-slate-500 ml-2">so với phiên trước</span>
          </div>
        </div>
      </div>

      {/* 2. SJC Bán ra */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur relative overflow-hidden group hover:border-gold-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">SJC Bán Ra</span>
          <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatCurrencyVND(sjc.sellPrice)}
          </div>
          <div className="mt-2 flex items-center text-xs">
            <span
              className={`inline-flex items-center font-semibold ${
                isSellUp ? 'text-emerald-400' : isSellDown ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {isSellUp && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {isSellDown && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {formatDelta(sjc.deltaSell)} tr/lượng
            </span>
            <span className="text-slate-500 ml-2">so với phiên trước</span>
          </div>
        </div>
      </div>

      {/* 3. Chênh lệch Mua - Bán (Spread) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur relative overflow-hidden group hover:border-gold-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Chênh lệch (Spread)</span>
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-gold-400 tracking-tight">
            {formatCurrencyVND(sjc.spread)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400">
            <span>Biên độ Mua - Bán SJC</span>
          </div>
        </div>
      </div>

      {/* 4. Trạng thái thị trường */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur relative overflow-hidden group hover:border-gold-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Trạng thái Thị trường</span>
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-lg font-bold text-white tracking-tight mt-1">
            <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${trendColor}`}>
              {trendText}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Dữ liệu SJC chuẩn quốc gia
          </div>
        </div>
      </div>
    </div>
  );
}
