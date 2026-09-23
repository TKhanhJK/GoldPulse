import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Coins } from 'lucide-react';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-jetbrains',
});

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
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    GoldPulse
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Fintech UI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  Giá Vàng Việt Nam & Tin Tức Chính Sách
                </p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
              <a href="#stats" className="hover:text-amber-600 transition-colors">Tổng Quan</a>
              <a href="#chart" className="hover:text-amber-600 transition-colors">Biểu Đồ</a>
              <a href="#forecast" className="hover:text-purple-600 text-purple-700 font-bold flex items-center transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-1.5 animate-pulse"></span>
                Dự Báo AI
              </a>
              <a href="#table" className="hover:text-amber-600 transition-colors">Bảng Giá</a>
              <a href="#news" className="hover:text-amber-600 transition-colors">Chính Sách</a>
            </nav>

            {/* Quick Status / Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                Dữ Liệu Trực Tuyến
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-700">GoldPulse</span>
              <span>— Nền tảng Theo dõi Giá vàng & Tin tức Chính sách Việt Nam</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <span>Inter + JetBrains Mono</span>
              <span>•</span>
              <span>Tabular Figures</span>
              <span>•</span>
              <span>Fintech Typography</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
