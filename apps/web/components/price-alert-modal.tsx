'use client';

import React, { useState, useEffect } from 'react';
import { UserSession, GoldPriceItem } from '@goldpulse/types';
import { 
  Bell, 
  X, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';

interface PriceAlertItemData {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  channel: string;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  logs?: Array<{
    id: string;
    sentPrice: number;
    status: string;
    createdAt: string;
  }>;
}

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onRequestLogin: () => void;
  latestPrices: GoldPriceItem[];
  defaultSymbol?: string;
}

export function PriceAlertModal({
  isOpen,
  onClose,
  user,
  onRequestLogin,
  latestPrices,
  defaultSymbol,
}: PriceAlertModalProps) {
  const [alerts, setAlerts] = useState<PriceAlertItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const initialSymbol = defaultSymbol || (latestPrices[0]?.symbol ?? 'SJC_1L');
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>('');

  // Cập nhật selectedSymbol và targetPrice gợi ý khi modal mở hoặc defaultSymbol thay đổi
  useEffect(() => {
    if (defaultSymbol) {
      setSelectedSymbol(defaultSymbol);
    }
  }, [defaultSymbol]);

  const currentItem = latestPrices.find(p => p.symbol === selectedSymbol) || latestPrices[0];

  useEffect(() => {
    if (currentItem && !targetPrice) {
      // Gợi ý giá làm tròn
      const base = condition === 'ABOVE' ? currentItem.sellPrice + 0.5 : currentItem.buyPrice - 0.5;
      setTargetPrice((Math.round(base * 10) / 10).toString());
    }
  }, [currentItem, condition]);

  // Tải danh sách alerts khi user đã đăng nhập
  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (res.ok && data.success) {
        setAlerts(data.data);
      } else {
        setError(data.error || 'Không thể tải danh sách cảnh báo');
      }
    } catch {
      setError('Lỗi kết nối khi tải danh sách cảnh báo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAlerts();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Xử lý tạo cảnh báo mới
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequestLogin();
      return;
    }

    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Vui lòng nhập mức giá mục tiêu hợp lệ (> 0)');
      return;
    }

    setCreating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          targetPrice: priceNum,
          condition,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo cảnh báo');
      }

      setSuccessMsg('Đã tạo cảnh báo giá thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAlerts();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  // Xử lý xóa cảnh báo
  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlerts(prev => prev.filter(a => a.id !== id));
      } else {
        alert(data.error || 'Không thể xóa cảnh báo');
      }
    } catch {
      alert('Lỗi kết nối khi xóa cảnh báo');
    }
  };

  // Xử lý bật/tắt cảnh báo
  const handleToggleAlert = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !currentActive } : a));
      }
    } catch {
      console.error('Không thể cập nhật trạng thái alert');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Cảnh Báo Biến Động Giá Vàng</h3>
              <p className="text-xs text-slate-500">Nhận email tức thời khi giá chạm ngưỡng bạn quan tâm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!user ? (
            /* Chưa đăng nhập */
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto">
                <h4 className="font-semibold text-slate-900 text-base">Đăng nhập để nhận cảnh báo</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Đăng nhập hoặc đăng ký tài khoản GoldPulse để thiết lập ngưỡng cảnh báo giá tự động gửi tới email của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); onRequestLogin(); }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                Đăng nhập / Đăng ký ngay
              </button>
            </div>
          ) : (
            <>
              {/* Form thiết lập cảnh báo mới */}
              <form onSubmit={handleCreateAlert} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 border-b border-slate-200/80 pb-2">
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>Tạo cảnh báo mới</span>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Chọn mã vàng */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Sản phẩm
                    </label>
                    <select
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                    >
                      {latestPrices.map(p => (
                        <option key={p.symbol} value={p.symbol}>
                          {p.name} ({p.source})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chọn điều kiện */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Điều kiện kích hoạt
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="ABOVE">Vượt trên hoặc bằng (≥)</option>
                      <option value="BELOW">Rơi xuống hoặc bằng (≤)</option>
                    </select>
                  </div>

                  {/* Nhập mức giá mục tiêu */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Mức giá (triệu VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        required
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        placeholder="VD: 85.50"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-slate-400 font-medium">tr/lượng</span>
                    </div>
                  </div>
                </div>

                {/* Tham chiếu giá hiện tại */}
                {currentItem && (
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>Giá hiện tại của <strong>{currentItem.name}</strong>:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        Mua {currentItem.buyPrice.toFixed(2)} - Bán {currentItem.sellPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => setTargetPrice((Math.round((currentItem.sellPrice + 0.5) * 10) / 10).toString())}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                      >
                        +0.5tr
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetPrice((Math.round((currentItem.sellPrice + 1.0) * 10) / 10).toString())}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                      >
                        +1.0tr
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetPrice((Math.round((currentItem.buyPrice - 0.5) * 10) / 10).toString())}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px]"
                      >
                        -0.5tr
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                    <span>Kích hoạt Cảnh Báo</span>
                  </button>
                </div>
              </form>

              {/* Danh sách các cảnh báo hiện tại */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Cảnh báo của bạn ({alerts.length})
                  </h4>
                  <span className="text-xs text-slate-500">Gửi tới: {user.email}</span>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Đang tải danh sách cảnh báo...</span>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs">
                    Bạn chưa có cảnh báo giá nào. Hãy tạo một cảnh báo ở form phía trên.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map(item => {
                      const matchedCurrent = latestPrices.find(p => p.symbol === item.symbol);
                      const isAbove = item.condition === 'ABOVE';

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                            item.isActive 
                              ? 'bg-white border-slate-200 shadow-sm' 
                              : 'bg-slate-50/60 border-slate-100 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isAbove ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {isAbove ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 text-sm">
                                  {matchedCurrent?.name || item.symbol}
                                </span>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  isAbove 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {isAbove ? '≥' : '≤'} {item.targetPrice.toFixed(2)} tr
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                {matchedCurrent && (
                                  <span>Hiện tại: <strong className="font-mono text-slate-700">{matchedCurrent.sellPrice.toFixed(2)} tr</strong></span>
                                )}
                                {item.lastTriggeredAt && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    Lần gửi gần nhất: {new Date(item.lastTriggeredAt).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle Active */}
                            <button
                              type="button"
                              onClick={() => handleToggleAlert(item.id, item.isActive)}
                              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                                item.isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {item.isActive ? 'Đang bật' : 'Tạm tắt'}
                            </button>

                            {/* Nút xóa */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAlert(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa cảnh báo này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống tự động kiểm tra mỗi 15 phút hoặc khi có đợt cập nhật giá mới.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

