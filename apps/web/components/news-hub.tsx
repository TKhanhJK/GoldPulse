'use client';

import React, { useState, useEffect } from 'react';
import { NewsPaginationResponse } from '@goldpulse/types';
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

    if (currentPage !== initialNews?.pagination.page || !newsData) {
      fetchNews();
    }

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const items = newsData?.data || [];
  const pagination = newsData?.pagination || {
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 1,
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs mb-12">
      {/* News Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
            <Newspaper className="w-5 h-5 text-amber-500 mr-2.5" />
            Trung Tâm Tin Tức & Chính Sách Thị Trường
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp nghị định, văn bản chỉ đạo điều hành vĩ mô và động thái từ Ngân hàng Nhà nước
          </p>
        </div>

        {/* Badge Tổng quan */}
        <div className="inline-flex items-center text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Bookmark className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
          <span>Tổng số: <strong className="text-slate-900 font-mono">{pagination.totalItems || items.length}</strong> bài viết</span>
        </div>
      </div>

      {/* Grid bài viết */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {items.map((news) => (
          <article
            key={news.id}
            className="flex flex-col justify-between bg-slate-50/70 border border-slate-200 rounded-2xl p-5 hover:bg-white hover:border-amber-400 hover:shadow-md transition-all duration-200 group"
          >
            <div>
              {/* Source & Date Badge */}
              <div className="flex items-center justify-between text-[11px] mb-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Building2 className="w-3 h-3 mr-1" />
                  {news.source}
                </span>
                <span className="text-slate-400">
                  {formatDateVN(news.publishedAt)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                {news.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                {news.summary}
              </p>
            </div>

            {/* Read More Link */}
            <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
              >
                Đọc bài viết gốc
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
              <span className="text-[11px] text-slate-400 font-mono">Bản tin pháp lý</span>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-3 mt-8 pt-6 border-t border-slate-100 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || loading}
            className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trang trước
          </button>

          <span className="text-slate-600 font-medium">
            Trang <strong className="text-slate-900 font-mono">{currentPage}</strong> / <span className="font-mono">{pagination.totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage >= pagination.totalPages || loading}
            className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-all"
          >
            Trang sau
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
