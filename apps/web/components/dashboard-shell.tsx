'use client';

import React, { useState, useEffect } from 'react';
import { GoldPriceItem, NewsPaginationResponse, UserSession } from '@goldpulse/types';
import { MarketTicker } from './market-ticker';
import { StatCards } from './stat-cards';
import { PriceChart } from './price-chart';
import { AiForecastPanel } from './ai-forecast-panel';
import { PriceTable } from './price-table';
import { NewsHub } from './news-hub';
import { AuthModal } from './auth-modal';
import { PriceAlertModal } from './price-alert-modal';
import { formatDateVN } from '@/lib/formatters';
import { Sparkles, RefreshCw, Bell, User as UserIcon, LogOut, LogIn } from 'lucide-react';

interface DashboardShellProps {
  prices: GoldPriceItem[];
  initialNews: NewsPaginationResponse;
  updatedAt: string;
}

export function DashboardShell({ prices, initialNews, updatedAt }: DashboardShellProps) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedAlertSymbol, setSelectedAlertSymbol] = useState<string>('SJC_1L');

  // Lấy thông tin user hiện tại nếu có cookie
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Guest mode
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    }
  };

  const handleOpenAlertForSymbol = (symbol: string) => {
    setSelectedAlertSymbol(symbol);
    setAlertModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. Market Ticker Bar trên đỉnh */}
      <MarketTicker prices={prices} />

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-lg shadow-sm">
              GP
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                Gold<span className="text-amber-600">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Fintech Intelligence
              </span>
            </div>
          </div>

          {/* Quick Actions & Auth */}
          <div className="flex items-center gap-3">
            {/* Nút Cảnh báo giá */}
            <button
              type="button"
              onClick={() => setAlertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-all shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>Cảnh báo giá</span>
            </button>

            {/* Trạng thái tài khoản người dùng */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user.email}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-2xs">
                  {(user.name?.[0] || user.email[0]).toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đăng ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
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
                Hệ thống tự động tổng hợp giá vàng miếng SJC, DOJI, PNJ, tính toán mức chênh lệch Mua - Bán (Spread), dự báo xu hướng AI và cảnh báo giá qua Email tức thời.
              </p>
            </div>

            <div className="flex items-center self-start md:self-auto bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs shadow-xs">
              <RefreshCw className="w-4 h-4 text-amber-600 mr-2.5 animate-spin-slow" />
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Phiên cập nhật gần nhất</span>
                <span className="text-slate-900 font-mono font-bold">
                  {formatDateVN(updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Thẻ Thống Kê Tổng Quan (Stat Cards) */}
        <section id="stats">
          <StatCards prices={prices} />
        </section>

        {/* 4. Biểu Đồ Tương Tác Chuỗi Thời Gian (Price Chart) */}
        <section id="chart">
          <PriceChart initialSymbol="SJC_1L" initialRange="7d" />
        </section>

        {/* 5. Mô Hình Dự Báo AI & Chỉ Báo Kỹ Thuật (Machine Learning Forecast) */}
        <section id="forecast">
          <AiForecastPanel />
        </section>

        {/* 6. Bảng Giá Thị Trường Chi Tiết (Price Table) */}
        <section id="table">
          <PriceTable 
            prices={prices} 
            onOpenAlert={handleOpenAlertForSymbol}
          />
        </section>

        {/* 7. Trung Tâm Tin Tức & Chính Sách Vàng (News Hub) */}
        <section id="news">
          <NewsHub initialNews={initialNews} />
        </section>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />

      <PriceAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        user={user}
        onRequestLogin={() => { setAuthMode('login'); setAuthModalOpen(true); }}
        latestPrices={prices}
        defaultSymbol={selectedAlertSymbol}
      />
    </div>
  );
}
