# ─── Stage 1: Builder ────────────────────────────────────────────────────────
# Compile the Angular application into static assets using Node 20.
# We copy package files first to leverage Docker layer caching — npm ci only
# re-runs when package-lock.json changes, not on every source change.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
# Serve the compiled static files with Nginx. The final image contains only
# Nginx + the built assets — no Node.js, no source code, no node_modules.
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Angular 17+ builder outputs to dist/<project>/browser/
COPY --from=builder /app/dist/pateri-client/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
