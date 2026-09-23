# TÀI LIỆU PHƯƠNG ÁN KỸ THUẬT: GOLDPULSE (MVP 1.0)

> **Dự án**: GoldPulse — Nền tảng theo dõi giá vàng Việt Nam & Tin tức chính sách  
> **Phiên bản**: 1.0  
> **Ngày lập**: 2026-09-23  
> **Mục tiêu**: Chuẩn hóa kiến trúc hệ thống, công nghệ, thiết kế dữ liệu, kiểm thử và quy trình vận hành.

---

## 1. Tổng quan Kiến trúc Hệ thống

### 1.1. Mô hình Kiến trúc: Monorepo Tinh gọn (npm workspaces)
GoldPulse được xây dựng theo mô hình **Monorepo** phân tầng rõ ràng, đảm bảo nguyên tắc phân tách trách nhiệm (Separation of Concerns) và tính độc lập của các thành phần nhưng vẫn tối ưu hóa khả năng chia sẻ mã nguồn và triển khai thuận tiện trên môi trường đám mây (Cloud Deployable).

```
┌────────────────────────────────────────────────────────────────────────┐
│                              GOLDPULSE MONOREPO                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ apps/web (Next.js 15 Fullstack)                                │   │
│   │  ├── UI/Presentation: React Server/Client Components, Recharts  │   │
│   │  └── RESTful APIs: /api/prices/latest, /history, /news, /cron   │   │
│   └───────────────────▲────────────────────────▲───────────────────┘   │
│                       │                        │                       │
│                       │ Import                 │ Import                │
│   ┌───────────────────┴──────────┐   ┌─────────┴───────────────────┐   │
│   │ packages/crawler             │   │ packages/database           │   │
│   │  ├── Adapter Pattern         │   │  ├── Prisma Schema          │   │
│   │  │   (SJC, DOJI, PNJ)        │   │  ├── Migrations             │   │
│   │  └── Crawler Service         │   │  └── Seed Data              │   │
│   └───────────────────▲──────────┘   └─────────▲───────────────────┘   │
│                       │                        │                       │
│                       └───────────┬────────────┘                       │
│                                   │ Import                             │
│                       ┌───────────┴────────────┐                       │
│                       │ packages/types         │                       │
│                       │  (Shared Interfaces)   │                       │
│                       └────────────────────────┘                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Phân chia Module & Trách nhiệm

| Phân vùng | Tên Package / App | Công nghệ chủ đạo | Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| **Apps** | `apps/web` | Next.js 15 (App Router), Tailwind CSS, Recharts, Lucide React | Cung cấp giao diện Dashboard, biểu đồ tương tác, hiển thị tin tức và các Route Handlers cung cấp REST API cho client. |
| **Packages** | `packages/crawler` | TypeScript, Axios, Cheerio, Vitest | Module cào dữ liệu độc lập tuân thủ Adapter Pattern; bóc tách HTML/JSON giá vàng từ SJC, DOJI, PNJ với cơ chế chịu lỗi cao. |
| **Packages** | `packages/database` | Prisma ORM, PostgreSQL (Supabase) | Định nghĩa schema, quản lý migration cơ sở dữ liệu, seed dữ liệu mẫu cho chính sách ban đầu, cung cấp database client singleton. |
| **Packages** | `packages/types` | TypeScript thuần | Chứa toàn bộ Data Transfer Objects (DTOs), Entities, Interfaces chung để đảm bảo tính nhất quán kiểu dữ liệu 100%. |

---

## 2. Lựa chọn Công nghệ & Lý do Lựa chọn (Tech Stack)

### 2.1. Frontend & Presentation
- **Next.js 15 (App Router)**: Tận dụng React Server Components để render nhanh dữ liệu tĩnh (SEO tốt cho mục tin tức chính sách), kết hợp Client Components cho biểu đồ tương tác.
- **Tailwind CSS & Thiết kế phong cách Slate/Amber**: Bảng màu tài chính cao cấp (Nền Slate `#0F172A`, điểm nhấn Gold `#F59E0B`), đáp ứng thiết kế Responsive (Mobile-first).
- **Recharts**: Thư viện biểu đồ tương thích mượt mà với React, hỗ trợ trực quan hóa 2 đường giá Mua - Bán, Tooltip tùy biến và ResponsiveContainer tự co giãn.

