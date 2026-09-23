import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;

  // Nếu là cơ sở dữ liệu PostgreSQL từ Supabase / Neon, sử dụng trực tiếp
  if (envUrl && (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'))) {
    return envUrl;
  }

  // Nếu là SQLite (local development / testing)
  // Quét tìm file dev.db ở các vị trí khả dĩ trong monorepo
  const possiblePaths = [
    path.resolve(process.cwd(), 'packages/database/prisma/dev.db'),
    path.resolve(process.cwd(), '../../packages/database/prisma/dev.db'),
    path.resolve(process.cwd(), '../database/prisma/dev.db'),
    path.resolve(process.cwd(), 'prisma/dev.db'),
    path.resolve(process.cwd(), 'dev.db'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const normalizedPath = p.replace(/\\/g, '/');
      return `file:${normalizedPath}`;
    }
  }

  return envUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
