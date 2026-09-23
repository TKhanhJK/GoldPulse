# GoldPulse — Nền tảng Theo dõi Giá vàng Việt Nam & Tin tức Chính sách

[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-teal?style=flat&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-yellow?style=flat&logo=vitest)](https://vitest.dev/)

> **GoldPulse** là giải pháp website chuyên nghiệp cung cấp dữ liệu giá vàng (SJC, DOJI, PNJ) cập nhật tự động theo thời gian thực, trực quan hóa xu hướng giá mua - bán qua biểu đồ tương tác và tổng hợp tin tức chính sách điều hành từ Ngân hàng Nhà nước & các cơ quan quản lý.

---

## 🌟 Tính năng Cốt lõi (MVP 1.0)

1. **Crawler Engine theo Adapter Pattern & Fault Tolerance**:
   - Thu thập giá vàng tự động từ các thương hiệu đầu ngành: **SJC**, **DOJI**, **PNJ**.
   - Tách rời giao tiếp qua interface `IGoldPriceAdapter`. Dễ dàng mở rộng thêm Bảo Tín Minh Châu, Phú Quý mà không sửa logic lõi.
   - Cơ chế cách ly lỗi song song với `Promise.allSettled`: khi một nguồn gặp sự cố DOM hoặc mạng, crawler vẫn lưu trữ các nguồn khác bình thường và ghi nhật ký kiểm toán vào `CrawlLog`.
2. **Bộ RESTful API Chuẩn Hóa**:
   - `GET /api/prices/latest`: Lấy giá mới nhất, tự động tính biên độ biến động (`deltaBuy`, `deltaSell`) và chênh lệch Mua - Bán (`spread`).
   - `GET /api/prices/history?symbol=SJC_1L&range=7d|30d`: Cung cấp chuỗi thời gian cho biểu đồ.
   - `GET /api/news?page=1&limit=6`: Phân trang danh sách tin tức pháp lý vĩ mô.
   - `GET /api/cron/crawl`: Endpoint bảo mật bằng `CRON_SECRET` phục vụ kích hoạt định kỳ.
3. **Bảng Điều Khiển Tài Chính Cao Cấp**:
   - **Market Ticker**: Dải thông số chạy ngang đỉnh trang hiển thị giá bán và xu hướng tức thời.
   - **Thẻ chỉ số (Stat Cards)**: Giá Mua/Bán SJC, biên độ chênh lệch Spread, trạng thái thị trường.
   - **Biểu đồ biến động giá tương tác (Interactive Recharts)**: Hai đường giá Mua - Bán, hỗ trợ lọc 7 ngày / 30 ngày và chọn nhiều loại vàng khác nhau.
   - **Bảng giá chi tiết**: Phân loại theo thương hiệu, hiển thị biến động xanh/đỏ chuẩn tài chính.
4. **Trung Tâm Tin Tức & Chính Sách**:
   - Dạng lưới thẻ chuyên nghiệp, gắn nhãn cơ quan quản lý (NHNN, Bộ Tài Chính, Chính Phủ...), hỗ trợ phân trang và liên kết bài viết gốc.
5. **Đóng Gói Đám Mây Sẵn Sàng (Cloud Ready)**:
   - Sẵn sàng triển khai lên Vercel kèm cấu hình Vercel Cron trong `vercel.json`.
   - Hỗ trợ container hóa với `Dockerfile` đa tầng (multi-stage build).
   - Cơ sở dữ liệu linh hoạt: SQLite cho local development / kiểm thử và PostgreSQL (Supabase) cho production.

---

## 🏗️ Kiến trúc Dự án (Monorepo)

```
GoldPulse/
├── apps/
│   └── web/                     # Next.js 15 App Router, UI Components, REST API Handlers
│       ├── app/
│       │   ├── api/             # /api/prices/latest, /history, /news, /cron/crawl
│       │   ├── layout.tsx       # Root layout với Brand Header & Footer
│       │   └── page.tsx         # Dashboard trang chủ kết nối 5 tính năng cốt lõi
│       ├── components/          # MarketTicker, StatCards, PriceChart, PriceTable, NewsHub
│       └── lib/                 # api-services.ts, formatters.ts
├── packages/
│   ├── types/                   # Shared DTOs, Entities, Adapter Interfaces
│   ├── database/                # Prisma schema (SQLite / PostgreSQL), Client singleton, Seed script
│   └── crawler/                 # Crawler Service, Adapter Pattern (SJC, DOJI, PNJ)
├── vercel.json                  # Cấu hình Cron Job tự động
├── Dockerfile                   # Multi-stage production container
└── package.json                 # Workspaces configuration
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy Cục bộ

### Yêu cầu môi trường
- Node.js >= 20.x
- npm >= 10.x

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Khởi tạo Cơ sở Dữ liệu & Seed dữ liệu mẫu
```bash
# Đẩy schema vào SQLite database
npm run db:push

# Nạp dữ liệu 30 ngày giá vàng và tin tức chính sách
npm run db:seed
```

### Bước 3: Khởi chạy môi trường Phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Kiểm Thử Tự Động (Testing)

Dự án tuân thủ nghiêm ngặt quy định kiểm thử tự động toàn diện:

```bash
# Chạy toàn bộ test suites trong toàn bộ Monorepo
npm test

# Chạy riêng từng module:
npm run test --workspace=packages/crawler    # Kiểm thử Adapter & Fault-Tolerance
npm run test --workspace=packages/database   # Kiểm thử Prisma DB & Models
npm run test --workspace=apps/web            # Kiểm thử REST APIs & UI Helpers
```

---

## 🐳 Triển Khai Với Docker

```bash
# Xây dựng Docker Image
docker build -t goldpulse:latest .

# Khởi chạy container
docker run -p 3000:3000 -e CRON_SECRET=my_secret_token goldpulse:latest
```

---

## ☁️ Triển Khai Lên Vercel & Supabase

1. **Cơ sở dữ liệu Supabase**:
   - Tạo PostgreSQL project trên Supabase.
   - Lấy URL kết nối Connection Pooler (port 6543) và Direct URL (port 5432).
   - Đổi `provider = "postgresql"` trong `packages/database/prisma/schema.prisma` (hoặc sử dụng `schema.postgresql.prisma`).
2. **Cấu hình Biến Môi Trường trên Vercel**:
   - `DATABASE_URL`: URL PostgreSQL pooler.
   - `DIRECT_URL`: URL PostgreSQL direct.
   - `CRON_SECRET`: Chuỗi khóa bảo mật cron crawler.
3. Vercel sẽ tự động kích hoạt `GET /api/cron/crawl` theo lịch đã định trong `vercel.json`.

---

## 📄 Bản Quyền
Phát triển theo tiêu chuẩn mã nguồn sạch (Clean Architecture) cho dự án portfolio thực tập kỹ thuật GoldPulse MVP 1.0.