### 2.2. Backend & REST API
- **Next.js Route Handlers (`apps/web/app/api`)**: Đóng gói API serverless ngay trong cùng hệ sinh thái web, tiết kiệm tài nguyên máy chủ, dễ dàng deploy lên Vercel mà không cần duy trì VM chạy 24/7.
- **Xác thực bảo vệ Cron**: Sử dụng header `Authorization: Bearer <CRON_SECRET>` để bảo vệ endpoint kích hoạt crawl `/api/cron/crawl`.

### 2.3. Crawler Engine & Adapter Pattern
- **Axios + Cheerio**: Tối ưu tốc độ tải và bóc tách dữ liệu DOM (chỉ mất ~200-500ms mỗi nguồn), không cần chạy headless browser cồng kềnh (tránh ngốn RAM và timeout trên serverless).
- **Kiến trúc Adapter**: Đảm bảo nguyên tắc Open/Closed Principle (SOLID) — dễ dàng thêm nguồn mới (Bảo Tín Minh Châu, Phú Quý...) mà không can thiệp logic điều phối.

### 2.4. Cơ sở Dữ liệu & ORM
- **PostgreSQL trên Supabase**: Cơ sở dữ liệu quan hệ mạnh mẽ, hỗ trợ lưu trữ chuỗi thời gian (time-series) cho lịch sử giá vàng.
- **Prisma ORM**: Đảm bảo Type-safety tuyệt đối, hỗ trợ quan hệ dữ liệu rõ ràng, quản lý migration minh bạch và script seed dữ liệu chuẩn mực.
  - Sử dụng chế độ **Connection Pooling (port 6543)** cho runtime Next.js serverless.
  - Sử dụng chế độ **Direct Connection (port 5432)** cho Prisma CLI khi chạy migration.

### 2.5. Kiểm thử (Testing) & Đảm bảo Chất lượng
- **Vitest**: Khung kiểm thử nhanh, tương thích tốt với TypeScript ESM.
- Kiểm thử bao phủ:
  - **Unit test**: Kiểm tra từng Adapter bóc tách dữ liệu với HTML fixture giả lập.
  - **Fault tolerance test**: Kiểm tra Crawler Service không bị sập khi một hoặc nhiều nguồn gặp sự cố mạng/DOM.
  - **Integration test**: Kiểm tra logic tính toán Delta biến động giá và format dữ liệu API.

---

## 3. Thiết kế Cơ sở Dữ liệu (Prisma Schema)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Dữ liệu Giá vàng theo từng thời điểm
model GoldPrice {
  id          String   @id @default(uuid())
  symbol      String   // Mã định danh loại vàng (ví dụ: SJC_1L, DOJI_HN, PNJ_24K)
  name        String   // Tên hiển thị (ví dụ: "Vàng miếng SJC 1L - 10L")
  buyPrice    Float    // Giá mua vào (VNĐ hoặc triệu VNĐ/lượng)
  sellPrice   Float    // Giá bán ra (VNĐ hoặc triệu VNĐ/lượng)
  source      String   // Nguồn dữ liệu (SJC, DOJI, PNJ)
  createdAt   DateTime @default(now())

  @@index([symbol, createdAt(sort: Desc)])
  @@index([createdAt(sort: Desc)])
}

// 2. Trung tâm Tin tức & Chính sách Vàng
model News {
  id          String   @id @default(uuid())
  title       String   // Tiêu đề tin tức
  summary     String   // Tóm tắt nội dung chính sách
  source      String   // Cơ quan ban hành / Nguồn báo (NHNN, Báo Đầu Tư...)
  url         String   // Liên kết bài viết gốc
  publishedAt DateTime // Ngày công bố chính sách
  createdAt   DateTime @default(now())

  @@index([publishedAt(sort: Desc)])
}

// 3. Nhật ký Vận hành Crawler (Audit & Monitoring)
model CrawlLog {
  id          String   @id @default(uuid())
  source      String   // Nguồn crawl (SJC, DOJI, PNJ hoặc ALL)
  status      String   // SUCCESS | PARTIAL | FAILED
  itemsCount  Int      @default(0)
  error       String?  // Ghi log chi tiết lỗi nếu có
  createdAt   DateTime @default(now())
}
```

---

## 4. Thiết kế Chi tiết Crawler Engine (Adapter Pattern)

### 4.1. Chuẩn Giao tiếp `IGoldPriceAdapter`

```typescript
export interface ScrapedGoldPrice {
  symbol: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  source: string;
}

