'use client';

import React from 'react';
import { GoldPriceItem } from '@goldpulse/types';
import { formatCurrencyVND, formatDelta } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketTickerProps {
  prices: GoldPriceItem[];
}

export function MarketTicker({ prices }: MarketTickerProps) {
  if (!prices || prices.length === 0) return null;

  // Lặp lại danh sách để hiệu ứng marquee mượt mà liên tục
  const tickerItems = [...prices, ...prices];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-xs py-2 overflow-hidden select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {tickerItems.map((item, index) => {
          const isUp = item.deltaSell > 0;
          const isDown = item.deltaSell < 0;

          return (
            <div
              key={`${item.symbol}-${index}`}
              className="inline-flex items-center space-x-2 mx-5 px-3 py-1 bg-slate-800/60 rounded-full border border-slate-750"
            >
              <span className="font-semibold text-gold-400">{item.name}</span>
              <span className="text-slate-300 font-mono">{formatCurrencyVND(item.sellPrice)}</span>
              <span
                className={`inline-flex items-center text-[11px] font-medium font-mono ${
                  isUp
                    ? 'text-emerald-400'
                    : isDown
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {isUp && <TrendingUp className="w-3 h-3 mr-0.5 inline" />}
                {isDown && <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {!isUp && !isDown && <Minus className="w-3 h-3 mr-0.5 inline" />}
                {formatDelta(item.deltaSell)} tr
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
