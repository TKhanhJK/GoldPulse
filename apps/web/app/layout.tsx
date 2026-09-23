import type { Metadata } from 'next';
import './globals.css';
import { Coins, Sparkles, Github, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GoldPulse — Nền tảng Theo dõi Giá vàng & Tin tức Chính sách Việt Nam',
  description: 'Cập nhật trực tiếp giá vàng SJC, DOJI, PNJ, biểu đồ biến động chuỗi thời gian và trung tâm tin tức chính sách điều hành từ Ngân hàng Nhà nước.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-gold-500 selection:text-slate-950">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 flex items-center justify-center shadow-lg shadow-gold-500/20 text-slate-950 font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-gold-400 bg-clip-text text-transparent">
                    GoldPulse
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/30">
                    MVP 1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Giá Vàng Việt Nam & Tin Tức Chính Sách
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
              <a href="#stats" className="hover:text-gold-400 transition-colors">Tổng Quan</a>
              <a href="#chart" className="hover:text-gold-400 transition-colors">Biểu Đồ</a>
              <a href="#table" className="hover:text-gold-400 transition-colors">Bảng Giá</a>
              <a href="#news" className="hover:text-gold-400 transition-colors">Chính Sách</a>
            </nav>

            {/* Quick Status / Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:inline-flex items-center text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                Hệ Thống Trực Tuyến
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/80 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-gold-500" />
              <span className="font-semibold text-slate-400">GoldPulse</span>
              <span>— Nền tảng Portfolio Kỹ thuật Clean Architecture</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Next.js 15 App Router</span>
              <span>•</span>
              <span>Prisma ORM</span>
              <span>•</span>
              <span>Adapter Pattern</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
