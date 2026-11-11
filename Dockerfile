# Step 1: Build the React TypeScript application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL=""
ARG VITE_API_MODE="real"
ARG VITE_AUTH_TOKEN="Bearer mock-admin-token"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_MODE=$VITE_API_MODE
ENV VITE_AUTH_TOKEN=$VITE_AUTH_TOKEN

# Copy source code and build production distribution
COPY . .
RUN npm run build

# Step 2: Serve production assets via Nginx
FROM nginx:1.27-alpine

# Copy built distribution files to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with reverse proxy & SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