export interface IGoldPriceAdapter {
  readonly source: string;
  fetchPrices(): Promise<ScrapedGoldPrice[]>;
}
```

### 4.2. Cơ chế Điều phối & Chịu lỗi (Fault Tolerance)

```
             ┌─────────────────────────┐
             │     CrawlerService      │
             └────────────┬────────────┘
                          │ Promise.allSettled
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  SjcAdapter  │   │ DojiAdapter  │   │  PnjAdapter  │
└──────────────┘   └──────────────┘   └──────────────┘
```

1. **Khởi tạo danh sách Adapter**: Đăng ký các adapter vào CrawlerService.
2. **Thực thi song song**: Sử dụng `Promise.allSettled` để kích hoạt đồng thời tất cả các adapter.
3. **Bọc cách ly lỗi**: Nếu một bên (ví dụ PNJ) bị đổi cấu trúc DOM hoặc lỗi mạng, adapter đó trả về rejection nhưng được ghi log an toàn vào `CrawlLog`; các nguồn còn lại (SJC, DOJI) vẫn được lưu trữ bình thường vào cơ sở dữ liệu.
4. **Chuẩn hóa giá**: Tất cả giá trị số (buyPrice, sellPrice) đều được chuẩn hóa về cùng đơn vị (đồng/lượng hoặc triệu đồng/lượng) trước khi lưu trữ.

---

## 5. Thiết kế Bộ RESTful API

### 5.1. `GET /api/prices/latest`
- **Mục đích**: Trả về danh sách giá hiện tại mới nhất của tất cả các mã vàng.
- **Xử lý nghiệp vụ**:
  - Truy vấn bản ghi mới nhất của từng `symbol`.
  - So sánh với bản ghi liền kề trước đó của chính symbol đó để tính toán:
    - `deltaBuy = currentBuyPrice - previousBuyPrice`
    - `deltaSell = currentSellPrice - previousSellPrice`
    - `spread = currentSellPrice - currentBuyPrice`
- **Định dạng phản hồi**:
  ```json
  {
    "success": true,
    "updatedAt": "2026-09-23T14:30:00.000Z",
    "data": [
      {
        "symbol": "SJC_1L",
        "name": "Vàng miếng SJC 1L - 10L",
        "source": "SJC",
        "buyPrice": 88.5,
        "sellPrice": 90.5,
        "deltaBuy": 0.5,
        "deltaSell": 0.5,
        "spread": 2.0,
        "updatedAt": "2026-09-23T14:30:00.000Z"
      }
    ]
  }
  ```

### 5.2. `GET /api/prices/history`
- **Tham số**:
  - `symbol` (Bắt buộc, ví dụ: `SJC_1L`)
  - `range` (Tùy chọn: `7d` | `30d`, mặc định là `7d`)
- **Mục đích**: Cung cấp chuỗi thời gian cho Recharts vẽ biểu đồ giá Mua và Bán.
- **Định dạng phản hồi**:
  ```json
  {
    "success": true,
    "symbol": "SJC_1L",
    "range": "7d",
    "data": [
      { "timestamp": "2026-09-17T00:00:00.000Z", "buyPrice": 87.0, "sellPrice": 89.0 },
      { "timestamp": "2026-09-18T00:00:00.000Z", "buyPrice": 87.5, "sellPrice": 89.5 }
    ]
  }
  ```

### 5.3. `GET /api/news`
- **Tham số**: `page` (mặc định: 1), `limit` (mặc định: 6).
- **Mục đích**: Trả về danh sách tin tức chính sách kèm metadata phân trang.
- **Định dạng phản hồi**:
  ```json
  {
    "success": true,
    "pagination": {
      "page": 1,
      "limit": 6,
      "totalItems": 18,
      "totalPages": 3
    },
    "data": [
      {
        "id": "uuid-1",
        "title": "Ngân hàng Nhà nước lấy ý kiến sửa đổi Nghị định 24 về quản lý thị trường vàng",
        "summary": "Dự thảo tập trung vào việc xóa bỏ độc quyền vàng miếng SJC và cấp phép nhập khẩu vàng nguyên liệu...",
        "source": "Cổng TTĐT Chính Phủ",
        "url": "https://baochinhphu.vn/...",
        "publishedAt": "2026-09-20T08:00:00.000Z"
      }
    ]
  }
  ```

### 5.4. `GET /api/cron/crawl`
- **Cơ chế bảo mật**: Kiểm tra header `Authorization: Bearer ${CRON_SECRET}`.
- **Xử lý**: Kích hoạt `CrawlerService.crawlAll()`, lưu dữ liệu mới vào DB, lưu `CrawlLog`, trả về số lượng bản ghi đã thu thập thành công.

---

## 6. Thiết kế Giao diện Người dùng (UI/UX)

1. **Thanh Market Ticker (Top)**:
   - Chạy trên đỉnh trang, cập nhật giá SJC và biên độ giao động tức thời.
2. **Khu vực Thẻ chỉ số tổng quan (Stat Cards)**:
   - Giá SJC Mua vào (kèm delta xanh/đỏ).
   - Giá SJC Bán ra (kèm delta xanh/đỏ).
   - Mức chênh lệch Mua - Bán (Spread).
   - Chỉ số trạng thái thị trường (Tăng / Giảm / Đi ngang).
3. **Biểu đồ biến động giá tương tác (Interactive Recharts)**:
   - Hai đường giá: Đường Vàng Hổ Phách (Giá Bán) và Đường Xanh Ngọc/Xám (Giá Mua).
   - Nút lọc thời gian: 7 ngày / 30 ngày.
   - Dropdown chọn loại vàng hiển thị (SJC Miếng, Vàng nhẫn 9999, DOJI...).
4. **Bảng giá thị trường chi tiết (Price Table)**:
   - Phân loại rõ theo từng đơn vị: SJC, DOJI, PNJ.
   - Thể hiện trực quan giá Mua, giá Bán, chênh lệch và xu hướng tăng/giảm bằng Icon mũi tên và màu sắc chuẩn tài chính.
5. **Trung tâm Tin tức & Chính sách (News & Policy Hub)**:
   - Hiển thị dạng lưới thẻ (Grid card).
   - Gắn nhãn cơ quan quản lý (NHNN, Bộ Tài Chính, Chính Phủ).
   - Phân trang gọn gàng.

---

## 7. Kế hoạch Kiểm thử & Đảm bảo Chất lượng

Tuân thủ nghiêm ngặt quy định tại `AGENTS.md`:

```
┌──────────────────────────────────────────────────────────────┐
│                    TESTING STRATEGY                          │
├──────────────────────────────┬───────────────────────────────┤
│ 1. Unit Tests                │ • Adapter HTML/JSON parsers   │
│                              │ • Fault tolerance handler     │
│                              │ • Delta calculation helper    │
├──────────────────────────────┼───────────────────────────────┤
│ 2. Integration Tests         │ • REST API routes logic       │
│                              │ • Pagination & filter query   │
├──────────────────────────────┼───────────────────────────────┤
│ 3. Build & Type Verification │ • TypeScript strict mode      │
│                              │ • Next.js production build    │
└──────────────────────────────┴───────────────────────────────┘
```

---

## 8. Phương án Triển khai & Vận hành Đám mây

1. **Vercel Deployment**:
   - `apps/web` được triển khai tự động lên Vercel.
   - Cấu hình file `vercel.json` thiết lập Vercel Cron trigger gọi định kỳ `/api/cron/crawl` mỗi giờ.
2. **Cơ sở dữ liệu Supabase**:
   - Khởi tạo project PostgreSQL miễn phí trên Supabase.
   - Thiết lập `DATABASE_URL` (kết nối qua connection pooler port 6543) và `DIRECT_URL` (kết nối trực tiếp port 5432).
3. **Docker hóa (Containerization)**:
   - Cung cấp `Dockerfile` đa tầng (multi-stage build) hỗ trợ đóng gói và triển khai trên bất kỳ nền tảng container nào (Docker, Render, VPS cá nhân).

---

## 9. Quy ước Quản lý Mã nguồn (Git Workflow)

- **Quy tắc bắt buộc**:
  1. Sau mỗi giai đoạn hoàn thành mã nguồn, tiến hành kiểm thử tự động đạt 100% pass.
  2. Tạo một Git commit tương ứng với thông điệp rõ ràng, tuân thủ chuẩn Conventional Commits (ví dụ: `feat(crawler): implement adapter pattern for sjc, doji, pnj`, `test(api): add tests for price delta calculations`).
