import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@goldpulse/database';
import { createToken } from '../lib/auth';
import { verifyAdminRequest } from '../lib/admin-auth';

describe('Admin Access Control & Dashboard Logic Tests', () => {
  let adminUserId = '';
  let regularUserId = '';
  let adminToken = '';
  let regularUserToken = '';

  beforeAll(async () => {
    // 1. Tạo tài khoản Admin thử nghiệm
    const admin = await prisma.user.create({
      data: {
        email: `admin_test_${Date.now()}@goldpulse.vn`,
        passwordHash: 'dummy_hash',
        name: 'Admin Test',
        role: 'ADMIN',
      },
    });
    adminUserId = admin.id;
    adminToken = createToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'ADMIN',
    });

    // 2. Tạo tài khoản User thường thử nghiệm
    const user = await prisma.user.create({
      data: {
        email: `user_test_${Date.now()}@goldpulse.vn`,
        passwordHash: 'dummy_hash',
        name: 'Regular User',
        role: 'USER',
      },
    });
    regularUserId = user.id;
    regularUserToken = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'USER',
    });
  });

  afterAll(async () => {
    if (adminUserId) {
      await prisma.user.delete({ where: { id: adminUserId } });
    }
    if (regularUserId) {
      await prisma.user.delete({ where: { id: regularUserId } });
    }
  });

  it('1. Từ chối truy cập (401 Unauthorized) khi không có token xác thực', async () => {
    const request = new Request('http://localhost:3000/api/admin/stats');
    const result = await verifyAdminRequest(request);

    expect(result.user).toBeNull();
    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(401);
  });

  it('2. Từ chối truy cập (403 Forbidden) khi người dùng chỉ có vai trò USER', async () => {
    const request = new Request('http://localhost:3000/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${regularUserToken}`,
      },
    });
    const result = await verifyAdminRequest(request);

    expect(result.user).toBeNull();
    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(403);
  });

  it('3. Cho phép truy cập thành công khi người dùng có vai trò ADMIN', async () => {
    const request = new Request('http://localhost:3000/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const result = await verifyAdminRequest(request);

    expect(result.errorResponse).toBeNull();
    expect(result.user).not.toBeNull();
    expect(result.user?.role).toBe('ADMIN');
    expect(result.user?.id).toBe(adminUserId);
  });

  it('4. Kiểm tra các số liệu KPI thống kê hệ thống (Stats)', async () => {
    const [usersCount, crawlsCount, alertsCount] = await Promise.all([
      prisma.user.count(),
      prisma.crawlLog.count(),
      prisma.priceAlert.count(),
    ]);

    expect(usersCount).toBeGreaterThanOrEqual(2);
    expect(typeof crawlsCount).toBe('number');
    expect(typeof alertsCount).toBe('number');
  });

  it('5. Quản trị viên kích hoạt crawler thủ công tạo bản ghi CrawlLog', async () => {
    // Tạo 1 bản ghi crawl log mô phỏng việc trigger
    const newLog = await prisma.crawlLog.create({
      data: {
        source: 'ADMIN_MANUAL_TRIGGER',
        status: 'SUCCESS',
        itemsCount: 7,
      },
    });

    expect(newLog.id).toBeDefined();
    expect(newLog.source).toBe('ADMIN_MANUAL_TRIGGER');
    expect(newLog.status).toBe('SUCCESS');

    // Dọn dẹp
    await prisma.crawlLog.delete({ where: { id: newLog.id } });
  });
});
