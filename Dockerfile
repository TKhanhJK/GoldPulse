# 1. Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
COPY packages/crawler/package.json ./packages/crawler/
COPY apps/web/package.json ./apps/web/

RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & Build shared packages
ENV DATABASE_URL="file:./dev.db"
RUN npm run generate --workspace=packages/database
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=apps/web

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web ./apps/web

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/web"]

