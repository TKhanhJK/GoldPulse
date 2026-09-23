'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserSession, AdminSystemStats, AdminUserItem, AdminAlertItem, CrawlLogItem } from '@goldpulse/types';
import { 
  Shield, 
  ShieldAlert, 
  Users, 
  Bell, 
  Activity, 
  Mail, 
  Database, 
  ArrowLeft, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2,
  FileText,
  TrendingUp,
  LogIn,
  LogOut
} from 'lucide-react';
import { AuthModal } from '@/components/auth-modal';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [crawls, setCrawls] = useState<CrawlLogItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);

  // Operational states
  const [activeTab, setActiveTab] = useState<'crawls' | 'alerts' | 'users'>('crawls');
  const [crawlerRunning, setCrawlerRunning] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Kiểm tra phiên đăng nhập
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  // 2. Tải dữ liệu trang quản trị
  const loadAdminData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, crawlsRes, usersRes, alertsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/crawls'),
        fetch('/api/admin/users'),
        fetch('/api/admin/alerts'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
      }
      if (crawlsRes.ok) {
        const crawlsData = await crawlsRes.json();
        if (crawlsData.success) setCrawls(crawlsData.data);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success) setUsers(usersData.data);
      }
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success) setAlerts(alertsData.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuth().then((currentUser) => {
      if (currentUser?.role === 'ADMIN') {
        loadAdminData();
      }
    });
  }, []);

  // 3. Kích hoạt crawler thủ công
  const handleTriggerCrawl = async (type: 'prices' | 'news') => {
    setCrawlerRunning(type);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/crawls/trigger?type=${type}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        const count = data.result?.totalSaved ?? 0;
        const targetName = type === 'prices' ? 'giá vàng' : 'tin tức';
        setActionMessage({
          type: 'success',
          text: `Đã thu thập thành công ${count} mục ${targetName}!`,
        });
        loadAdminData();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'Thu thập thất bại. Vui lòng thử lại.',
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Lỗi kết nối khi kích hoạt crawler.',
      });
    } finally {
      setCrawlerRunning(null);
    }
  };

  // 4. Kích hoạt quét cảnh báo giá toàn hệ thống
  const handleTriggerAlertCheck = async () => {
    setCrawlerRunning('check_alerts');
    setActionMessage(null);
    try {
      const res = await fetch('/api/alerts/check', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        const { totalChecked, totalTriggered } = data.result;
        setActionMessage({
          type: 'success',
          text: `Đã quét ${totalChecked} quy tắc cảnh báo. Kích hoạt gửi ${totalTriggered} email thành công!`,
        });
        loadAdminData();
      } else {
        setActionMessage({
          type: 'error',
          text: data.error || 'Quét cảnh báo thất bại.',
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Lỗi kết nối khi quét cảnh báo.',
      });
    } finally {
      setCrawlerRunning(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  // Màn hình tải phiên
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span>Đang xác thực thông tin Quản trị viên...</span>
        </div>
      </div>
    );
  }

  // Màn hình từ chối truy cập (Chưa đăng nhập hoặc không phải ADMIN)
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Khu Vực Quản Trị Hệ Thống
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Trang này yêu cầu tài khoản có vai trò <strong>ADMIN</strong> để truy cập và điều khiển các dịch vụ crawler, cảnh báo giá và cơ sở dữ liệu.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Đăng nhập Quản trị viên (admin@goldpulse.vn)</span>
            </button>
            <Link
              href="/"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Trang Chủ GoldPulse</span>
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode="login"
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            if (u.role === 'ADMIN') loadAdminData();
          }}
        />
      </div>
    );
  }

  // Giao diện chính của Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Header Quản Trị */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  Gold<span className="text-amber-400">Pulse</span> Admin
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Control Center
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Giám sát vận hành & Điều khiển tự động</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Xem Dashboard Người Dùng</span>
            </Link>

            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">{user.name || 'Admin'}</span>
                <span className="text-[10px] text-slate-400 font-mono">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Toast / Notification Banner */}
        {actionMessage && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-150 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2.5">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{actionMessage.text}</span>
            </div>
            <button 
              onClick={() => setActionMessage(null)}
              className="text-xs font-bold px-2 py-1 rounded hover:bg-black/5"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Section 1: KPI Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Người Dùng Hệ Thống</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-black text-slate-900">
              {stats?.totalUsers ?? '...'}
            </div>
            <p className="text-xs text-slate-400 mt-1">Đã đăng ký tài khoản GoldPulse</p>
          </div>

          {/* Card 2: Price Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Quy Tắc Cảnh Báo Giá</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-black text-slate-900">
              {stats?.activeAlerts ?? '...'}
              <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">
                / {stats?.totalAlerts ?? '...'} tổng số
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Đang kích hoạt theo dõi 24/7</p>
          </div>

          {/* Card 3: Crawls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Phiên Thu Thập (Crawl)</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-black text-slate-900">
              {stats?.totalCrawls ?? '...'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Thành công: <strong className="text-emerald-600 font-mono">{stats?.successfulCrawls ?? 0}</strong> lượt
            </p>
          </div>

          {/* Card 4: Dispatched Emails */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Email Cảnh Báo Đã Gửi</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Mail className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-black text-slate-900">
              {stats?.totalAlertLogs ?? '...'}
            </div>
            <p className="text-xs text-slate-400 mt-1">Thông báo biến động thị trường</p>
          </div>
        </section>

        {/* Section 2: Crawler Operations Center (Action Bar) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Trung Tâm Điều Khiển Crawler Thủ Công</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kích hoạt ngay lập tức tiến trình cào dữ liệu hoặc kiểm tra quy tắc cảnh báo mà không cần chờ cronjob
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
            {/* Action 1: Crawl Prices */}
            <button
              onClick={() => handleTriggerCrawl('prices')}
              disabled={crawlerRunning !== null}
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 active:scale-[0.99] text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Giá Vàng Thị Trường</span>
                {crawlerRunning === 'prices' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm">Thu Thập Giá Vàng Ngay</div>
              <p className="text-[11px] text-slate-500 mt-1">Crawl giá từ SJC, DOJI, PNJ & tự động kích hoạt cảnh báo</p>
            </button>

            {/* Action 2: Crawl News */}
            <button
              onClick={() => handleTriggerCrawl('news')}
              disabled={crawlerRunning !== null}
              className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 active:scale-[0.99] text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Tin Tức & Chính Sách</span>
                {crawlerRunning === 'news' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm">Thu Thập Tin Tức Ngay</div>
              <p className="text-[11px] text-slate-500 mt-1">Crawl văn bản pháp lý từ Ngân hàng Nhà nước & CafeF</p>
            </button>

            {/* Action 3: Trigger Price Alert Check */}
            <button
              onClick={handleTriggerAlertCheck}
              disabled={crawlerRunning !== null}
              className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 active:scale-[0.99] text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">Động Cơ Cảnh Báo</span>
                {crawlerRunning === 'check_alerts' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                ) : (
                  <Bell className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm">Quét Ngưỡng Cảnh Báo</div>
              <p className="text-[11px] text-slate-500 mt-1">So khớp ngưỡng giá của mọi người dùng và gửi email nếu chạm</p>
            </button>
          </div>
        </section>

        {/* Section 3: Data Explorer Tabs */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Tabs bar */}
          <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50/50 gap-2">
            <button
              onClick={() => setActiveTab('crawls')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'crawls'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Nhật Ký Crawl ({crawls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Quy Tắc Cảnh Báo ({alerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Người Dùng Hệ Thống ({users.length})</span>
            </button>
          </div>

          {/* Tab 1: Crawl Logs Table */}
          {activeTab === 'crawls' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Trạng Thái</th>
                    <th className="py-3 px-4">Nguồn Dữ Liệu</th>
                    <th className="py-3 px-4 text-right">Số Bản Ghi</th>
                    <th className="py-3 px-4">Chi Tiết Lỗi</th>
                    <th className="py-3 px-6 text-right">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {crawls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        Chưa có nhật ký crawl nào
                      </td>
                    </tr>
                  ) : (
                    crawls.map((log) => {
                      const isSuccess = log.status === 'SUCCESS';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-6 font-sans">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isSuccess 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {isSuccess ? 'SUCCESS' : 'FAILED'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {log.source}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {log.itemsCount} mục
                          </td>
                          <td className="py-3 px-4 font-sans text-slate-500 max-w-xs truncate">
                            {log.error || '—'}
                          </td>
                          <td className="py-3 px-6 text-right font-sans text-slate-500 text-[11px]">
                            {new Date(log.createdAt || '').toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Alerts Table */}
          {activeTab === 'alerts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Người Dùng</th>
                    <th className="py-3 px-4">Sản Phẩm</th>
                    <th className="py-3 px-4">Điều Kiện</th>
                    <th className="py-3 px-4 text-right">Giá Ngưỡng</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-6 text-right">Lần Gửi Gần Nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {alerts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        Chưa có quy tắc cảnh báo nào được tạo
                      </td>
                    </tr>
                  ) : (
                    alerts.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-6 font-sans">
                          <div className="font-semibold text-slate-800">{item.userEmail}</div>
                          {item.userName && <div className="text-[11px] text-slate-400">{item.userName}</div>}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.symbol}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.condition === 'ABOVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {item.condition === 'ABOVE' ? '≥ Vượt trên' : '≤ Rơi dưới'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {item.targetPrice.toFixed(2)} tr
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {item.isActive ? 'Đang bật' : 'Tạm tắt'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right font-sans text-slate-500 text-[11px]">
                          {item.lastTriggeredAt 
                            ? new Date(item.lastTriggeredAt).toLocaleString('vi-VN') 
                            : 'Chưa kích hoạt'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Users Table */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Họ Và Tên</th>
                    <th className="py-3 px-4">Địa Chỉ Email</th>
                    <th className="py-3 px-4">Vai Trò (Role)</th>
                    <th className="py-3 px-4 text-right">Số Cảnh Báo</th>
                    <th className="py-3 px-6 text-right">Ngày Tham Gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        Chưa có người dùng nào
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-6 font-sans font-semibold text-slate-900">
                          {u.name || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{u.email}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {u.alertsCount}
                        </td>
                        <td className="py-3 px-6 text-right font-sans text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
