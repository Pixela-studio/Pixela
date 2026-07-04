FROM oven/bun:1.3-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS runner
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["bun", "run", "dev"]
