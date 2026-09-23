'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem, NewsPaginationResponse } from '@goldpulse/types';
import { formatDateVN } from '@/lib/formatters';
import { Newspaper, ExternalLink, ChevronLeft, ChevronRight, Bookmark, Building2 } from 'lucide-react';

interface NewsHubProps {
  initialNews?: NewsPaginationResponse;
}

export function NewsHub({ initialNews }: NewsHubProps) {
  const [newsData, setNewsData] = useState<NewsPaginationResponse | undefined>(initialNews);
  const [currentPage, setCurrentPage] = useState<number>(initialNews?.pagination.page || 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      setLoading(true);
      try {
        const res = await fetch(`/api/news?page=${currentPage}&limit=6`);
        const json = await res.json();
        if (isMounted && json.success) {
          setNewsData(json);
        }
      } catch (err) {
        console.error('Lỗi khi tải tin tức chính sách:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Nếu không phải trang ban đầu đã có sẵn dữ liệu thì mới fetch
    if (currentPage !== initialNews?.pagination.page || !newsData) {
      fetchNews();
    }

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const items = newsData?.data || [];
  const pagination = newsData?.pagination || { page: 1, limit: 6, totalItems: 0, totalPages: 1 };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-lg backdrop-blur mb-12">
      {/* News Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center">
            <Newspaper className="w-5 h-5 text-gold-500 mr-2.5" />
            Trung Tâm Tin Tức & Chính Sách Thị Trường
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tổng hợp nghị định, văn bản chỉ đạo điều hành vĩ mô và động thái từ Ngân hàng Nhà nước
          </p>
        </div>

        {/* Badge Tổng quan */}
        <div className="inline-flex items-center text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <Bookmark className="w-3.5 h-3.5 text-gold-400 mr-1.5" />
          <span>Tổng số: <strong className="text-white font-mono">{pagination.totalItems || items.length}</strong> bài viết</span>
        </div>
      </div>

      {/* Grid bài viết */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {items.map((news) => (
          <article
            key={news.id}
            className="flex flex-col justify-between bg-slate-850/70 border border-slate-800 rounded-xl p-5 hover:border-gold-500/40 hover:bg-slate-800/60 transition-all duration-200 group"
          >
            <div>
              {/* Source & Date Badge */}
              <div className="flex items-center justify-between text-[11px] mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  <Building2 className="w-3 h-3 mr-1" />
                  {news.source}
                </span>
                <span className="text-slate-500">
                  {formatDateVN(news.publishedAt)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-gold-400 transition-colors">
                {news.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                {news.summary}
              </p>
            </div>

            {/* Read More Link */}
            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              >
                Đọc bài viết gốc
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
              <span className="text-[11px] text-slate-500 font-mono">Bản tin pháp lý</span>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 mt-8 pt-6 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trang trước
          </button>

          <span className="text-slate-400 font-medium">
            Trang <strong className="text-white font-mono">{currentPage}</strong> / <span className="font-mono">{pagination.totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage >= pagination.totalPages || loading}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Trang sau
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
