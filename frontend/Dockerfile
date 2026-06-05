# Development image: runs the Vite dev server (with HMR) plus the OpenAPI
# client watcher. For production builds see Dockerfile.prod (Nginx + static).
FROM node:22-bookworm

WORKDIR /app

# Enable the pinned pnpm via corepack (reads the packageManager field).
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Copy manifests first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the application code
COPY . .

EXPOSE 5173

# start.sh runs `pnpm dev` + the openapi watcher; vite.config binds host:true
CMD ["./start.sh"]
