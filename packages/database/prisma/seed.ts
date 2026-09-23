import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Đang bắt đầu quá trình Seed Dữ liệu GoldPulse ---');

  // 1. Dọn dẹp dữ liệu cũ nếu có
  await prisma.goldPrice.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.crawlLog.deleteMany({});

  console.log('-> Đã xóa dữ liệu cũ.');

  // 2. Seed Tin tức & Chính sách vàng tiêu biểu
  const newsList = [
    {
      title: 'Ngân hàng Nhà nước lấy ý kiến sửa đổi Nghị định 24/2012/NĐ-CP về quản lý thị trường vàng',
      summary: 'Dự thảo đề xuất sửa đổi cơ chế độc quyền sản xuất vàng miếng SJC, xem xét cấp phép nhập khẩu vàng nguyên liệu cho các doanh nghiệp đủ điều kiện nhằm tăng nguồn cung cho thị trường.',
      source: 'Cổng TTĐT Ngân hàng Nhà nước',
      url: 'https://sbv.gov.vn',
      publishedAt: new Date('2026-09-20T08:30:00Z'),
    },
    {
      title: 'Triển khai đồng bộ hóa đơn điện tử từng lần trong giao dịch mua bán vàng bạc',
      summary: 'Tổng cục Thuế tăng cường giám sát việc xuất hóa đơn điện tử khởi tạo từ máy tính tiền đối với các tiệm vàng, xử lý nghiêm tình trạng chênh lệch giá không minh bạch.',
      source: 'Bộ Tài Chính / Tổng Cục Thuế',
      url: 'https://gdt.gov.vn',
      publishedAt: new Date('2026-09-18T10:15:00Z'),
    },
    {
      title: '4 Ngân hàng Quốc doanh và SJC bán vàng miếng trực tiếp cho người dân',
      summary: 'Vietcombank, Agribank, BIDV, VietinBank và SJC tiếp tục triển khai đăng ký mua vàng trực tuyến, góp phần ổn định tâm lý thị trường và thu hẹp chênh lệch với giá quốc tế.',
      source: 'Báo Chính Phủ',
      url: 'https://baochinhphu.vn',
      publishedAt: new Date('2026-09-15T14:00:00Z'),
    },
    {
      title: 'Đề xuất nghiên cứu thành lập Sàn giao dịch vàng quốc gia tại Việt Nam',
      summary: 'Hiệp hội Kinh doanh Vàng kiến nghị xây dựng sàn giao dịch vàng tập trung nhằm minh bạch hóa thị trường, huy động nguồn vàng tích trữ trong dân vào sản xuất kinh doanh.',
      source: 'VnEconomy',
      url: 'https://vneconomy.vn',
      publishedAt: new Date('2026-09-12T09:00:00Z'),
    },
    {
      title: 'Tăng cường thanh tra, kiểm tra phòng chống đầu cơ và thao túng giá vàng',
      summary: 'Thanh tra Chính phủ phối hợp cùng NHNN và Bộ Công an kiểm tra liên ngành việc chấp hành chính sách pháp luật của các đơn vị kinh doanh vàng hàng đầu.',
      source: 'Báo Tiền Phong',
      url: 'https://tienphong.vn',
      publishedAt: new Date('2026-09-08T07:45:00Z'),
    },
    {
      title: 'Hội đồng Vàng Thế giới (WGC) công bố báo cáo nhu cầu tiêu thụ vàng quý 3',
      summary: 'Nhu cầu vàng tích sản tại khu vực Đông Nam Á và Việt Nam tiếp tục duy trì mức cao kỷ lục trong bối cảnh các ngân hàng trung ương thế giới tăng cường dự trữ ngoại hối.',
      source: 'World Gold Council',
      url: 'https://gold.org',
      publishedAt: new Date('2026-09-02T16:20:00Z'),
    },
  ];

  for (const item of newsList) {
    await prisma.news.create({ data: item });
  }
  console.log(`-> Đã seed ${newsList.length} tin tức & chính sách thị trường.`);

  // 3. Seed Dữ liệu Giá vàng 30 ngày qua (SJC, DOJI, PNJ)
  const symbols = [
    { symbol: 'SJC_1L', name: 'Vàng miếng SJC 1L - 10L', source: 'SJC', baseBuy: 87.5, baseSell: 89.5 },
    { symbol: 'SJC_NHAN', name: 'Vàng nhẫn SJC 99,99% (1 chỉ, 2 chỉ)', source: 'SJC', baseBuy: 86.8, baseSell: 88.2 },
    { symbol: 'DOJI_HN', name: 'DOJI Hà Nội (Vàng miếng)', source: 'DOJI', baseBuy: 87.5, baseSell: 89.5 },
    { symbol: 'DOJI_HCM', name: 'DOJI TP.HCM (Vàng miếng)', source: 'DOJI', baseBuy: 87.5, baseSell: 89.5 },
    { symbol: 'DOJI_NHAN', name: 'Nhẫn Tròn 9999 Hưng Thịnh Vượng', source: 'DOJI', baseBuy: 86.9, baseSell: 88.3 },
    { symbol: 'PNJ_24K', name: 'Vàng PNJ 24K', source: 'PNJ', baseBuy: 86.7, baseSell: 88.1 },
    { symbol: 'PNJ_TRANGSUC', name: 'Vàng nữ trang 999.9 PNJ', source: 'PNJ', baseBuy: 86.5, baseSell: 87.9 },
  ];

  const now = new Date();
  const pricesToCreate = [];

  // Tạo dữ liệu cho 30 ngày trước đến ngày hôm nay
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    // Độ lệch theo ngày (-1.5 đến +2.0)
    const trendFactor = Math.sin((30 - daysAgo) / 4) * 1.8 + ((30 - daysAgo) * 0.08);

    for (const item of symbols) {
      // Một chút nhiễu nhẹ giữa các nguồn
      const noise = (Math.random() - 0.5) * 0.2;
      const buy = Math.round((item.baseBuy + trendFactor + noise) * 10) / 10;
      const spread = item.symbol.includes('NHAN') ? 1.4 : 2.0;
      const sell = Math.round((buy + spread) * 10) / 10;

      pricesToCreate.push({
        symbol: item.symbol,
        name: item.name,
        source: item.source,
        buyPrice: buy,
        sellPrice: sell,
        createdAt: date,
      });
    }
  }

  // Thêm 1 phiên giá cập nhật cách đây vài tiếng để tạo delta cho ngày mới nhất
  const earlierToday = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  for (const item of symbols) {
    const buy = item.baseBuy + 0.3;
    const spread = item.symbol.includes('NHAN') ? 1.4 : 2.0;
    const sell = buy + spread;
    pricesToCreate.push({
      symbol: item.symbol,
      name: item.name,
      source: item.source,
      buyPrice: buy,
      sellPrice: sell,
      createdAt: earlierToday,
    });
  }

  // Thêm phiên giá hiện tại (cách 10 phút)
  const latestNow = new Date(now.getTime() - 10 * 60 * 1000);
  for (const item of symbols) {
    const delta = 0.5; // Tăng 0.5 triệu VNĐ
    const buy = item.baseBuy + 0.8;
    const spread = item.symbol.includes('NHAN') ? 1.4 : 2.0;
    const sell = buy + spread;
    pricesToCreate.push({
      symbol: item.symbol,
      name: item.name,
      source: item.source,
      buyPrice: buy,
      sellPrice: sell,
      createdAt: latestNow,
    });
  }

  for (const p of pricesToCreate) {
    await prisma.goldPrice.create({ data: p });
  }
  console.log(`-> Đã seed ${pricesToCreate.length} bản ghi lịch sử giá vàng 30 ngày.`);

  // 4. Seed Audit log crawl mẫu
  await prisma.crawlLog.create({
    data: {
      source: 'ALL',
      status: 'SUCCESS',
      itemsCount: symbols.length,
      createdAt: latestNow,
    },
  });

  console.log('--- Hoàn tất quá trình Seed Dữ liệu thành công 100%! ---');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
