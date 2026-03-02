# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci                  

COPY . .
RUN npm run build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Chỉ install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output từ build stage
COPY --from=builder /app/dist ./dist

# Tạo thư mục cho uploaded files
RUN mkdir -p assets/users logs

# Chạy với non-root user (bảo mật)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "dist/index.js"]