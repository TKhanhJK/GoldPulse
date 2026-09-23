import { NextResponse } from 'next/server';
import { prisma } from '@goldpulse/database';
import { CreateAlertRequest } from '@goldpulse/types';
import { getUserFromRequest } from '@/lib/auth';

/**
 * GET /api/alerts - Lấy danh sách quy tắc cảnh báo của người dùng hiện tại
 */
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu đăng nhập để xem danh sách cảnh báo giá' },
        { status: 401 }
      );
    }

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        logs: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: alerts.map(a => ({
        id: a.id,
        userId: a.userId,
        symbol: a.symbol,
        targetPrice: a.targetPrice,
        condition: a.condition,
        channel: a.channel,
        isActive: a.isActive,
        lastTriggeredAt: a.lastTriggeredAt ? a.lastTriggeredAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
        logs: a.logs.map(l => ({
          id: l.id,
          sentPrice: l.sentPrice,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error('[GET ALERTS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi lấy danh sách cảnh báo' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts - Tạo quy tắc cảnh báo giá mới
 */
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu đăng nhập để thiết lập cảnh báo giá' },
        { status: 401 }
      );
    }

    const body: CreateAlertRequest = await request.json();
    const { symbol, targetPrice, condition } = body;

    if (!symbol || !targetPrice || !condition) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ: symbol, targetPrice, condition' },
        { status: 400 }
      );
    }

    if (targetPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'Mức giá mục tiêu phải lớn hơn 0' },
        { status: 400 }
      );
    }

    if (!['ABOVE', 'BELOW'].includes(condition)) {
      return NextResponse.json(
        { success: false, error: 'Điều kiện chỉ có thể là ABOVE hoặc BELOW' },
        { status: 400 }
      );
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        symbol,
        targetPrice: Number(targetPrice),
        condition,
        channel: 'EMAIL',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        isActive: alert.isActive,
        createdAt: alert.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[POST ALERTS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tạo cảnh báo giá' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts?id=xxx - Xóa quy tắc cảnh báo giá
 */
export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu đăng nhập' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số alert id' },
        { status: 400 }
      );
    }

    // Kiểm tra quyền sở hữu
    const alert = await prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cảnh báo không tồn tại hoặc không thuộc quyền quản lý của bạn' },
        { status: 404 }
      );
    }

    await prisma.priceAlert.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa cảnh báo giá thành công',
    });
  } catch (error) {
    console.error('[DELETE ALERTS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi xóa cảnh báo giá' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts?id=xxx - Bật / tắt kích hoạt quy tắc cảnh báo
 */
export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu đăng nhập' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Thiếu tham số alert id' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    const alert = await prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert || alert.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Cảnh báo không tồn tại hoặc không thuộc quyền sở hữu' },
        { status: 404 }
      );
    }

    const updated = await prisma.priceAlert.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error('[PATCH ALERTS ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi cập nhật trạng thái cảnh báo' },
      { status: 500 }
    );
  }
}
