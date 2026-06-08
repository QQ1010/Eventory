FROM node:24-bookworm-slim AS backend-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-bookworm-slim AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY --from=backend-deps /app/node_modules ./node_modules
COPY --from=frontend-deps /app/frontend/node_modules ./frontend/node_modules

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.* ./frontend/
COPY frontend/index.html ./frontend/
COPY frontend/src ./frontend/src

RUN npm run build
RUN npm run frontend:build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["node", "dist/server.js"]