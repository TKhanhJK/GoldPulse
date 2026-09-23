# TÀI LIỆU THIẾT KẾ SẢN PHẨM: GOLDPULSE (MVP)

> **Dự án**: GoldPulse — Nền tảng theo dõi giá vàng Việt Nam & Tin tức chính sách  
> **Phiên bản**: MVP 1.0  
> **Mục tiêu**: Portfolio / Dự án thực tập kỹ thuật (Code sạch, kiến trúc chuẩn, chạy thực tế)

---

## 1. Tổng quan & Định vị Sản phẩm

### 1.1. Bối cảnh
Thị trường vàng tại Việt Nam có tính biến động cao và chịu ảnh hưởng trực tiếp từ các chính sách quản lý (Nghị định 24, đấu thầu vàng SJC, bán vàng bình ổn qua ngân hàng quốc doanh). Người mua và nhà đầu tư cần một công cụ tập trung để vừa xem biến động giá vàng (SJC, DOJI, vàng nhẫn), vừa theo dõi kịp thời các thông tin pháp lý, chính sách điều hành từ cơ quan quản lý.

### 1.2. Định vị sản phẩm
- **GoldPulse** là website cung cấp dữ liệu giá vàng cập nhật tự động, trực quan hóa xu hướng giá mua - bán và tổng hợp tin tức chính sách điều hành thị trường vàng Việt Nam.
- **Tôn chỉ kỹ thuật**: Ưu tiên mã nguồn sạch, phân tầng kiến trúc mạch lạc (Clean Architecture, Adapter Pattern), độ ổn định cao và sẵn sàng triển khai trên môi trường đám mây (cloud deployable).

---

## 2. Đối tượng Người dùng Mục tiêu

1. **Người theo dõi thị trường vàng cá nhân**: Cần xem nhanh giá mua - bán vàng hôm nay, mức chênh lệch (spread) và biến động trong tuần/tháng.
2. **Nhà đầu tư tích sản**: Cần phân tích xu hướng giá qua biểu đồ trực quan để chọn thời điểm giao dịch.
3. **Nhà tuyển dụng / Người đánh giá kỹ thuật (Tech Reviewer)**: Đánh giá tư duy thiết kế hệ thống, khả năng xử lý bất đồng bộ, bóc tách dữ liệu an toàn, thiết kế API RESTful và khả năng đóng gói sản phẩm.

---

## 3. Hệ thống 5 Tính năng Cốt lõi (MVP)

```
┌────────────────────────────────────────────────────────┐
│                      GOLDPULSE                         │
├──────────────────────────┬─────────────────────────────┤
│   Backend / Engine       │   Frontend / User Interface │
├──────────────────────────┼─────────────────────────────┤
│ 1. Crawler Engine        │ 3. Dashboard & Chart        │
│    (Adapter Pattern)     │    (Recharts 7d/30d)        │
│                          │                             │
│ 2. RESTful APIs          │ 4. News & Policy Hub        │
│    (/latest, /history)   │    (Pagination & Filtering) │
├──────────────────────────┴─────────────────────────────┤
│ 5. Deployment & Cloud Config (Vercel, Docker, SQLite)  │
└────────────────────────────────────────────────────────┘
```

### 3.1. Tính năng 1: Crawler tự động thu thập giá vàng
- **Mục tiêu**: Thu thập định kỳ dữ liệu giá vàng từ các đơn vị uy tín (SJC, DOJI, PNJ...).
- **Cơ chế kiến trúc**:
  - Áp dụng **Adapter Pattern**: Định nghĩa một chuẩn giao tiếp `IGoldPriceAdapter`. Mỗi nguồn dữ liệu là một Adapter độc lập.
  - Khi cần bổ sung nguồn mới (ví dụ: Bảo Tín Minh Châu, Phú Quý), chỉ cần viết thêm Adapter mới mà không cần chỉnh sửa logic lõi.
  - **Khả năng chịu lỗi (Fault Tolerance)**: Try/catch bọc từng adapter, ghi log chi tiết lỗi mạng/thay đổi DOM/API mà không làm sập tiến trình crawler.
- **Dữ liệu lưu trữ**:
  - Mã loại vàng (`symbol`), Tên hiển thị (`name`).
  - Giá mua (`buyPrice`), Giá bán (`sellPrice`).
  - Nguồn dữ liệu (`source`), Thời điểm cập nhật (`updatedAt`).

