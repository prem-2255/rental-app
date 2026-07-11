# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web-app
COPY web-app/package*.json ./
RUN npm ci
COPY web-app/ ./
RUN npm run build

# Stage 2: Serve Backend & Statically Compiled Frontend
FROM node:20-alpine
WORKDIR /app

# Copy Backend Dependencies and Code
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci
COPY backend/ ./

# Copy built frontend assets
COPY --from=frontend-builder /app/web-app/dist /app/web-app/dist

# Expose port and start
EXPOSE 5001
ENV PORT=5001
ENV NODE_ENV=production
RUN npx prisma generate

CMD ["npm", "run", "dev"]
