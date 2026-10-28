# syntax=docker/dockerfile:1
# Pin the base image. In real projects pin by digest too:  node:22-alpine@sha256:<digest>
ARG NODE_IMAGE=node:22-alpine

# ---- build stage: install production dependencies only ----
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---- runtime stage: no npm cache, no build tools, non-root ----
FROM ${NODE_IMAGE}
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=root:root /app/node_modules ./node_modules
COPY --chown=root:root package.json server.js ./
# Files are owned by root and not writable by the app user: a compromised process can't modify its own code.
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["node", "server.js"]