### 3.2. Tính năng 2: Bộ REST API chuẩn hóa
- **Mục tiêu**: Cung cấp dữ liệu sạch cho client và hỗ trợ mở rộng tích hợp sau này.
- **Các endpoint chính**:
  1. `GET /api/prices/latest`: Trả về danh sách giá hiện tại của tất cả loại vàng; tự động tính mức biến động (`deltaBuy`, `deltaSell`) so với phiên cập nhật gần nhất.
  2. `GET /api/prices/history?symbol=SJL1L10&range=7d|30d`: Trả về mảng chuỗi thời gian `{ timestamp, buyPrice, sellPrice }` phục vụ vẽ biểu đồ.
  3. `GET /api/news?page=1&limit=6`: Danh sách bài viết chính sách kèm metadata phân trang.
  4. `GET /api/cron/crawl`: Endpoint kích hoạt crawl định kỳ, bảo vệ bằng mã khóa bí mật `CRON_SECRET`.

### 3.3. Tính năng 3: Bảng điều khiển giá & Biểu đồ tương tác
- **Mục tiêu**: Giúp người dùng nắm bắt thông tin thị trường trong vòng 5 giây.
- **Các thành phần giao diện**:
  - **Market Ticker**: Thanh thông số nhanh trên đỉnh trang (giá SJC, mức tăng giảm trong ngày).
  - **Thẻ tổng quan (Stat Cards)**: Giá mua/bán SJC hiện tại, chênh lệch Mua - Bán (Spread), xu hướng thị trường.
  - **Biểu đồ biến động giá (Interactive Line Chart)**:
    - Hiển thị song song đường giá Mua và đường giá Bán.
    - Bộ lọc thời gian: 7 ngày qua / 30 ngày qua.
    - Bộ chọn loại vàng: SJC Miếng, Vàng nhẫn 9999, DOJI Hà Nội, DOJI HCM...
  - **Bảng giá chi tiết (Price Table)**:
    - Danh sách các thương hiệu & loại vàng.
    - Chỉ báo tăng/giảm bằng màu sắc (Xanh lá / Đỏ) và mũi tên xu hướng.

### 3.4. Tính năng 4: Trung tâm Tin tức & Chính sách Vàng
- **Mục tiêu**: Cung cấp góc nhìn bối cảnh pháp lý và chính sách vĩ mô tác động tới giá vàng.
- **Quy cách**:
  - Thẻ tin tức (News Card): Tiêu đề, tóm tắt ngắn (summary), cơ quan ban hành/nguồn báo chí, ngày công bố, liên kết nguồn gốc.
  - Dữ liệu ban đầu: Được seed trực tiếp với các chính sách quan trọng (sửa đổi Nghị định 24, quy định hóa đơn điện tử mua bán vàng, quản lý ngoại hối).
  - Hỗ trợ phân trang gọn gàng.

### 3.5. Tính năng 5: Đóng gói Triển khai & Vận hành Đám mây
- **Mục tiêu**: Sản phẩm chạy thực tế 100%, chi phí 0đ, cấu hình dễ dàng.
- **Kế hoạch triển khai**:
  - **Nền tảng**: Vercel (Hỗ trợ Fullstack Serverless Next.js + Vercel Cron chạy crawler mỗi giờ).
  - **Cơ sở dữ liệu**: SQLite (sẵn có cho môi trường Local / Container) hoặc Supabase/Neon PostgreSQL (khi triển khai production).
  - **Bộ cấu hình**:
    - `vercel.json`: Lên lịch Cron Job tự động.
    - `Dockerfile`: Hỗ trợ container hóa chạy trên Docker / Render / VPS.
    - `.env.example`: Hướng dẫn thiết lập biến môi trường.

---

## 4. Thiết kế Trải nghiệm Người dùng (UI/UX)

- **Phong cách thị giác (Visual Identity)**:
  - Màu chủ đạo: Vàng kim tài chính (Gold/Amber `#F59E0B`), Xám than cao cấp (Slate/Zinc `#0F172A`).
  - Phong cách hiện đại: Bo góc mềm mại, phân chia khối dữ liệu rõ ràng, badge trạng thái nổi bật.
- **Tính tương thích (Responsive)**:
  - Tối ưu trải nghiệm màn hình nhỏ (Mobile-first): Bảng giá có thể cuộn ngang nhẹ hoặc thu gọn thành dạng card trên smartphone; biểu đồ co giãn tự động theo kích thước màn hình.

---

## 5. Tiêu chuẩn Kỹ thuật & Chất lượng Mã nguồn

- **Ngôn ngữ & Kiểu dữ liệu**: TypeScript nghiêm ngặt (Strict mode), không dùng `any` bừa bãi.
- **Kiến trúc mã nguồn**: Tách biệt rõ ràng giữa Business Logic (Services/Adapters) và Presentation (Next.js Pages/Components).
- **Kiểm thử tự động**:
  - Unit test cho Adapter bóc tách dữ liệu & Crawler Engine.
  - Integration test cho các API Routes.
- **Quy trình Git**: Tạo commit rõ ràng sau mỗi giai đoạn hoàn thành theo nguyên tắc dự án.

